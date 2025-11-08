import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSync } from '@/hooks/useSync';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface SyncButtonProps {
  style?: any;
  showStatus?: boolean;
}

export function SyncButton({ style, showStatus = true }: SyncButtonProps) {
  const {
    isSyncing,
    manualSync,
    hasPendingSync,
    needsSync,
    syncError,
    lastSyncResult,
    clearSyncError
  } = useSync();

  const { isOnline } = useNetworkStatus();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isSyncing) {
      const spin = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    } else {
      spinValue.setValue(0);
    }
  }, [isSyncing]);

  const handleSync = () => {
    if (syncError) {
      clearSyncError();
    }
    manualSync();
  };

  const getSyncIcon = () => {
    if (isSyncing) {
      return (
        <Animated.View
          style={[
            styles.syncIcon,
            {
              transform: [
                {
                  rotate: spinValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <ActivityIndicator size="small" color="#FFFFFF" />
        </Animated.View>
      );
    }

    return (
      <ThemedView style={[styles.syncIcon, { backgroundColor: tintColor }]}>
        <Text style={styles.syncIconText}>⬆</Text>
      </ThemedView>
    );
  };

  const getButtonStyle = () => {
    if (!isOnline) {
      return [styles.button, styles.buttonOffline, { backgroundColor, borderColor }];
    }
    if (syncError) {
      return [styles.button, styles.buttonError, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }];
    }
    if (lastSyncResult?.success) {
      return [styles.button, styles.buttonSuccess, { backgroundColor: '#D1FAE5', borderColor: '#10B981' }];
    }
    if (needsSync) {
      return [styles.button, styles.buttonNeedsSync, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }];
    }
    return [styles.button, { backgroundColor, borderColor }];
  };

  const getButtonText = () => {
    if (isSyncing) return 'Syncing...';
    if (!isOnline) return 'Offline';
    if (syncError) return 'Sync Failed';
    if (lastSyncResult?.success && lastSyncResult.itemsSynced > 0) {
      return `Synced ${lastSyncResult.itemsSynced}`;
    }
    if (hasPendingSync) return 'Sync Now';
    return 'Synced';
  };

  const getTextColor = () => {
    if (!isOnline) return '#9CA3AF';
    if (syncError) return '#EF4444';
    if (lastSyncResult?.success) return '#10B981';
    if (needsSync) return '#F59E0B';
    return textColor;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handleSync}
      disabled={isSyncing || !isOnline}
    >
      <ThemedView style={styles.buttonContent}>
        {getSyncIcon()}
        <ThemedView style={styles.textContainer}>
          <ThemedText style={[styles.buttonText, { color: getTextColor() }]}>
            {getButtonText()}
          </ThemedText>
          {showStatus && hasPendingSync && (
            <ThemedText style={[styles.statusText, { color: getTextColor() }]}>
              {syncError || 'Tap to sync pending changes'}
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  buttonOffline: {
    opacity: 0.6,
  },
  buttonError: {
    backgroundColor: '#FEE2E2',
  },
  buttonSuccess: {
    backgroundColor: '#D1FAE5',
  },
  buttonNeedsSync: {
    backgroundColor: '#FEF3C7',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  syncIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  syncIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
});