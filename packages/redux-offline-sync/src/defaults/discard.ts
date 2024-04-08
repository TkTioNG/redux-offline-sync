import type { Config, OfflineAction } from '../types';
import { NetworkError } from './effect';

const discard: Config['discard'] = (
  error: typeof NetworkError,
  action: OfflineAction,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  retries: number = 0
): boolean => {
  // not a network error -> discard
  if (!('status' in error)) {
    return true;
  }

  // discard http 4xx errors
  return error.status >= 400 && error.status < 500;
};

export default discard;
