import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../services/supabaseClient';

// Thunks
export const fetchFolders = createAsyncThunk('folders/fetchFolders', async (userId, { getState }) => {
    let targetUserId = userId;

    // Fallback if not passed (though it should be)
    if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        targetUserId = user.id;
    }

    const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return { data, userId: targetUserId };
});

export const addFolder = createAsyncThunk('folders/addFolder', async (name) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('folders')
        .insert([{ user_id: user.id, name }])
        .select()
        .single();

    if (error) throw error;
    return data;
});

export const deleteFolder = createAsyncThunk('folders/deleteFolder', async (folderId) => {
    const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

    if (error) throw error;
    return folderId;
});

// Slice
const foldersSlice = createSlice({
    name: 'folders',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
        ownerId: null, // Track which user these folders belong to
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFolders.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchFolders.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.data;
                state.ownerId = action.payload.userId;
            })
            .addCase(fetchFolders.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(addFolder.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(deleteFolder.fulfilled, (state, action) => {
                state.items = state.items.filter(folder => folder.id !== action.payload);
            })
            // Explicit Logout Handling
            .addCase('USER_LOGOUT', (state) => {
                state.items = [];
                state.status = 'idle';
                state.error = null;
                state.ownerId = null;
            });
    },
});

export default foldersSlice.reducer;
