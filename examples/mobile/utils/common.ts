import { NetInfoState } from '@react-native-community/netinfo';

export const isNetInfoOnline = (netInfo: NetInfoState) =>
  netInfo.isConnected != null &&
  netInfo.isConnected &&
  Boolean(netInfo.isInternetReachable);

export function delay(second: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, second * 1000);
  });
}
