import { busy, scheduleRetry } from './actions';
import { JS_ERROR } from './constants';
import type { Config, OfflineAction, ResultAction } from './types';

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
  offlineSyncMeta: {
    offlineAction: OfflineAction;
  };
}

const complete = (
  action: CompleteAction /** @todo Check DefaultAction | ResultAction */,
  result: CompleteSuccessResult | CompleteFailResult,
  offlineAction: OfflineAction,
  config: Config
): ResultAction => {
  const { resolveAction, rejectAction } = config.offlineActionTracker;
  if (result.success) {
    resolveAction(offlineAction.offlineSyncMeta.syncUuid, result.payload);
  } else if (result.payload) {
    rejectAction(offlineAction.offlineSyncMeta.syncUuid, result.payload);
  }
  return {
    ...action,
    payload: result.payload,
    offlineSyncMeta: {
      ...action.offlineSyncMeta,
      success: result.success,
      completed: true,
    },
  };
};

const handleJsError = (error: Error | undefined | unknown): ResultAction => ({
  type: JS_ERROR,
  offlineSyncMeta: { error, success: false, completed: true },
});

const send = (
  action: OfflineAction,
  dispatch: (...any: any[]) => any,
  config: Config,
  retries: number = 0
) => {
  const offlineSyncMetadata = action.offlineSyncMeta.offline;
  dispatch(busy(true));
  return config
    .effect(offlineSyncMetadata.effect, action)
    .then((result) => {
      const commitAction = {
        type: `${action.type}_COMMIT`,
        // ...config.defaultCommit,
        offlineSyncMeta: {
          // ...config.defaultCommit.offlineSyncMeta,
          offlineAction: action,
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
        return dispatch(handleJsError(error));
      }
    })
    .catch(async (error) => {
      const rollbackAction = {
        type: `${action.type}_ROLLBACK`,
        // ...config.defaultRollback,
        offlineSyncMeta: {
          // ...config.defaultRollback.offlineSyncMeta,
          offlineAction: action,
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
          { success: false, payload: error },
          action,
          config
        )
      );
    })
    .finally(() => dispatch(busy(false)));
};

export default send;
