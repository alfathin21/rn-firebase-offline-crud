import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRepository } from '@/hooks/useRepository';
import { TodoItem } from '@/components/todos/TodoItem';
import { AddTodoButton } from '@/components/todos/AddTodoButton';
import { SyncStatus } from '@/components/todos/SyncStatus';
import { SyncButton } from '@/components/todos/SyncButton';
import { NetworkStatusIndicator } from '@/components/todos/NetworkStatusIndicator';
import { SyncToast } from '@/components/todos/SyncToast';
import { ConflictList } from '@/components/todos/ConflictList';
import { Todo } from '@/types';

export default function HomeScreen() {
  const {
    initialized,
    loading,
    error,
    getAllTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    getSyncStats,
    clearError
  } = useRepository();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [syncStats, setSyncStats] = useState({
    total: 0,
    synced: 0,
    pending: 0,
    conflicts: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (initialized) {
      loadData();
    }
  }, [initialized]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  const loadData = async () => {
    try {
      const [todosData, statsData] = await Promise.all([
        getAllTodos(),
        getSyncStats()
      ]);
      setTodos(todosData);
      setSyncStats(statsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddTodo = async (todoData: { title: string; description?: string; completed: boolean }) => {
    try {
      const newTodo = await createTodo(todoData);
      setTodos(prev => [newTodo, ...prev]);
      await updateSyncStats();
    } catch (err) {
      console.error('Failed to add todo:', err);
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>) => {
    try {
      const updatedTodo = await updateTodo(id, updates);
      if (updatedTodo) {
        setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
        await updateSyncStats();
      }
    } catch (err) {
      console.error('Failed to update todo:', err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      await updateSyncStats();
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  const updateSyncStats = async () => {
    try {
      const stats = await getSyncStats();
      setSyncStats(stats);
    } catch (err) {
      console.error('Failed to update sync stats:', err);
    }
  };

  if (!initialized) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">My Todos</ThemedText>
        <ThemedText style={styles.subtitle}>
          Offline-first with sync
        </ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <NetworkStatusIndicator />

        <SyncStatus stats={syncStats} />

        <SyncButton />

        <ConflictList />

        <View style={styles.todosContainer}>
          {todos.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                No todos yet. Create your first one!
              </ThemedText>
            </ThemedView>
          ) : (
            todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
              />
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <AddTodoButton onAdd={handleAddTodo} />

      <SyncToast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  todosContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});
