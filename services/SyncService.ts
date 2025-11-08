import Repository from './Repository';
import { NetworkStatus } from '@/types';

interface SyncQueueItem {
  id: number;
  table_name: string;
  record_id: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  created_at: string;
  retry_count: number;
}

interface SyncResult {
  success: boolean;
  itemsSynced: number;
  errors: string[];
  conflicts: any[];
}

class SyncService {
  private syncInProgress = false;
  private lastSyncTime: Date | null = null;
  private retryDelay = 1000; // Start with 1 second
  private maxRetryDelay = 30000; // Max 30 seconds
  private maxRetries = 5;

  async syncAll(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        success: false,
        itemsSynced: 0,
        errors: ['Sync already in progress'],
        conflicts: []
      };
    }

    this.syncInProgress = true;
    const result: SyncResult = {
      success: true,
      itemsSynced: 0,
      errors: [],
      conflicts: []
    };

    try {
      // Get all pending todos
      const pendingTodos = await Repository.getPendingSyncTodos();

      // Get sync queue
      const syncQueue = await Repository.getSyncQueue();

      console.log(`Starting sync: ${pendingTodos.length} pending todos, ${syncQueue.length} queue items`);

      // Process each item in sync queue
      for (const queueItem of syncQueue) {
        try {
          await this.processSyncQueueItem(queueItem);
          result.itemsSynced++;
        } catch (error) {
          console.error(`Failed to sync queue item ${queueItem.id}:`, error);

          if (queueItem.retry_count >= this.maxRetries) {
            result.errors.push(`Max retries exceeded for item ${queueItem.record_id}`);
            await Repository.incrementRetryCount(queueItem.id);
          } else {
            // Retry with exponential backoff
            await this.retryWithBackoff(queueItem);
          }
        }
      }

      // Fetch remote updates (placeholder for now)
      await this.fetchRemoteUpdates();

      this.lastSyncTime = new Date();
      console.log('Sync completed successfully');

    } catch (error) {
      console.error('Sync failed:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  private async processSyncQueueItem(queueItem: SyncQueueItem): Promise<void> {
    const { table_name, record_id, operation, data } = queueItem;

    switch (operation) {
      case 'create':
        await this.syncCreate(table_name, record_id, data);
        break;
      case 'update':
        await this.syncUpdate(table_name, record_id, data);
        break;
      case 'delete':
        await this.syncDelete(table_name, record_id);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    // Mark as synced and remove from queue
    await Repository.markAsSynced(table_name, record_id);
  }

  private async syncCreate(tableName: string, recordId: string, data: any): Promise<void> {
    // Placeholder for Firebase create operation
    // In a real implementation, this would create the record in Firebase
    console.log(`Syncing create: ${tableName} ${recordId}`, data);

    // Simulate network operation
    await this.simulateNetworkOperation();

    // Check for conflicts (placeholder)
    // In real implementation, you'd compare with remote data
  }

  private async syncUpdate(tableName: string, recordId: string, data: any): Promise<void> {
    // Placeholder for Firebase update operation
    console.log(`Syncing update: ${tableName} ${recordId}`, data);

    // Simulate network operation
    await this.simulateNetworkOperation();

    // Check for conflicts (placeholder)
    const localItem = await Repository.getById(tableName, recordId);
    if (localItem) {
      // In real implementation, you'd fetch remote data and compare timestamps
      const remoteTimestamp = new Date(); // Placeholder
      const localTimestamp = localItem.updatedAt;

      if (remoteTimestamp > localTimestamp) {
        // Conflict detected
        await this.handleConflict(recordId, localItem, { updatedAt: remoteTimestamp });
      }
    }
  }

  private async syncDelete(tableName: string, recordId: string): Promise<void> {
    // Placeholder for Firebase delete operation
    console.log(`Syncing delete: ${tableName} ${recordId}`);

    // Simulate network operation
    await this.simulateNetworkOperation();
  }

  private async fetchRemoteUpdates(): Promise<void> {
    // Placeholder for fetching remote updates from Firebase
    console.log('Fetching remote updates...');

    // In real implementation:
    // 1. Fetch all records updated since last sync
    // 2. Compare with local records
    // 3. Apply updates or create conflicts

    await this.simulateNetworkOperation();
  }

  private async handleConflict(recordId: string, localData: any, remoteData: any): Promise<void> {
    console.log(`Conflict detected for record ${recordId}`);

    // Create conflict record
    await Repository.addConflict({
      id: recordId,
      localData,
      remoteData,
      localTimestamp: localData.updatedAt,
      remoteTimestamp: remoteData.updatedAt,
      resolved: false
    });

    // Mark local record as conflicted
    await Repository.update(recordId.split('_')[1], { syncStatus: 'conflict' });
  }

  private async retryWithBackoff(queueItem: SyncQueueItem): Promise<void> {
    const delay = Math.min(
      this.retryDelay * Math.pow(2, queueItem.retry_count),
      this.maxRetryDelay
    );

    console.log(`Retrying sync item ${queueItem.id} after ${delay}ms delay`);

    await new Promise(resolve => setTimeout(resolve, delay));
    await Repository.incrementRetryCount(queueItem.id);
  }

  private async simulateNetworkOperation(): Promise<void> {
    // Simulate network delay (500ms to 2s)
    const delay = Math.random() * 1500 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate occasional network errors (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Simulated network error');
    }
  }

  // Manual conflict resolution
  async resolveConflict(recordId: string, resolution: 'local' | 'remote' | 'merge', mergedData?: any): Promise<void> {
    const conflicts = await Repository.getUnresolvedConflicts();
    const conflict = conflicts.find(c => c.id === recordId);

    if (!conflict) {
      throw new Error(`Conflict not found: ${recordId}`);
    }

    try {
      switch (resolution) {
        case 'local':
          // Push local version to remote
          await this.syncUpdate('todos', recordId, conflict.localData);
          break;

        case 'remote':
          // Apply remote version locally
          await Repository.update(recordId.split('_')[1], {
            ...conflict.remoteData,
            syncStatus: 'synced'
          });
          break;

        case 'merge':
          if (!mergedData) {
            throw new Error('Merged data required for merge resolution');
          }
          // Apply merged data locally and push to remote
          await Repository.update(recordId.split('_')[1], {
            ...mergedData,
            syncStatus: 'synced'
          });
          await this.syncUpdate('todos', recordId, mergedData);
          break;

        default:
          throw new Error(`Unknown resolution: ${resolution}`);
      }

      // Mark conflict as resolved
      await Repository.resolveConflict(recordId);
      console.log(`Conflict resolved for record ${recordId} with resolution: ${resolution}`);

    } catch (error) {
      console.error(`Failed to resolve conflict ${recordId}:`, error);
      throw error;
    }
  }

  // Utility methods
  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  async getSyncStats(): Promise<{
    pendingItems: number;
    queueItems: number;
    conflicts: number;
    lastSync: Date | null;
  }> {
    const pendingTodos = await Repository.getPendingSyncTodos();
    const syncQueue = await Repository.getSyncQueue();
    const conflicts = await Repository.getUnresolvedConflicts();

    return {
      pendingItems: pendingTodos.length,
      queueItems: syncQueue.length,
      conflicts: conflicts.length,
      lastSync: this.lastSyncTime
    };
  }

  // Background sync (could be called by a background service)
  async backgroundSync(): Promise<void> {
    if (this.syncInProgress) {
      return;
    }

    try {
      const result = await this.syncAll();
      console.log('Background sync result:', result);
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  // Force sync all data (useful for manual refresh)
  async forceSyncAll(): Promise<SyncResult> {
    // Reset retry delay for immediate sync
    this.retryDelay = 1000;
    return await this.syncAll();
  }
}

export default new SyncService();