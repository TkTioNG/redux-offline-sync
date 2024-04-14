import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY,
  OFFLINE_ACTION_QUEUED,
} from './constants';
import type { NetInfo, OfflineAction, OfflineQueueAction } from './types';
import { getOfflineQueueType } from './utils';

export const updateNetworkStatus = (netInfo: NetInfo) => {
  return {
    type: OFFLINE_STATUS_CHANGED,
    payload: {
      netInfo,
    },
  };
};

export const scheduleRetry = (delay = 0) => ({
  type: OFFLINE_SCHEDULE_RETRY,
  payload: {
    delay,
  },
});

export const completeRetry = (action: any) => ({
  type: OFFLINE_COMPLETE_RETRY,
  payload: action,
});

export const busy = (isBusy: boolean) => ({
  type: OFFLINE_BUSY,
  payload: { busy: isBusy },
});

export const offlineQueued = (
  syncUuid: string,
  action: OfflineAction
): OfflineQueueAction => ({
  type: getOfflineQueueType(action.type),
  payload: action.payload,
  meta: {
    ...action.meta,
    offlineSync: {
      ...action.meta.offlineSync,
      syncUuid,
      type: OFFLINE_ACTION_QUEUED,
      originalType: action.type,
      queueOn: Date.now(),
    },
  },
});
