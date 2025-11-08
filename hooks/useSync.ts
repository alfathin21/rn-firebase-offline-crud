import { useState, useEffect, useCallback } from 'react';
import SyncService from '@/services/SyncService';
import { useNetworkStatus } from './useNetworkStatus';

interface SyncStats {
  pendingItems: number;
  queueItems: number;
  conflicts: number;
  lastSync: Date | null;
}

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    pendingItems: 0,
    queueItems: 0,
    conflicts: 0,
    lastSync: null
  });
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<{
    success: boolean;
    itemsSynced: number;
    errors: string[];
    conflicts: any[];
  } | null>(null);

  const { isOnline, isConnected } = useNetworkStatus();

  // Load initial sync stats
  useEffect(() => {
    loadSyncStats();
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && isConnected) {
      // Wait a bit before auto-syncing to allow for stable connection
      const timer = setTimeout(() => {
        if (syncStats.pendingItems > 0 || syncStats.queueItems > 0) {
          autoSync();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, isConnected]);

  // Periodic sync when online
  useEffect(() => {
    if (!isOnline || !isConnected) return;

    const interval = setInterval(() => {
      if (syncStats.pendingItems > 0 || syncStats.queueItems > 0) {
        autoSync();
      } else {
        loadSyncStats(); // Just update stats
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isOnline, isConnected, syncStats.pendingItems, syncStats.queueItems]);

  const loadSyncStats = useCallback(async () => {
    try {
      const stats = await SyncService.getSyncStats();
      setSyncStats(stats);
      setSyncError(null);
    } catch (error) {
      console.error('Failed to load sync stats:', error);
      setSyncError(error instanceof Error ? error.message : 'Failed to load sync stats');
    }
  }, []);

  const autoSync = useCallback(async () => {
    if (!isOnline || !isConnected || isSyncing) {
      return;
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      const result = await SyncService.backgroundSync();
      await loadSyncStats();

      setLastSyncResult({
        success: true,
        itemsSynced: result.itemsSynced,
        errors: [],
        conflicts: []
      });

      // Clear success message after 3 seconds
      setTimeout(() => setLastSyncResult(null), 3000);

    } catch (error) {
      console.error('Auto-sync failed:', error);
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isConnected, isSyncing, loadSyncStats]);

  const manualSync = useCallback(async () => {
    if (!isOnline || !isConnected) {
      setSyncError('No internet connection available');
      return;
    }

    if (isSyncing) {
      return;
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      const result = await SyncService.forceSyncAll();
      await loadSyncStats();

      setLastSyncResult(result);

      if (result.success) {
        console.log(`Manual sync completed: ${result.itemsSynced} items synced`);
      } else {
        console.error('Manual sync completed with errors:', result.errors);
      }

      // Clear result message after 5 seconds
      setTimeout(() => setLastSyncResult(null), 5000);

    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncError(error instanceof Error ? error.message : 'Manual sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isConnected, isSyncing, loadSyncStats]);

  const resolveConflict = useCallback(async (recordId: string, resolution: 'local' | 'remote' | 'merge', mergedData?: any) => {
    try {
      await SyncService.resolveConflict(recordId, resolution, mergedData);
      await loadSyncStats();
      setSyncError(null);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      setSyncError(error instanceof Error ? error.message : 'Failed to resolve conflict');
      throw error;
    }
  }, [loadSyncStats]);

  const clearSyncError = useCallback(() => {
    setSyncError(null);
  }, []);

  const hasPendingSync = syncStats.pendingItems > 0 || syncStats.queueItems > 0;
  const hasConflicts = syncStats.conflicts > 0;
  const needsSync = hasPendingSync && isOnline && isConnected;

  return {
    isSyncing,
    syncStats,
    syncError,
    lastSyncResult,
    hasPendingSync,
    hasConflicts,
    needsSync,
    loadSyncStats,
    autoSync,
    manualSync,
    resolveConflict,
    clearSyncError,
    SyncService
  };
}