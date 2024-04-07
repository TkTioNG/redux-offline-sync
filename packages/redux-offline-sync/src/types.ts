import type { UnknownAction } from 'redux';
import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  PERSIST_REHYDRATE,
  OFFLINE_BUSY,
} from './constants';

export type ResultAction = {
  type: string;
  payload?: any;
  offlineSyncMeta: {
    // offline?: any;
    success: boolean;
    completed: boolean;
    error?: Error | unknown;
  };
};

export type OfflineMetadata = {
  effect: any;
  commit?: ResultAction;
  rollback?: ResultAction;
};

// User passed action
// it is impossible to use a type literal for it,
// since it can be any user passed string
export type OfflineAction = {
  type: string;
  payload?: any;
  offlineSyncMeta: {
    syncUuid: string;
    offline: OfflineMetadata;
  };
};

export type NetInfo = {
  online: boolean;
  isConnectionExpensive?: boolean;
  reach?: string;
};

export type OfflineStatusChangeAction = {
  type: typeof OFFLINE_STATUS_CHANGED;
  payload: {
    netInfo: NetInfo;
  };
  offlineSyncMeta: undefined;
};

export type OfflineScheduleRetryAction = {
  type: typeof OFFLINE_SCHEDULE_RETRY;
  payload: {
    delay: number;
  };
  offlineSyncMeta: undefined;
};

export type OfflineBusyAction = {
  type: typeof OFFLINE_BUSY;
  payload: {
    busy: boolean;
  };
  offlineSyncMeta: undefined;
};

export type PossibleOfflineSyncAction =
  | OfflineStatusChangeAction
  | OfflineScheduleRetryAction
  | OfflineBusyAction
  | ResultAction
  | OfflineAction
  | PersistRehydrateAction
  | UnknownAction;

export type Outbox = Array<OfflineAction>;

export type OfflineSyncState = {
  busy: boolean;
  lastSyncUuid?: string;
  outbox: Outbox;
  netInfo: NetInfo;
  retryCount: number;
  retryScheduled: boolean;
};

export type PersistRehydrateAction = {
  type: typeof PERSIST_REHYDRATE;
  payload: {
    offline: OfflineSyncState;
  };
  offlineSyncMeta: undefined;
};

export type AppState = {
  offline: OfflineSyncState;
};

export type NetworkCallback = (result: NetInfo) => void;

export interface Config {
  detectNetwork: (callback: NetworkCallback) => void;
  effect: (effect: any, action: OfflineAction) => Promise<any>;
  retry: (action: OfflineAction, retries: number) => number | null | undefined;
  discard: (error: any, action: OfflineAction, retries: number) => boolean;
  queue: {
    enqueue: (
      array: Array<OfflineAction>,
      item: OfflineAction,
      context: { offline: OfflineSyncState }
    ) => Array<OfflineAction>;
    dequeue: (
      array: Array<OfflineAction>,
      item: ResultAction,
      context: { offline: OfflineSyncState }
    ) => Array<OfflineAction>;
    peek: (
      array: Array<OfflineAction>,
      item: any,
      context: { offline: OfflineSyncState }
    ) => OfflineAction;
  };
  offlineActionTracker: {
    registerAction: (
      syncUuid: string | undefined
    ) => Promise<any> | (() => void);
    resolveAction: (syncUuid: string, payload: any) => void | (() => void);
    rejectAction: (syncUuid: string, payload: any) => void | (() => void);
  };
}
