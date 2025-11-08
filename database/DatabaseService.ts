import * as SQLite from 'expo-sqlite';
import { DatabaseItem } from '@/types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('offline_crud.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create todos table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT DEFAULT 'pending',
        last_sync_at TEXT
      );
    `);

    // Create sync_queue table for pending operations
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0
      );
    `);

    // Create conflicts table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS conflicts (
        id TEXT PRIMARY KEY,
        local_data TEXT NOT NULL,
        remote_data TEXT NOT NULL,
        local_timestamp TEXT NOT NULL,
        remote_timestamp TEXT NOT NULL,
        resolved INTEGER DEFAULT 0
      );
    `);

    // Create indexes for better performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_todos_sync_status ON todos(sync_status);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_table ON sync_queue(table_name, record_id);
      CREATE INDEX IF NOT EXISTS idx_conflicts_resolved ON conflicts(resolved);
    `);
  }

  // Generic CRUD operations
  async insert(tableName: string, item: DatabaseItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const { id, data, createdAt, updatedAt, syncStatus, lastSyncAt } = item;

    await this.db.runAsync(`
      INSERT OR REPLACE INTO ${tableName}
      (id, title, description, completed, created_at, updated_at, sync_status, last_sync_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      data.title || '',
      data.description || null,
      data.completed ? 1 : 0,
      createdAt.toISOString(),
      updatedAt.toISOString(),
      syncStatus,
      lastSyncAt?.toISOString() || null
    ]);

    // Add to sync queue
    await this.addToSyncQueue(tableName, id, 'create', data);
  }

  async update(tableName: string, id: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updatedAt = new Date().toISOString();

    await this.db.runAsync(`
      UPDATE ${tableName}
      SET title = ?, description = ?, completed = ?, updated_at = ?, sync_status = 'pending'
      WHERE id = ?
    `, [
      data.title || '',
      data.description || null,
      data.completed ? 1 : 0,
      updatedAt,
      id
    ]);

    // Add to sync queue
    await this.addToSyncQueue(tableName, id, 'update', data);
  }

  async delete(tableName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(`DELETE FROM ${tableName} WHERE id = ?`, [id]);

    // Add to sync queue
    await this.addToSyncQueue(tableName, id, 'delete', { id });
  }

  async getById(tableName: string, id: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(`
      SELECT * FROM ${tableName} WHERE id = ?
    `, [id]);

    if (result) {
      // Convert SQLite boolean to actual boolean
      return {
        ...result,
        completed: Boolean(result.completed),
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
        lastSyncAt: result.last_sync_at ? new Date(result.last_sync_at) : undefined
      };
    }
    return null;
  }

  async getAll(tableName: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync(`
      SELECT * FROM ${tableName} ORDER BY created_at DESC
    `);

    return results.map(row => ({
      ...row,
      completed: Boolean(row.completed),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastSyncAt: row.last_sync_at ? new Date(row.last_sync_at) : undefined
    }));
  }

  async getPendingSync(tableName: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync(`
      SELECT * FROM ${tableName} WHERE sync_status = 'pending' ORDER BY updated_at ASC
    `);

    return results.map(row => ({
      ...row,
      completed: Boolean(row.completed),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastSyncAt: row.last_sync_at ? new Date(row.last_sync_at) : undefined
    }));
  }

  async markAsSynced(tableName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(`
      UPDATE ${tableName}
      SET sync_status = 'synced', last_sync_at = ?
      WHERE id = ?
    `, [new Date().toISOString(), id]);

    // Remove from sync queue
    await this.removeFromSyncQueue(tableName, id);
  }

  // Sync queue operations
  private async addToSyncQueue(tableName: string, recordId: string, operation: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(`
      INSERT INTO sync_queue (table_name, record_id, operation, data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `, [tableName, recordId, operation, JSON.stringify(data), new Date().toISOString()]);
  }

  async getSyncQueue(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync(`
      SELECT * FROM sync_queue ORDER BY created_at ASC
    `);

    return results.map(row => ({
      ...row,
      data: JSON.parse(row.data)
    }));
  }

  async removeFromSyncQueue(tableName: string, recordId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(`
      DELETE FROM sync_queue WHERE table_name = ? AND record_id = ?
    `, [tableName, recordId]);
  }

  async incrementRetryCount(queueId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(`
      UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?
    `, [queueId]);
  }

  // Conflict operations
  async addConflict(conflict: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(`
      INSERT OR REPLACE INTO conflicts
      (id, local_data, remote_data, local_timestamp, remote_timestamp, resolved)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      conflict.id,
      JSON.stringify(conflict.localData),
      JSON.stringify(conflict.remoteData),
      conflict.localTimestamp.toISOString(),
      conflict.remoteTimestamp.toISOString(),
      conflict.resolved ? 1 : 0
    ]);
  }

  async getUnresolvedConflicts(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync(`
      SELECT * FROM conflicts WHERE resolved = 0 ORDER BY local_timestamp DESC
    `);

    return results.map(row => ({
      ...row,
      localData: JSON.parse(row.local_data),
      remoteData: JSON.parse(row.remote_data),
      localTimestamp: new Date(row.local_timestamp),
      remoteTimestamp: new Date(row.remote_timestamp),
      resolved: Boolean(row.resolved)
    }));
  }

  async resolveConflict(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(`
      UPDATE conflicts SET resolved = 1 WHERE id = ?
    `, [id]);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export default new DatabaseService();