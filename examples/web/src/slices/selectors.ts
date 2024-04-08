import { OfflineSyncState } from 'redux-offline-sync';
import { OrdersState } from './ordersSlice';
import { PostsState } from './postsSlice';

interface CombinedState {
  readonly offlineSync?: OfflineSyncState;
  readonly orders: OrdersState;
  readonly posts: PostsState;
}

export const getOfflineSyncOutbox = (state: CombinedState) =>
  state.offlineSync?.outbox;
export const getOfflineSyncBusy = (state: CombinedState) =>
  state.offlineSync?.busy;
export const getOfflineSyncNetInfo = (state: CombinedState) =>
  state.offlineSync?.netInfo;
export const getOfflineSyncRetryScheduled = (state: CombinedState) =>
  state.offlineSync?.retryScheduled;
export const getOfflineSyncRetryCount = (state: CombinedState) =>
  state.offlineSync?.retryCount;
