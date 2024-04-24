import { Button, StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useMutation, useQuery } from '@tanstack/react-query';
import { addTodoMutationOptions, getTodos } from '@/queries/todo';

export default function TabOneScreen() {
  const query = useQuery({ queryKey: ['todo'], queryFn: getTodos });

  const mutation = useMutation({
    mutationKey: ['addTodo'],
    ...addTodoMutationOptions,
  });

  console.log(query);
  console.log(query.data);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <Button
        title="Mutate it"
        onPress={() => {
          mutation.mutate({ time: new Date() });
        }}
      />
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
