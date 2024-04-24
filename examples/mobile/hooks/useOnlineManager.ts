import { onlineManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import useIsOnline from './useIsOnline';

export default function useOnlineManager() {
  const isOnline = useIsOnline();

  useEffect(() => {
    // React Query already supports on reconnect auto refetch in web browser
    if (Platform.OS !== 'web') {
      onlineManager.setOnline(isOnline);
    }
  }, [isOnline]);
}
