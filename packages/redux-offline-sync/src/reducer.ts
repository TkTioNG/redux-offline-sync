import type {
  OfflineStatusChangeAction,
  OfflineScheduleRetryAction,
  PersistRehydrateAction,
  OfflineSyncState,
  ResultAction,
  Config,
  OfflineBusyAction,
  OfflineAction,
} from './types';
import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY,
  RESET_STATE,
  PERSIST_REHYDRATE,
} from './constants';
import { Action, Reducer, UnknownAction } from 'redux';

export const initialState: OfflineSyncState = {
  busy: false,
  lastTransaction: 0,
  outbox: [],
  retryCount: 0,
  retryScheduled: false,
  netInfo: {
    online: false,
    isConnectionExpensive: undefined,
    reach: 'NONE',
  },
};

type Dequeue = Config['queue']['dequeue'];
type Enqueue = Config['queue']['enqueue'];

export const buildOfflineUpdater = (dequeue: Dequeue, enqueue: Enqueue) =>
  function offlineSyncUpdater(
    state: OfflineSyncState | undefined = initialState,
    action:
      | OfflineStatusChangeAction
      | OfflineScheduleRetryAction
      | OfflineBusyAction
      | ResultAction
      | OfflineAction
      | PersistRehydrateAction
      | UnknownAction
  ): OfflineSyncState {
    // Update online/offline status
    if (action.type === OFFLINE_STATUS_CHANGED) {
      return {
        ...state,
        netInfo: action.payload.netInfo,
      };
    }

    if (action.type === PERSIST_REHYDRATE && action.payload) {
      return {
        ...state,
        ...(action.payload.offline || {}),
        netInfo: state.netInfo,
        retryScheduled: initialState.retryScheduled,
        retryCount: initialState.retryCount,
        busy: initialState.busy,
      };
    }

    if (action.type === OFFLINE_SCHEDULE_RETRY) {
      return {
        ...state,
        retryScheduled: true,
        retryCount: state.retryCount + 1,
      };
    }

    if (action.type === OFFLINE_COMPLETE_RETRY) {
      return { ...state, retryScheduled: false };
    }

    if (action.type === OFFLINE_BUSY) {
      return { ...state, busy: action.payload.busy };
    }

    if (action.type === RESET_STATE) {
      return {
        ...initialState,
        netInfo: state.netInfo,
      };
    }

    // Add offline actions to queue
    if (action.offlineSyncMeta) {
      if ((action as OfflineAction).offlineSyncMeta.offline) {
        const transaction = state.lastTransaction + 1;
        const stamped = {
          ...action,
          offlineSyncMeta: { ...action.offlineSyncMeta, transaction },
        } as OfflineAction;
        const offline = state;
        return {
          ...state,
          lastTransaction: transaction,
          outbox: enqueue(offline.outbox, stamped, { offline }),
        };
      }

      // Remove completed actions from queue (success or fail)
      if ((action as ResultAction).offlineSyncMeta.completed) {
        const offline = state;
        return {
          ...state,
          outbox: dequeue(offline.outbox, action as ResultAction, { offline }),
          retryCount: 0,
        };
      }
    }

    return state;
  };

export const offlineSyncReducer = <S, A extends Action = UnknownAction>(
  reducer: Reducer<S, A>,
  config: Config
): Reducer<S & { offlineSync?: OfflineSyncState }, A> => {
  const { dequeue, enqueue } = config.queue;
  const offlineSyncUpdater = buildOfflineUpdater(dequeue, enqueue);

  return (
    state: (S & { offlineSync?: OfflineSyncState }) | undefined,
    action: A
  ) => {
    const { offlineSync, ...restState } = state ?? {};

    return {
      ...reducer(restState as S, action),
      offlineSync: offlineSyncUpdater(offlineSync, action),
    };
  };
};
