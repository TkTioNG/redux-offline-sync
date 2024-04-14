import type { UnknownAction } from 'redux';
import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  PERSIST_REHYDRATE,
  OFFLINE_BUSY,
} from './constants';

export type OfflineActionMeta = {
  effect: any;
  commit?: string;
  rollback?: string;
};

type OfflineQueueMeta = OfflineActionMeta & {
  type: string;
  originalType?: string;
  syncUuid: string;
  queueOn: number;
};

export type OfflineResultMeta = {
  success: boolean;
  completed: boolean;
  error?: Error | unknown;
  originalType?: string;
  syncUuid: string;
  queueOn: number;
  commitOn?: number;
  rollbackOn?: number;
};

export type ResultAction = {
  type: string;
  payload?: any;
  meta: {
    offlineSync: OfflineResultMeta;
  };
};

// User passed action
// it is impossible to use a type literal for it,
// since it can be any user passed string
export type OfflineAction = {
  type: string;
  payload?: any;
  meta: {
    offlineSync: OfflineActionMeta;
  };
};

// Queue action
export type OfflineQueueAction = {
  type: string;
  payload?: any;
  meta: {
    offlineSync: OfflineQueueMeta;
  };
};

export type NetInfo = {
  type?: string | null;
  isConnected: boolean;
  isConnectionExpensive?: boolean;
};

export type OfflineStatusChangeAction = {
  type: typeof OFFLINE_STATUS_CHANGED;
  payload: {
    netInfo: NetInfo;
  };
  meta?: {
    offlineSync: undefined;
  };
};

export type OfflineScheduleRetryAction = {
  type: typeof OFFLINE_SCHEDULE_RETRY;
  payload: {
    delay: number;
  };
  meta?: {
    offlineSync: undefined;
  };
};

export type OfflineBusyAction = {
  type: typeof OFFLINE_BUSY;
  payload: {
    busy: boolean;
  };
  meta?: {
    offlineSync: undefined;
  };
};

export type PossibleOfflineSyncAction =
  | OfflineStatusChangeAction
  | OfflineScheduleRetryAction
  | OfflineBusyAction
  | ResultAction
  | OfflineAction
  | OfflineQueueAction
  | PersistRehydrateAction
  | UnknownAction;

export type Outbox = Array<OfflineQueueAction>;

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
    offlineSync: OfflineSyncState;
  };
  meta?: {
    offlineSync: undefined;
  };
};

export type AppState = {
  offlineSync: OfflineSyncState;
};

export type NetworkCallback = (netInfo: NetInfo) => void;

export interface Config {
  detectNetwork: (callback: NetworkCallback) => void;
  effect: (effect: any, action: OfflineAction) => Promise<any>;
  retry: (action: OfflineAction, retries: number) => number | null | undefined;
  discard: (error: any, action: OfflineAction, retries: number) => boolean;
  queue: {
    enqueue: (
      array: Array<OfflineQueueAction>,
      item: OfflineQueueAction,
      context: { offlineSync: OfflineSyncState }
    ) => Array<OfflineQueueAction>;
    dequeue: (
      array: Array<OfflineQueueAction>,
      item: ResultAction,
      context: { offlineSync: OfflineSyncState }
    ) => Array<OfflineQueueAction>;
    peek: (
      array: Array<OfflineQueueAction>,
      item: any,
      context: { offlineSync: OfflineSyncState }
    ) => OfflineQueueAction;
  };
  offlineActionTracker: {
    registerAction: (
      syncUuid: string | undefined
    ) => Promise<any> | (() => void);
    resolveAction: (syncUuid: string, payload: any) => void | (() => void);
    rejectAction: (syncUuid: string, payload: any) => void | (() => void);
  };
}
