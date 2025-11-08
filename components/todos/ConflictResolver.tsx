import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSync } from '@/hooks/useSync';
import { SyncConflict } from '@/types';

interface ConflictResolverProps {
  visible: boolean;
  conflict: SyncConflict | null;
  onResolve: () => void;
  onCancel: () => void;
}

export function ConflictResolver({ visible, conflict, onResolve, onCancel }: ConflictResolverProps) {
  const [selectedVersion, setSelectedVersion] = useState<'local' | 'remote' | 'merge'>('local');
  const [mergedTitle, setMergedTitle] = useState('');
  const [mergedDescription, setMergedDescription] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const { resolveConflict } = useSync();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'error');

  useEffect(() => {
    if (conflict && visible) {
      setSelectedVersion('local');
      setMergedTitle(conflict.localData.title || '');
      setMergedDescription(conflict.localData.description || '');
    }
  }, [conflict, visible]);

  const handleResolve = async () => {
    if (!conflict) return;

    try {
      setIsResolving(true);

      let mergedData;
      if (selectedVersion === 'merge') {
        if (!mergedTitle.trim()) {
          Alert.alert('Error', 'Title cannot be empty for merged version');
          return;
        }
        mergedData = {
          title: mergedTitle.trim(),
          description: mergedDescription.trim(),
          completed: conflict.localData.completed || false
        };
      }

      await resolveConflict(conflict.id, selectedVersion, mergedData);
      onResolve();
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      Alert.alert('Error', 'Failed to resolve conflict. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const renderConflictVersion = (title: string, data: any, timestamp: Date, versionType: 'local' | 'remote') => {
    const isSelected = selectedVersion === versionType;
    const versionColor = versionType === 'local' ? '#3B82F6' : '#10B981';

    return (
      <TouchableOpacity
        style={[
          styles.versionCard,
          {
            backgroundColor: useThemeColor({}, 'tabBackground'),
            borderColor: isSelected ? versionColor : borderColor,
            borderWidth: isSelected ? 2 : 1
          }
        ]}
        onPress={() => setSelectedVersion(versionType)}
      >
        <View style={styles.versionHeader}>
          <ThemedText style={[styles.versionTitle, { color: versionColor }]}>
            {title}
          </ThemedText>
          <Text style={styles.versionTime}>
            {formatDate(timestamp)}
          </Text>
        </View>

        <View style={styles.versionContent}>
          <ThemedText style={styles.fieldLabel}>Title:</ThemedText>
          <ThemedText style={styles.fieldValue}>{data.title}</ThemedText>

          {data.description ? (
            <>
              <ThemedText style={styles.fieldLabel}>Description:</ThemedText>
              <ThemedText style={styles.fieldValue}>{data.description}</ThemedText>
            </>
          ) : null}

          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, { backgroundColor: data.completed ? versionColor : 'transparent', borderColor: versionColor }]}>
              {data.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <ThemedText style={styles.checkboxLabel}>Completed</ThemedText>
          </View>
        </View>

        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: versionColor }]}>
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMergeOption = () => {
    const isSelected = selectedVersion === 'merge';

    return (
      <TouchableOpacity
        style={[
          styles.versionCard,
          styles.mergeCard,
          {
            backgroundColor: useThemeColor({}, 'tabBackground'),
            borderColor: isSelected ? tintColor : borderColor,
            borderWidth: isSelected ? 2 : 1
          }
        ]}
        onPress={() => setSelectedVersion('merge')}
      >
        <ThemedText style={[styles.versionTitle, { color: tintColor }]}>
          Merge Both Versions
        </ThemedText>

        <ThemedText style={styles.mergeDescription}>
          Create a custom version by combining the best of both versions
        </ThemedText>

        <View style={styles.mergeFields}>
          <ThemedText style={styles.fieldLabel}>Title:</ThemedText>
          <Text
            style={[
              styles.mergeInput,
              {
                backgroundColor: useThemeColor({}, 'background'),
                color: textColor,
                borderColor
              }
            ]}
            multiline
            value={mergedTitle}
            onChangeText={setMergedTitle}
            placeholder="Enter merged title"
            placeholderTextColor="#9CA3AF"
          />

          <ThemedText style={styles.fieldLabel}>Description:</ThemedText>
          <Text
            style={[
              styles.mergeInput,
              styles.mergeTextArea,
              {
                backgroundColor: useThemeColor({}, 'background'),
                color: textColor,
                borderColor
              }
            ]}
            multiline
            numberOfLines={3}
            value={mergedDescription}
            onChangeText={setMergedDescription}
            placeholder="Enter merged description"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: tintColor }]}>
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!conflict) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Resolve Conflict</ThemedText>
          <ThemedText style={styles.subtitle}>
            Choose which version to keep or create a merged version
          </ThemedText>
        </ThemedView>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderConflictVersion('Your Version', conflict.localData, conflict.localTimestamp, 'local')}

          {renderConflictVersion('Remote Version', conflict.remoteData, conflict.remoteTimestamp, 'remote')}

          {renderMergeOption()}
        </ScrollView>

        <ThemedView style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { borderColor }]}
            onPress={onCancel}
            disabled={isResolving}
          >
            <ThemedText style={[styles.buttonText, { color: textColor }]}>
              Cancel
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resolveButton, { backgroundColor: tintColor }]}
            onPress={handleResolve}
            disabled={isResolving}
          >
            <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
              {isResolving ? 'Resolving...' : 'Resolve Conflict'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  versionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  mergeCard: {
    borderWidth: 1,
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  versionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  versionTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  versionContent: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  fieldValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mergeDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  mergeFields: {
    marginTop: 8,
  },
  mergeInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  mergeTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  resolveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});