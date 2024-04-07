import type { Store } from 'redux';
import type {
  AppState,
  Config,
  OfflineAction,
  OfflineScheduleRetryAction,
  PossibleOfflineSyncAction,
} from './types';
import { OFFLINE_SEND, OFFLINE_SCHEDULE_RETRY } from './constants';
import { completeRetry } from './actions';
import send from './send';

const after = (timeout = 0) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

export const createOfflineSyncMiddleware =
  <S extends Store, A extends PossibleOfflineSyncAction>(config: Config) =>
  (store: S) =>
  (next: any) =>
  (action: A) => {
    // allow other middleware to do their things
    const result = next(action);
    let promise;

    // find any actions to send, if any
    const state: AppState = store.getState();
    const offline = state.offline;
    const context = { offline };
    const offlineAction = config.queue.peek(offline.outbox, action, context);

    // create promise to return on enqueue offline action
    if (
      action.offlineSyncMeta &&
      (action as OfflineAction).offlineSyncMeta.offline
    ) {
      const { registerAction } = config.offlineActionTracker;
      // registerAction(offline.lastSyncUuid);
      // promise = offline.lastSyncUuid // to return previous syncUuid to keep track
      promise = registerAction(offline.lastSyncUuid);
    }

    // if there are any actions in the queue that we are not
    // yet processing, send those actions
    if (
      offlineAction &&
      !offline.busy &&
      !offline.retryScheduled &&
      offline.netInfo.online
    ) {
      send(offlineAction, store.dispatch, config, offline.retryCount);
    }

    if (action.type === OFFLINE_SCHEDULE_RETRY) {
      after((action as OfflineScheduleRetryAction).payload.delay).then(() => {
        store.dispatch(completeRetry(offlineAction));
      });
    }

    if (action.type === OFFLINE_SEND && offlineAction && !offline.busy) {
      send(offlineAction, store.dispatch, config, offline.retryCount);
    }

    return promise || result;
  };
