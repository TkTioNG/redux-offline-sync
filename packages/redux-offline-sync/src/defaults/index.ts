import detectNetwork from './detectNetwork';
import effect from './effect';
import retry from './retry';
import discard from './discard';
import defaultCommit from './defaultCommit';
import defaultRollback from './defaultRollback';
import queue from './queue';
import type { Config } from '../types';

export default {
  detectNetwork,
  effect,
  retry,
  discard,
  defaultCommit,
  defaultRollback,
  queue,
} as Omit<Config, 'offlineActionTracker'>;
