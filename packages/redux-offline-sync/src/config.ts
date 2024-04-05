import type { Config } from './types';

const defaultConfig: Config = {};

export const applyDefaults = (config: Partial<Config> = {}): Config => ({
  ...defaultConfig,
  ...config,
});
