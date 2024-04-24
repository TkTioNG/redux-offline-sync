import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function useOnlineManager() {
  useEffect(() => {
    let netInfoListener = null;
    // React Query already supports on reconnect auto refetch in web browser
    if (Platform.OS !== 'web') {
      netInfoListener = NetInfo.addEventListener((state) => {
        onlineManager.setOnline(
          state.isConnected != null &&
            state.isConnected &&
            Boolean(state.isInternetReachable)
        );
      });
    }
    return () => {
      if (netInfoListener) {
        netInfoListener();
      }
    };
  }, []);
}
