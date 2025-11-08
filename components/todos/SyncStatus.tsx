import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SyncStatusProps {
  stats: {
    total: number;
    synced: number;
    pending: number;
    conflicts: number;
  };
}

export function SyncStatus({ stats }: SyncStatusProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ThemedView style={[styles.container, { backgroundColor, borderColor }]}>
      <ThemedText style={styles.title}>Sync Status</ThemedText>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: textColor }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.synced}</Text>
          <Text style={styles.statLabel}>Synced</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.conflicts}</Text>
          <Text style={styles.statLabel}>Conflicts</Text>
        </View>
      </View>

      {stats.pending > 0 && (
        <ThemedText style={styles.pendingNote}>
          {stats.pending} item(s) waiting to sync
        </ThemedText>
      )}

      {stats.conflicts > 0 && (
        <ThemedText style={[styles.conflictNote, { color: '#EF4444' }]}>
          {stats.conflicts} conflict(s) need resolution
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  pendingNote: {
    fontSize: 12,
    color: '#F59E0B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  conflictNote: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 4,
  },
});