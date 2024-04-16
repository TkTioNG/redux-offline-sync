import type {
  Config,
  OfflineQueueAction,
  OfflineSyncState,
  ResultAction,
} from '../types';

function enqueue(
  array: OfflineQueueAction[],
  item: OfflineQueueAction,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: { offlineSync: OfflineSyncState }
) {
  return [...array, item];
}

function dequeue(
  array: OfflineQueueAction[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  item: ResultAction,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: { offlineSync: OfflineSyncState }
) {
  const [, ...rest] = array;
  return rest;
}

function peek(
  array: OfflineQueueAction[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  item: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: { offlineSync: OfflineSyncState }
) {
  return array[0];
}

const queue: Config['queue'] = {
  enqueue,
  dequeue,
  peek,
};

export default queue;
