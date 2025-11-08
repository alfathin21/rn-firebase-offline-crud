import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSync } from '@/hooks/useSync';
import Repository from '@/services/Repository';
import { ConflictResolver } from './ConflictResolver';
import { SyncConflict } from '@/types';

export function ConflictList() {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<SyncConflict | null>(null);
  const [showResolver, setShowResolver] = useState(false);

  const { resolveConflict, loadSyncStats } = useSync();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');

  useEffect(() => {
    loadConflicts();
  }, []);

  const loadConflicts = async () => {
    try {
      const unresolvedConflicts = await Repository.getUnresolvedConflicts();
      setConflicts(unresolvedConflicts);
    } catch (error) {
      console.error('Failed to load conflicts:', error);
    }
  };

  const handleConflictPress = (conflict: SyncConflict) => {
    setSelectedConflict(conflict);
    setShowResolver(true);
  };

  const handleResolve = async () => {
    setShowResolver(false);
    setSelectedConflict(null);
    await loadConflicts();
    await loadSyncStats();
  };

  const handleCancel = () => {
    setShowResolver(false);
    setSelectedConflict(null);
  };

  const handleQuickResolve = async (conflict: SyncConflict, resolution: 'local' | 'remote') => {
    Alert.alert(
      `Resolve with ${resolution} version?`,
      `This will replace the ${resolution === 'local' ? 'remote' : 'local'} version with the ${resolution} version.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          style: 'destructive',
          onPress: async () => {
            try {
              await resolveConflict(conflict.id, resolution);
              await loadConflicts();
              await loadSyncStats();
            } catch (error) {
              console.error('Failed to resolve conflict:', error);
              Alert.alert('Error', 'Failed to resolve conflict. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor, borderColor }]}>
      <ThemedText style={styles.title}>
        Data Conflicts ({conflicts.length})
      </ThemedText>

      <ThemedText style={styles.subtitle}>
        Some items have conflicting changes. Tap to resolve them.
      </ThemedText>

      {conflicts.map(conflict => (
        <TouchableOpacity
          key={conflict.id}
          style={[styles.conflictItem, { borderColor }]}
          onPress={() => handleConflictPress(conflict)}
        >
          <View style={styles.conflictHeader}>
            <ThemedText style={styles.conflictTitle}>
              {conflict.localData.title}
            </ThemedText>
            <View style={[styles.conflictBadge, { backgroundColor: errorColor }]}>
              <Text style={styles.badgeText}>CONFLICT</Text>
            </View>
          </View>

          <View style={styles.conflictDetails}>
            <View style={styles.versionInfo}>
              <Text style={[styles.versionLabel, { color: '#3B82F6' }]}>
                Your version:
              </Text>
              <Text style={styles.versionTime}>
                {formatDate(conflict.localTimestamp)}
              </Text>
            </View>

            <View style={styles.versionInfo}>
              <Text style={[styles.versionLabel, { color: '#10B981' }]}>
                Remote version:
              </Text>
              <Text style={styles.versionTime}>
                {formatDate(conflict.remoteTimestamp)}
              </Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.localButton, { borderColor: '#3B82F6' }]}
              onPress={() => handleQuickResolve(conflict, 'local')}
            >
              <Text style={[styles.quickActionText, { color: '#3B82F6' }]}>
                Keep Yours
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, styles.remoteButton, { borderColor: '#10B981' }]}
              onPress={() => handleQuickResolve(conflict, 'remote')}
            >
              <Text style={[styles.quickActionText, { color: '#10B981' }]}>
                Keep Remote
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      <ConflictResolver
        visible={showResolver}
        conflict={selectedConflict}
        onResolve={handleResolve}
        onCancel={handleCancel}
      />
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
    marginBottom: 4,
    color: '#EF4444',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  conflictItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  conflictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conflictTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  conflictBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  conflictDetails: {
    marginBottom: 12,
  },
  versionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  versionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  versionTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  localButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  remoteButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});