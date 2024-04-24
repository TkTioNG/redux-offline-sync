import { v4 as uuidv4 } from 'uuid';

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
  successBoxSize: 50,
  failureBoxSize: 50,
  generateSyncUuid: () => uuidv4(),
};

export default defaultConfig;
