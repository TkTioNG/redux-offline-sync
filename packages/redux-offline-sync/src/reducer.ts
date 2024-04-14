import { Action, Reducer, UnknownAction } from 'redux';
import type {
  OfflineSyncState,
  ResultAction,
  Config,
  OfflineAction,
  PossibleOfflineSyncAction,
  OfflineQueueAction,
} from './types';
import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY,
  RESET_STATE,
  PERSIST_REHYDRATE,
  OFFLINE_ACTION_QUEUED,
} from './constants';

export const initialState: OfflineSyncState = {
  busy: false,
  lastSyncUuid: undefined,
  outbox: [],
  successBox: [],
  failureBox: [],
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

export const buildOfflineUpdater = ({
  dequeue,
  enqueue,
  successBoxSize,
  failureBoxSize,
}: {
  dequeue: Dequeue;
  enqueue: Enqueue;
  successBoxSize: Config['successBoxSize'];
  failureBoxSize: Config['failureBoxSize'];
}) =>
  function offlineSyncUpdater(
    state: OfflineSyncState | undefined = initialState,
    action: PossibleOfflineSyncAction
  ): OfflineSyncState {
    if (action.type === PERSIST_REHYDRATE) {
      return {
        ...state,
        ...action.payload?.offlineSync,
        busy: false,
      };
    }

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
    if ((action as OfflineAction).meta?.offlineSync) {
      if (
        (action as OfflineQueueAction).meta.offlineSync.type ===
        OFFLINE_ACTION_QUEUED
      ) {
        const offlineSync = state;
        return {
          ...state,
          lastSyncUuid: (action as OfflineQueueAction).meta.offlineSync
            .syncUuid,
          outbox: enqueue(offlineSync.outbox, action as OfflineQueueAction, {
            offlineSync,
          }),
        };
      }

      // Remove completed actions from queue (success or fail)
      if ((action as ResultAction).meta.offlineSync.completed) {
        const isSuccess = (action as ResultAction).meta.offlineSync.success;
        const offlineSync = state;
        return {
          ...state,
          outbox: dequeue(offlineSync.outbox, action as ResultAction, {
            offlineSync,
          }),
          successBox: isSuccess
            ? [...offlineSync.successBox, action as ResultAction].slice(
                -successBoxSize
              )
            : offlineSync.successBox,
          failureBox: isSuccess
            ? offlineSync.failureBox
            : [...offlineSync.failureBox, action as ResultAction].slice(
                -failureBoxSize
              ),
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
  const { successBoxSize, failureBoxSize } = config;
  const offlineSyncUpdater = buildOfflineUpdater({
    dequeue,
    enqueue,
    successBoxSize,
    failureBoxSize,
  });

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
