import { Config } from './types';
import { serializeError } from './utils';

const subscriptions: Record<
  string,
  { resolve: (value: any) => void; reject: (error: any) => void }
> = {};

function registerAction(syncUuid: string | undefined) {
  return new Promise((resolve, reject) => {
    subscriptions[syncUuid as string] = { resolve, reject };
  });
}

function resolveAction(syncUuid: string, value: any) {
  const subscription = subscriptions[syncUuid];
  if (subscription) {
    subscription.resolve(value);
    delete subscriptions[syncUuid];
  }
}

function rejectAction(syncUuid: string, error: any) {
  const subscription = subscriptions[syncUuid];
  if (subscription) {
    if (error instanceof Error) {
      subscription.reject(serializeError(error));
    } else {
      subscription.reject(error);
    }
    delete subscriptions[syncUuid];
  }
}

const offlineActionTracker: Config['offlineActionTracker'] = {
  registerAction,
  resolveAction,
  rejectAction,
};

export default offlineActionTracker;
