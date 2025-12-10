import { configureStore } from '@reduxjs/toolkit';
import cardsReducer from './cards';
import foldersReducer from './folders';

export const store = configureStore({
    reducer: {
        cards: cardsReducer,
        folders: foldersReducer,
    },
});

