import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from './supabaseClient';

// Thunks
export const fetchFolders = createAsyncThunk('folders/fetchFolders', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
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

// Slice
const foldersSlice = createSlice({
    name: 'folders',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFolders.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchFolders.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchFolders.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(addFolder.fulfilled, (state, action) => {
                state.items.push(action.payload);
            });
    },
});

export default foldersSlice.reducer;
