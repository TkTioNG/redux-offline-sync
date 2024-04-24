import { isNetInfoOnline } from '@/utils/common';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export default function useIsOnline() {
  const [isOnline, setOnline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netInfo) => {
      setOnline(isNetInfoOnline(netInfo));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isOnline;
}
