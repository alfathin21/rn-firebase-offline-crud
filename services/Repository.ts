import DatabaseService from '@/database/DatabaseService';
import { Todo, SyncConflict } from '@/types';

class Repository {
  private db = DatabaseService;

  async initialize(): Promise<void> {
    await this.db.init();
  }

  // Todo operations
  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<Todo> {
    const now = new Date();
    const newTodo: Todo = {
      id: this.generateId(),
      ...todo,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    };

    await this.db.insert('todos', {
      id: newTodo.id,
      data: {
        title: newTodo.title,
        description: newTodo.description,
        completed: newTodo.completed
      },
      createdAt: newTodo.createdAt,
      updatedAt: newTodo.updatedAt,
      syncStatus: newTodo.syncStatus
    });

    return newTodo;
  }

  async updateTodo(id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>): Promise<Todo | null> {
    const existingTodo = await this.getTodoById(id);
    if (!existingTodo) return null;

    const updatedTodo = {
      ...existingTodo,
      ...updates,
      updatedAt: new Date(),
      syncStatus: 'pending' as const
    };

    await this.db.update('todos', id, {
      title: updatedTodo.title,
      description: updatedTodo.description,
      completed: updatedTodo.completed
    });

    return updatedTodo;
  }

  async deleteTodo(id: string): Promise<boolean> {
    const existingTodo = await this.getTodoById(id);
    if (!existingTodo) return false;

    await this.db.delete('todos', id);
    return true;
  }

  async getTodoById(id: string): Promise<Todo | null> {
    const result = await this.db.getById('todos', id);
    if (!result) return null;

    return this.mapRowToTodo(result);
  }

  async getAllTodos(): Promise<Todo[]> {
    const results = await this.db.getAll('todos');
    return results.map(row => this.mapRowToTodo(row));
  }

  async getPendingSyncTodos(): Promise<Todo[]> {
    const results = await this.db.getPendingSync('todos');
    return results.map(row => this.mapRowToTodo(row));
  }

  async markTodoAsSynced(id: string): Promise<void> {
    await this.db.markAsSynced('todos', id);
  }

  // Sync queue operations
  async getSyncQueue(): Promise<any[]> {
    return await this.db.getSyncQueue();
  }

  async removeFromSyncQueue(tableName: string, recordId: string): Promise<void> {
    await this.db.removeFromSyncQueue(tableName, recordId);
  }

  async incrementRetryCount(queueId: number): Promise<void> {
    await this.db.incrementRetryCount(queueId);
  }

  // Conflict operations
  async addConflict(conflict: Omit<SyncConflict, 'resolved'>): Promise<void> {
    await this.db.addConflict(conflict);
  }

  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    return await this.db.getUnresolvedConflicts();
  }

  async resolveConflict(id: string): Promise<void> {
    await this.db.resolveConflict(id);
  }

  // Utility methods
  private generateId(): string {
    return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapRowToTodo(row: any): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      completed: row.completed,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      syncStatus: row.syncStatus,
      lastSyncAt: row.lastSyncAt
    };
  }

  // Statistics and monitoring
  async getSyncStats(): Promise<{
    total: number;
    synced: number;
    pending: number;
    conflicts: number;
  }> {
    const allTodos = await this.getAllTodos();
    const conflicts = await this.getUnresolvedConflicts();

    return {
      total: allTodos.length,
      synced: allTodos.filter(todo => todo.syncStatus === 'synced').length,
      pending: allTodos.filter(todo => todo.syncStatus === 'pending').length,
      conflicts: conflicts.length
    };
  }

  async cleanupOldSyncQueue(olderThanDays: number = 30): Promise<number> {
    // This would be implemented to clean up old sync queue entries
    // For now, just return 0 as placeholder
    return 0;
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}

export default new Repository();