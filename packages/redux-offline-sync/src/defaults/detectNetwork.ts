import type { Config, NetInfo } from '../types';

const handle = (callback: (netInfo: NetInfo) => void, isConnected: boolean) => {
  // NetInfo is not supported in browsers, hence we only pass online status
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(() => callback({ isConnected }));
  } else {
    setTimeout(() => callback({ isConnected }), 0);
  }
};

const detectNetwork: Config['detectNetwork'] = (
  callback: (netInfo: NetInfo) => void
) => {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', () => handle(callback, true));
    window.addEventListener('offline', () => handle(callback, false));
    handle(callback, window.navigator.onLine);
  }
};

export default detectNetwork;
