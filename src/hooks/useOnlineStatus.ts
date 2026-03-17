import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface OnlineStatusState {
  isOnline: boolean;
  wasOffline: boolean;
}

export function useOnlineStatus() {
  const [state, setState] = useState<OnlineStatusState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
  });

  const handleOnline = useCallback(() => {
    setState(prev => ({
      isOnline: true,
      wasOffline: !prev.isOnline ? true : prev.wasOffline,
    }));
    toast.success('Connexion rétablie', {
      description: 'Synchronisation des données en cours...',
    });
  }, []);

  const handleOffline = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOnline: false,
    }));
    toast.warning('Mode hors-ligne activé', {
      description: 'Les modifications seront synchronisées quand la connexion sera rétablie.',
    });
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  const resetWasOffline = useCallback(() => {
    setState(prev => ({ ...prev, wasOffline: false }));
  }, []);

  return {
    isOnline: state.isOnline,
    wasOffline: state.wasOffline,
    resetWasOffline,
  };
}
