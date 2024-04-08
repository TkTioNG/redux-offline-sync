import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY,
} from './constants';
import type { NetInfo } from './types';

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
