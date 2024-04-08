import type { Config } from './types';
import defaultConfig from './defaults';
import offlineActionTracker from './offlineActionTracker';

export const applyDefaults = (config: Partial<Config> = {}): Config => ({
  ...defaultConfig,
  ...config,
  offlineActionTracker: offlineActionTracker,
});
