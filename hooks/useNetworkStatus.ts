import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { NetworkStatus } from '@/types';

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('unknown');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const newStatus = state.isConnected !== null
        ? (state.isConnected ? 'online' : 'offline')
        : 'unknown';

      setNetworkStatus(newStatus);
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
    });

    // Get initial network status
    NetInfo.fetch().then(state => {
      const newStatus = state.isConnected !== null
        ? (state.isConnected ? 'online' : 'offline')
        : 'unknown';

      setNetworkStatus(newStatus);
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    networkStatus,
    isConnected,
    connectionType,
    isOnline: networkStatus === 'online',
    isOffline: networkStatus === 'offline',
    isUnknown: networkStatus === 'unknown'
  };
}