import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './slices';
import rootSaga from './sagas';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createOfflineSync } from 'redux-offline-sync';

function setupStore() {
  const sagaMiddleware = createSagaMiddleware();

  const persistConfig = {
    key: 'root',
    storage,
  };

  const { offlineSyncMiddleware, offlineSyncReducer, offlineSyncEnhancer } =
    createOfflineSync();

  const persistedReducer = persistReducer(
    persistConfig,
    offlineSyncReducer(rootReducer)
  );

  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(offlineSyncMiddleware, sagaMiddleware),
    enhancers: (getDefaultEnhancer) =>
      getDefaultEnhancer().prepend(offlineSyncEnhancer),
  });

  const persistor = persistStore(store);

  sagaMiddleware.run(rootSaga);

  return { store, persistor };
}

export default setupStore;
