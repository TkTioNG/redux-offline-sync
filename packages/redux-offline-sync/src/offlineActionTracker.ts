import { Config } from './types';

const subscriptions: Record<
  string,
  { resolve: (value: any) => void; reject: (error: any) => void }
> = {};

function registerAction(syncUuid: string) {
  return new Promise((resolve, reject) => {
    subscriptions[syncUuid] = { resolve, reject };
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
    subscription.reject(error);
    delete subscriptions[syncUuid];
  }
}

const offlineActionTracker = {
  registerAction,
  resolveAction,
  rejectAction,
} as Config['offlineActionTracker'];

export default offlineActionTracker;
