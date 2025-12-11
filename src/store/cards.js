import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../services/supabaseClient';

// Thunks
export const fetchCards = createAsyncThunk('cards/fetchCards', async (folderId = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

    if (folderId) {
        query = query.eq('folder_id', folderId);
    }

    const { data, error } = await query;

    if (error) throw error;
    // Return folderId along with data so reducer knows where to put it
    return { folderId, data };
});

export const addCard = createAsyncThunk('cards/addCard', async ({ frontImage, backImage, folderId } = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let targetFolderId = folderId;

    // If no folderId provided, find or create default folder
    if (!targetFolderId) {
        const defaultFolderName = `${user.user_metadata.full_name || 'User'}'s cards`;

        // Check if default folder exists
        const { data: existingFolders } = await supabase
            .from('folders')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', defaultFolderName)
            .single();

        if (existingFolders) {
            targetFolderId = existingFolders.id;
        } else {
            // Create default folder
            const { data: newFolder, error: folderError } = await supabase
                .from('folders')
                .insert([{ user_id: user.id, name: defaultFolderName }])
                .select()
                .single();

            if (folderError) throw folderError;
            targetFolderId = newFolder.id;
        }
    }

    const { data, error } = await supabase
        .from('cards')
        .insert([{
            user_id: user.id,
            front_image: frontImage || null,
            back_image: backImage || null,
            folder_id: targetFolderId
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
});

export const updateCard = createAsyncThunk('cards/updateCard', async ({ id, updates }) => {
    const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
});

export const deleteCard = createAsyncThunk('cards/deleteCard', async (id) => {
    const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return id;
});

// Slice
const cardsSlice = createSlice({
    name: 'cards',
    initialState: {
        items: {}, // Structure: { [folderId]: [Card, Card, ...] }
        status: 'idle', // global status
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCards.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCards.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const { folderId, data } = action.payload;
                if (folderId) {
                    state.items[folderId] = data;
                }
            })
            .addCase(fetchCards.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // Add
            .addCase(addCard.fulfilled, (state, action) => {
                const card = action.payload;
                if (card.folder_id) {
                    if (!state.items[card.folder_id]) {
                        state.items[card.folder_id] = [];
                    }
                    state.items[card.folder_id].push(card);
                }
            })
            // Update
            .addCase(updateCard.fulfilled, (state, action) => {
                const card = action.payload;
                if (state.items[card.folder_id]) {
                    const index = state.items[card.folder_id].findIndex(c => c.id === card.id);
                    if (index !== -1) {
                        state.items[card.folder_id][index] = card;
                    }
                }
            })
            // Delete
            .addCase(deleteCard.fulfilled, (state, action) => {
                // Since we only get the ID, we have to search through all folders
                // Optimization: We could pass folderId to deleteCard if available
                const id = action.payload;
                Object.keys(state.items).forEach(folderId => {
                    state.items[folderId] = state.items[folderId].filter(card => card.id !== id);
                });
            })
            // Explicit Logout Handling
            .addCase('USER_LOGOUT', (state) => {
                state.items = {};
                state.status = 'idle';
                state.error = null;
            });
    },
});

export default cardsSlice.reducer;
