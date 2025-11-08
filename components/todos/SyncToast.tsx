import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSync } from '@/hooks/useSync';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function SyncToast() {
  const { lastSyncResult, syncError, isSyncing } = useSync();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'info'>('info');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const translateY = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (syncError) {
      showToast(syncError, 'error');
    } else if (lastSyncResult?.success) {
      if (lastSyncResult.itemsSynced > 0) {
        showToast(`Synced ${lastSyncResult.itemsSynced} item(s) successfully`, 'success');
      }
    } else if (isSyncing) {
      showToast('Syncing your changes...', 'info');
    }
  }, [lastSyncResult, syncError, isSyncing]);

  const showToast = (text: string, toastType: 'success' | 'error' | 'info') => {
    setMessage(text);
    setType(toastType);
    setVisible(true);

    // Slide down
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 3 seconds
    const timer = setTimeout(() => {
      hideToast();
    }, 3000);

    return () => clearTimeout(timer);
  };

  const hideToast = () => {
    // Slide up
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return [styles.toast, styles.toastSuccess, { backgroundColor: '#10B981' }];
      case 'error':
        return [styles.toast, styles.toastError, { backgroundColor: '#EF4444' }];
      case 'info':
        return [styles.toast, styles.toastInfo, { backgroundColor: '#3B82F6' }];
      default:
        return [styles.toast, { backgroundColor: '#6B7280' }];
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          top: SCREEN_HEIGHT * 0.1, // Position at 10% from top
        },
      ]}
    >
      <ThemedView style={getToastStyle()}>
        <View style={styles.toastContent}>
          <Text style={styles.toastIcon}>
            {type === 'success' ? '✓' : type === 'error' ? '✕' : '⬆'}
          </Text>
          <ThemedText style={[styles.toastMessage, { color: '#FFFFFF' }]}>
            {message}
          </ThemedText>
        </View>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 200,
    maxWidth: '80%',
  },
  toastSuccess: {
    backgroundColor: '#10B981',
  },
  toastError: {
    backgroundColor: '#EF4444',
  },
  toastInfo: {
    backgroundColor: '#3B82F6',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  toastMessage: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});