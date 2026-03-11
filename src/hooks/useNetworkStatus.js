import { useState, useEffect, useCallback } from 'react';

export function useNetworkStatus(onReconnect) {
  const [status, setStatus] = useState('online'); // 'online' | 'offline' | 'reconnected'

  const handleOffline = useCallback(() => {
    setStatus('offline');
  }, []);

  const handleOnline = useCallback(() => {
    setStatus('reconnected');
    if (onReconnect) onReconnect();
    setTimeout(() => setStatus('online'), 3000);
  }, [onReconnect]);

  useEffect(() => {
    if (!navigator.onLine) setStatus('offline');
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [handleOffline, handleOnline]);

  return status;
}
