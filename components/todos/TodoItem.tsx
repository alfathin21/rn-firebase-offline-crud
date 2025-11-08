import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Todo } from '@/types';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'error');

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      setIsEditing(false);
    } else {
      Alert.alert('Error', 'Title cannot be empty');
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(todo.id) }
      ]
    );
  };

  const toggleCompleted = () => {
    onUpdate(todo.id, { completed: !todo.completed });
  };

  const getSyncStatusColor = () => {
    switch (todo.syncStatus) {
      case 'synced':
        return '#10B981'; // green
      case 'pending':
        return '#F59E0B'; // yellow
      case 'conflict':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  const getSyncStatusText = () => {
    switch (todo.syncStatus) {
      case 'synced':
        return 'Synced';
      case 'pending':
        return 'Pending';
      case 'conflict':
        return 'Conflict';
      default:
        return 'Unknown';
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={toggleCompleted}
        >
          <View style={[
            styles.checkboxInner,
            {
              backgroundColor: todo.completed ? tintColor : 'transparent',
              borderColor: tintColor
            }
          ]}>
            {todo.completed && (
              <Text style={[styles.checkmark, { color: '#FFFFFF' }]}>✓</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.content}>
          <ThemedText style={[
            styles.title,
            todo.completed && styles.completedTitle,
            { color: todo.completed ? '#9CA3AF' : textColor }
          ]}>
            {todo.title}
          </ThemedText>

          {todo.description ? (
            <ThemedText style={[styles.description, { color: '#6B7280' }]}>
              {todo.description}
            </ThemedText>
          ) : null}

          <View style={styles.meta}>
            <Text style={[styles.syncStatus, { color: getSyncStatusColor() }]}>
              ● {getSyncStatusText()}
            </Text>
            <Text style={[styles.date, { color: '#9CA3AF' }]}>
              {todo.updatedAt.toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor }]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={[styles.actionText, { color: tintColor }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor }]}
            onPress={handleDelete}
          >
            <Text style={[styles.actionText, { color: errorColor }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isEditing}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor }]}>
          <ThemedView style={styles.modalHeader}>
            <ThemedText type="title">Edit Todo</ThemedText>
          </ThemedView>

          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.label}>Title *</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: useThemeColor({}, 'background'),
                  color: textColor,
                  borderColor
                }
              ]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Enter todo title"
              placeholderTextColor="#9CA3AF"
              multiline
            />

            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: useThemeColor({}, 'background'),
                  color: textColor,
                  borderColor
                }
              ]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Enter todo description"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor }]}
                onPress={handleCancel}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: tintColor }]}
                onPress={handleSave}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'column',
    gap: 4,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});