import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import Head from 'expo-router/head';
import BackgroundFetch from 'react-native-background-fetch';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

import { configureQueryClient } from './queries';
import { getTodos } from './queries/todo';
import { isNetInfoOnline, delay } from './utils/common';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

// Must be exported or Fast Refresh won't update the context
export function App() {
  console.log('Papaya');
  const ctx = require.context('./app');
  return (
    <Head.Provider>
      <ExpoRoot context={ctx} />
    </Head.Provider>
  );
}

registerRootComponent(App);

let storeUnsubsribe = null;

function checkHasPendingMutations(qc) {
  const hey = qc.getMutationCache().findAll({
    predicate: (mutation) =>
      mutation.state.status === 'pending' && mutation.state.isPaused,
  });
  console.log('---');
  console.log(hey);
  return hey.length > 0;
}

let MyHeadlessTask = async (event) => {
  // Get task id from event {}:
  let taskId = event.taskId;
  let isTimeout = event.timeout; // <-- true when your background-time has expired.
  if (isTimeout) {
    // This task has exceeded its allowed running-time.
    // You must stop what you're doing immediately finish(taskId)

    // Force stop all queries or mutations
    onlineManager.setOnline(false);
    // Make sure that updated mutations have time to dehydrate
    await delay(5);

    if (storeUnsubsribe) {
      console.log('[BackgroundFetch HeadlessTask] Unsubsribed');
      storeUnsubsribe();
      storeUnsubsribe = null;
    }

    console.log('[BackgroundFetch HeadlessTask] TIMEOUT:', taskId);
    BackgroundFetch.finish(taskId);
    return;
  }
  console.log('[BackgroundFetch HeadlessTask] start: ', taskId);

  try {
    console.log();
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    // console.log();
    const netInfo = await NetInfo.fetch();
    const isOnline = isNetInfoOnline(netInfo);

    onlineManager.setOnline(isOnline);

    if (!isOnline) {
      console.log('[BackgroundFetch HeadlessTask] not online: ', taskId);
      BackgroundFetch.finish(taskId);
      return;
    }

    // Create new queryClient because foreground instance may still be available in memory
    // and may cause duplicated mutations when persist yet again
    const { queryClient, persister } = configureQueryClient();

    let [unsubscribe, restorePromise] = persistQueryClient({
      queryClient,
      persister: persister,
    });

    storeUnsubsribe = unsubscribe;

    await restorePromise;

    // Check if the sync is already started
    // It is possible to have both headless and background task execute together
    // if (queryClient.isFetching() || queryClient.isMutating()) {
    //   console.log({
    //     isFetching: queryClient.isFetching(),
    //     isMutating: queryClient.isMutating(),
    //   });
    //   // Make sure that updated mutations have time to dehydrate
    //   await delay(2);
    //   console.log('[BackgroundFetch HeadlessTask] is working: ', taskId);
    //   BackgroundFetch.finish(taskId);
    //   return;
    // }

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
      });

    if (checkHasPendingMutations(queryClient)) {
      console.log('Not empty');
      const pp = new Promise((resolve) => {
        console.log('sub');
        const unun = queryClient.getMutationCache().subscribe((event) => {
          console.log(event.type);
          console.log(event.mutation);
          if (!checkHasPendingMutations(queryClient)) {
            unun();
            resolve();
          }
        });
      });
      queryClient.resumePausedMutations();
      await pp;
      // Make sure that updated mutations have time to dehydrate
      await delay(2);
    }
  } catch (e) {
    console.error('[BackgroundFetch HeadlessTask] error: ', e);
  } finally {
    if (storeUnsubsribe) {
      console.log('[BackgroundFetch HeadlessTask] Unsubsribed');
      storeUnsubsribe();
      storeUnsubsribe = null;
    }
  }
  console.log('[BackgroundFetch HeadlessTask] FINISH');
  // Required:  Signal to native code that your task is complete.
  // If you don't do this, your app could be terminated and/or assigned
  // battery-blame for consuming too much time in background.
  BackgroundFetch.finish(taskId);
};

// Register your BackgroundFetch HeadlessTask
BackgroundFetch.registerHeadlessTask(MyHeadlessTask);

console.log('Banana');
