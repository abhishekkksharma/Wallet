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
    return data;
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
        items: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
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
                state.items = action.payload;
            })
            .addCase(fetchCards.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // Add
            .addCase(addCard.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update
            .addCase(updateCard.fulfilled, (state, action) => {
                const index = state.items.findIndex(card => card.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteCard.fulfilled, (state, action) => {
                state.items = state.items.filter(card => card.id !== action.payload);
            });
    },
});

export default cardsSlice.reducer;
