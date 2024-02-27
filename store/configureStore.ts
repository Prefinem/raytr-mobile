import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import categoriesSlice from './categories';
import itemsSlice from './items';
import ratingsSlice from './ratings';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // blacklist: ['navigation', 'addCategory'],
};

const rootReducer = combineReducers({
  categories: categoriesSlice,
  items: itemsSlice,
  ratings: ratingsSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

export const persistedStore = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
