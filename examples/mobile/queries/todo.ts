import { DefaultError, UseMutationOptions } from '@tanstack/react-query';
import uuid from 'react-native-uuid';

export const getTodos = async () => {
  const response = await fetch(
    'https://9eb782d9a2b3b36ec07d0e3e668d3209.m.pipedream.net'
  );
  const body = await response.json();

  return { ...body, time: new Date() };
};

export const updateTodo = async ({ time }: { time: Date }) => {
  const response = await fetch(
    'https://9eb782d9a2b3b36ec07d0e3e668d3209.m.pipedream.net',
    { method: 'POST', body: JSON.stringify({ time }) }
  );
  const body = await response.json();

  return { ...body, time };
};

export const addTodoMutationOptions: UseMutationOptions<
  unknown,
  DefaultError,
  { time: Date }
> = {
  mutationFn: updateTodo,
  onMutate: (variables) => {
    // A mutation is about to happen!
    console.log('onMutate', variables);
    // Optionally return a context containing data to use when for example rolling back
    return { ...variables, localId: uuid.v4() };
  },
  onError: (error, variables, context) => {
    // An error happened!
    console.error('AddTodo: onError', error, variables, context);
  },
  onSuccess: (data, variables, context) => {
    // Boom baby!
    console.debug('onSuccess', data, variables, context);
  },
  onSettled: (data, error, variables, context) => {
    // Error or success... doesn't matter!
    console.debug('onSettled', data, error, variables, context);
  },
  scope: {
    id: 'todo-id-mutate',
  },
};
