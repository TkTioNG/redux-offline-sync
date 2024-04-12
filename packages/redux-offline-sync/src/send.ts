import { busy, scheduleRetry } from './actions';
import { JS_ERROR } from './constants';
import type { Config, OfflineQueueAction, ResultAction } from './types';
import {
  getOfflineCommitType,
  getOfflineRollbackType,
  serializeError,
} from './utils';

type CompleteSuccessResult = {
  success: true;
  payload: any;
};

type CompleteFailResult = {
  success: false;
  payload?: Error;
};

interface CompleteAction {
  type: string;
  meta: {
    offlineSync: {
      syncUuid: string;
    };
  };
}

const complete = (
  action: CompleteAction /** @todo Check DefaultAction | ResultAction */,
  result: CompleteSuccessResult | CompleteFailResult,
  offlineAction: OfflineQueueAction,
  config: Config
): ResultAction => {
  const { resolveAction, rejectAction } = config.offlineActionTracker;
  if (result.success) {
    resolveAction(
      offlineAction.meta.offlineSync.syncUuid as string,
      result.payload
    );
  } else if (result.payload) {
    rejectAction(
      offlineAction.meta.offlineSync.syncUuid as string,
      result.payload
    );
  }
  return {
    ...action,
    payload: result.payload,
    meta: {
      ...action.meta,
      offlineSync: {
        ...action.meta.offlineSync,
        originalType: offlineAction.meta.offlineSync.originalType,
        success: result.success,
        completed: true,
      },
    },
  };
};

const handleJsError = (
  error: Error | undefined | unknown,
  syncUuid: string
): ResultAction => ({
  type: JS_ERROR,
  meta: {
    offlineSync: {
      error: error instanceof Error ? serializeError(error) : error,
      success: false,
      completed: true,
      syncUuid,
    },
  },
});

const send = (
  action: OfflineQueueAction,
  dispatch: (...any: any[]) => any,
  config: Config,
  retries: number = 0
) => {
  const offlineSyncMetadata = action.meta.offlineSync;
  dispatch(busy(true));
  return config
    .effect(offlineSyncMetadata.effect, action)
    .then((result) => {
      const commitAction = {
        type:
          offlineSyncMetadata.commit ??
          getOfflineCommitType(offlineSyncMetadata.originalType ?? action.type),
        meta: {
          ...action.meta,
          offlineSync: {
            syncUuid: offlineSyncMetadata.syncUuid as string,
          },
        },
      };
      try {
        return dispatch(
          complete(
            commitAction,
            { success: true, payload: result },
            action,
            config
          )
        );
      } catch (error) {
        return dispatch(
          handleJsError(error, offlineSyncMetadata.syncUuid as string)
        );
      }
    })
    .catch(async (error) => {
      const rollbackAction = {
        type:
          offlineSyncMetadata.rollback ??
          getOfflineRollbackType(
            offlineSyncMetadata.originalType ?? action.type
          ),
        meta: {
          ...action.meta,
          offlineSync: {
            syncUuid: offlineSyncMetadata.syncUuid as string,
          },
        },
      };

      // discard
      let mustDiscard = true;
      try {
        mustDiscard = await config.discard(error, action, retries);
      } catch (e) {
        console.warn(e);
      }

      if (!mustDiscard) {
        const delay = config.retry(action, retries);
        if (delay != null) {
          return dispatch(scheduleRetry(delay));
        }
      }

      return dispatch(
        complete(
          rollbackAction,
          {
            success: false,
            payload: error instanceof Error ? serializeError(error) : error,
          },
          action,
          config
        )
      );
    })
    .finally(() => dispatch(busy(false)));
};

export default send;
