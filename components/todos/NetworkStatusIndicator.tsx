import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function NetworkStatusIndicator() {
  const { networkStatus, isOnline, isOffline, connectionType } = useNetworkStatus();

  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  const getStatusColor = () => {
    switch (networkStatus) {
      case 'online':
        return '#10B981'; // green
      case 'offline':
        return '#EF4444'; // red
      case 'unknown':
        return '#F59E0B'; // yellow
      default:
        return '#6B7280'; // gray
    }
  };

  const getStatusText = () => {
    switch (networkStatus) {
      case 'online':
        return `Online (${connectionType})`;
      case 'offline':
        return 'Offline';
      case 'unknown':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    switch (networkStatus) {
      case 'online':
        return '●';
      case 'offline':
        return '●';
      case 'unknown':
        return '○';
      default:
        return '○';
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.statusContainer}>
        <Text style={[styles.statusIcon, { color: getStatusColor() }]}>
          {getStatusIcon()}
        </Text>
        <ThemedText style={styles.statusText}>
          {getStatusText()}
        </ThemedText>
      </View>
      {isOffline && (
        <ThemedText style={styles.offlineMessage}>
          Changes will sync when connection is restored
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  offlineMessage: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});