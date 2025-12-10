import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import cardsReducer from './cards';
import foldersReducer from './folders';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['cards', 'folders'] // persist both cards and folders
};

const rootReducer = combineReducers({
    cards: cardsReducer,
    folders: foldersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(store);

