import type { Middleware } from 'redux';
import type {
  AppState,
  Config,
  OfflineAction,
  OfflineQueueAction,
  OfflineScheduleRetryAction,
  PossibleOfflineSyncAction,
} from './types';
import {
  OFFLINE_SEND,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_ACTION_QUEUED,
} from './constants';
import { completeRetry, offlineQueued } from './actions';
import send from './send';

const after = (timeout = 0) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

export const createOfflineSyncMiddleware =
  (config: Config): Middleware =>
  (store) =>
  (next) =>
  // @ts-expect-error Action being considered as unknown
  (action: PossibleOfflineSyncAction) => {
    // allow other middleware to do their things
    const result = next(action);
    let promise;

    // find any actions to send, if any
    const state: AppState = store.getState();
    const offlineSync = state.offlineSync;
    const context = { offlineSync };
    const offlineAction = config.queue.peek(
      offlineSync.outbox,
      action,
      context
    );

    // create promise to return on enqueue offline action
    if (
      action.meta &&
      (action as OfflineAction).meta.offlineSync &&
      (action as OfflineAction).meta.offlineSync.effect &&
      (action as OfflineQueueAction).meta.offlineSync.type !==
        OFFLINE_ACTION_QUEUED
    ) {
      const { registerAction } = config.offlineActionTracker;
      // registerAction(offlineSync.lastSyncUuid);
      // promise = offlineSync.lastSyncUuid; // to return previous syncUuid to keep track
      // promise = registerAction(offlineSync.lastSyncUuid);
      const syncUuid = config.generateSyncUuid();
      registerAction(syncUuid);
      store.dispatch(offlineQueued(syncUuid, action as OfflineAction));
      promise = syncUuid; // to return previous syncUuid to keep track
    }

    // if there are any actions in the queue that we are not
    // yet processing, send those actions
    if (
      offlineAction &&
      !offlineSync.busy &&
      !offlineSync.retryScheduled &&
      offlineSync.netInfo.isConnected
    ) {
      send(offlineAction, store.dispatch, config, offlineSync.retryCount);
    }

    if (action.type === OFFLINE_SCHEDULE_RETRY) {
      after((action as OfflineScheduleRetryAction).payload.delay).then(() => {
        store.dispatch(completeRetry(offlineAction));
      });
    }

    if (action.type === OFFLINE_SEND && offlineAction && !offlineSync.busy) {
      send(offlineAction, store.dispatch, config, offlineSync.retryCount);
    }

    return promise || result;
  };
