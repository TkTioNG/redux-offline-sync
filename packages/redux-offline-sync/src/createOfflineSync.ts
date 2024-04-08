import { Reducer, StoreEnhancer } from 'redux';
import type { Config } from './types';
import { createOfflineSyncMiddleware } from './middleware';
import { offlineSyncReducer } from './reducer';
import { applyDefaults } from './config';
import { updateNetworkStatus } from './actions';

export const createOfflineSync = (userConfig: Partial<Config> = {}) => {
  const config = applyDefaults(userConfig);

  const offlineSyncEnhancer: StoreEnhancer =
    (createStore) => (reducer, preloadedState) => {
      // create store
      const store = createStore(reducer, preloadedState);

      // launch network detector
      if (config.detectNetwork) {
        config.detectNetwork((netInfo) => {
          // @ts-expect-error The action type should be correct
          store.dispatch(updateNetworkStatus(netInfo));
        });
      }

      return store;
    };

  return {
    offlineSyncMiddleware: createOfflineSyncMiddleware(config),
    offlineSyncReducer(reducer: Reducer) {
      return offlineSyncReducer(reducer, config);
    },
    offlineSyncEnhancer,
  };
};
