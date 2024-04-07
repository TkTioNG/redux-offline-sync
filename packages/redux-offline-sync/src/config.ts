import type { Config } from './types';
import defaults from './defaults';
import offlineActionTracker from './offlineActionTracker';

export const applyDefaults = (config: Partial<Config> = {}): Config => ({
  ...defaults,
  ...config,
  offlineActionTracker: offlineActionTracker,
});
