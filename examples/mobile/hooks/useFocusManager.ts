import { focusManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

export default function useFocusManager() {
  useEffect(() => {
    let subscription = null;
    // React Query already supports in web browser refetch on window focus by default
    if (Platform.OS !== 'web') {
      subscription = AppState.addEventListener('change', (status) => {
        focusManager.setFocused(status === 'active');
      });
    }
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);
}
