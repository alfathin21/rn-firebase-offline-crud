import { useEffect, useState, useCallback } from 'react';
import Repository from '@/services/Repository';
import { Todo } from '@/types';

export function useRepository() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        await Repository.initialize();
        setInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize repository');
        console.error('Repository initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const createTodo = useCallback(async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
    if (!initialized) throw new Error('Repository not initialized');

    try {
      setLoading(true);
      setError(null);
      return await Repository.createTodo(todoData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  const updateTodo = useCallback(async (id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>) => {
    if (!initialized) throw new Error('Repository not initialized');

    try {
      setLoading(true);
      setError(null);
      return await Repository.updateTodo(id, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  const deleteTodo = useCallback(async (id: string) => {
    if (!initialized) throw new Error('Repository not initialized');

    try {
      setLoading(true);
      setError(null);
      return await Repository.deleteTodo(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  const getTodoById = useCallback(async (id: string) => {
    if (!initialized) throw new Error('Repository not initialized');

    try {
      setError(null);
      return await Repository.getTodoById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [initialized]);

  const getAllTodos = useCallback(async () => {
    if (!initialized) throw new Error('Repository not initialized');

    try {
      setError(null);
      return await Repository.getAllTodos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get todos';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [initialized]);

  const getPendingSyncTodos = useCallback(async () => {
    if (!initialized) throw new Error('Repository not initialized');

    try {
      setError(null);
      return await Repository.getPendingSyncTodos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get pending todos';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [initialized]);

  const getSyncStats = useCallback(async () => {
    if (!initialized) throw new Error('Repository not initialized');

    try {
      setError(null);
      return await Repository.getSyncStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get sync stats';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [initialized]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    initialized,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    getTodoById,
    getAllTodos,
    getPendingSyncTodos,
    getSyncStats,
    clearError,
    Repository
  };
}