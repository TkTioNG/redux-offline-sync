import detectNetwork from './detectNetwork';
import effect from './effect';
import retry from './retry';
import discard from './discard';
import queue from './queue';
import type { Config } from '../types';

const defaultConfig: Omit<Config, 'offlineActionTracker'> = {
  detectNetwork,
  effect,
  retry,
  discard,
  queue,
};

export default defaultConfig;
