export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncAt?: Date;
}

export interface DatabaseItem {
  id: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncAt?: string;
}

export interface SyncConflict {
  id: string;
  localData: any;
  remoteData: any;
  localTimestamp: Date;
  remoteTimestamp: Date;
  resolved: boolean;
}

export type NetworkStatus = 'online' | 'offline' | 'unknown';