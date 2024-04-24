import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { addTodoMutationOptions } from './todo';

export const configureQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 24 * 60 * 60 * 1000,
        networkMode: 'offlineFirst',
        staleTime: 60 * 60 * 1000,
      },
      mutations: {
        gcTime: Infinity,
        networkMode: 'online',
        retry: 2,
        onError(e, v, c) {
          console.error('Any mutation ERROR', e, v, c);
        },
        onSuccess(d, v, c) {
          console.warn('Any mutation success', d, v, c);
        },
      },
    },
  });

  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
  });

  queryClient.setMutationDefaults(['addTodo'], addTodoMutationOptions);

  return { queryClient, persister };
};
