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

interface AddTodoButtonProps {
  onAdd: (todo: { title: string; description?: string; completed: boolean }) => void;
}

export function AddTodoButton({ onAdd }: AddTodoButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const handleAdd = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your todo');
      return;
    }

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false
    });

    // Reset form
    setTitle('');
    setDescription('');
    setIsVisible(false);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setIsVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: tintColor }]}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Todo</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor }]}>
          <ThemedView style={styles.modalHeader}>
            <ThemedText type="title">Add New Todo</ThemedText>
          </ThemedView>

          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.label}>Title *</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: useThemeColor({}, 'tabBackground'),
                  color: textColor,
                  borderColor
                }
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter todo title"
              placeholderTextColor="#9CA3AF"
              autoFocus
              multiline
            />

            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: useThemeColor({}, 'tabBackground'),
                  color: textColor,
                  borderColor
                }
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter todo description (optional)"
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
                onPress={handleAdd}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Add Todo</Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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