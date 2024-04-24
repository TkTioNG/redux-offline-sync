import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { useColorScheme } from '@/components/useColorScheme';
import BackgroundFetch from 'react-native-background-fetch';
import { configureQueryClient } from '@/queries';
import { getTodos } from '@/queries/todo';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import useOnlineManager from '@/hooks/useOnlineManager';
import useFocusManager from '@/hooks/useFocusManager';
import { onlineManager } from '@tanstack/react-query';
import useIsOnline from '@/hooks/useIsOnline';
import { AppState } from 'react-native';
import { delay } from '@/utils/common';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

const { queryClient, persister } = configureQueryClient();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [isQueryPersisted, setIsQueryPersisted] = useState(false);

  useOnlineManager();
  useFocusManager();
  const isOnline = useIsOnline();

  useEffect(() => {
    const initBackgroundFetch = async () => {
      const onEvent = async (taskId: string) => {
        console.log();
        console.log('[BackgroundFetch] ', taskId);

        if (AppState.currentState === 'active') {
          // @todo check to resume paused mutations? (may not be necessary)
          console.log('[BackgroundFetch] finish on foreground', taskId);
          BackgroundFetch.finish(taskId);
          return;
        }
        // Check if the sync is already started
        // It is possible to have both headless and background task execute together
        try {
          // Trigger any prefetches
          const query = queryClient.prefetchQuery({
            queryKey: ['todo'],
            queryFn: getTodos,
            staleTime: 0, // If set to 0, it will force fetch immediately if online
          });
          // May be can await together with mutation
          await query;
          // @note Will need to wait a bit to make sure that
          // latest query data is write onto the persister
          console.log('Prefetch configured');

          queryClient
            .getQueryCache()
            .getAll()
            .map((gc) => {
              console.log('+');
              console.log(JSON.stringify(gc, null, 2));
            });
          queryClient
            .getMutationCache()
            .getAll()
            .map((mc) => {
              console.log('-');
              console.log(JSON.stringify(mc, null, 2));
              console.log(mc);
            });
        } catch (e) {
          console.error('[BackgroundFetch] fetch ERROR', e);
        }
        await delay(2);
        console.log(queryClient.getQueryData(['todo']));
        BackgroundFetch.finish(taskId);
      };
      const onTimeout = async (taskId: string) => {
        console.log();
        console.log('[BackgroundFetch] TIMEOUT: ', taskId);
        await delay(2);
        console.log();
        BackgroundFetch.finish(taskId);
      };
      const status = await BackgroundFetch.configure(
        {
          minimumFetchInterval: 1,
          stopOnTerminate: false,
          startOnBoot: true,
          enableHeadless: true,
          // forceAlarmManager: true,
        },
        onEvent,
        onTimeout
      );

      console.log('[BackgroundFetch] configure status: ', status);
    };
    initBackgroundFetch();
  }, []);

  useEffect(() => {
    console.log('onlineManager');
    console.log(onlineManager.isOnline());
    if (isQueryPersisted && isOnline) {
      console.log('Resumed');
      queryClient.resumePausedMutations();
    } else {
      console.log('Not resumed');
    }
  }, [isOnline, isQueryPersisted]);

  console.log('Doggo');

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 24 * 60 * 60 * 1000,
        }}
        onSuccess={() => {
          console.log('PersistQueryClientProvider onSuccess');
          console.log(
            JSON.stringify(queryClient.getQueryCache().getAll(), null, 2)
          );
          console.log(
            JSON.stringify(queryClient.getMutationCache().getAll(), null, 2)
          );
          setIsQueryPersisted(true);
        }}
      >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
}
