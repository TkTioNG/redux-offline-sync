import { Action, Reducer, UnknownAction } from 'redux';
import { v4 as uuidv4 } from 'uuid';
import type {
  OfflineSyncState,
  ResultAction,
  Config,
  OfflineAction,
  PossibleOfflineSyncAction,
} from './types';
import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY,
  RESET_STATE,
  PERSIST_REHYDRATE,
} from './constants';

export const initialState: OfflineSyncState = {
  busy: false,
  lastSyncUuid: undefined,
  outbox: [],
  retryCount: 0,
  retryScheduled: false,
  netInfo: {
    isConnected: false,
    type: 'none',
    isConnectionExpensive: undefined,
  },
};

type Dequeue = Config['queue']['dequeue'];
type Enqueue = Config['queue']['enqueue'];

export const buildOfflineUpdater = (dequeue: Dequeue, enqueue: Enqueue) =>
  function offlineSyncUpdater(
    state: OfflineSyncState | undefined = initialState,
    action: PossibleOfflineSyncAction
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
        ...(action.payload.offlineSync || {}),
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
      if ((action as OfflineAction).offlineSyncMeta.offlineSync) {
        const syncUuid = uuidv4();
        const stamped = {
          ...action,
          offlineSyncMeta: { ...action.offlineSyncMeta, syncUuid },
        } as OfflineAction;
        const offlineSync = state;
        return {
          ...state,
          lastSyncUuid: syncUuid,
          outbox: enqueue(offlineSync.outbox, stamped, { offlineSync }),
        };
      }

      // Remove completed actions from queue (success or fail)
      if ((action as ResultAction).offlineSyncMeta.completed) {
        const offlineSync = state;
        return {
          ...state,
          outbox: dequeue(offlineSync.outbox, action as ResultAction, {
            offlineSync,
          }),
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
