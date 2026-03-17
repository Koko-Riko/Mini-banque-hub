import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { syncService } from '@/services/syncService';
import { offlineStorage } from '@/services/offlineStorage';

interface OfflineContextType {
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, wasOffline, resetWasOffline } = useOnlineStatus();
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize offline storage
  useEffect(() => {
    offlineStorage.init().then(() => {
      offlineStorage.getSyncQueueCount().then(setPendingSyncCount);
    });
  }, []);

  // Listen for sync queue changes
  useEffect(() => {
    const unsubscribe = syncService.onSyncQueueChange(setPendingSyncCount);
    return unsubscribe;
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      syncNow().then(() => {
        resetWasOffline();
        // Refresh cache after sync
        syncService.refreshCache();
      });
    }
  }, [isOnline, wasOffline, resetWasOffline]);

  // Refresh cache periodically when online
  useEffect(() => {
    if (!isOnline) return;

    // Initial cache refresh
    syncService.refreshCache();

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncService.refreshCache();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isOnline]);

  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      await syncService.syncAll();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingSyncCount,
        isSyncing,
        syncNow,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
