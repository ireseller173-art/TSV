/**
 * Contact Sync Provider
 * 
 * Manages device contact synchronization and app-wide contact state
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getDeviceContacts,
  syncDeviceContacts,
  getLocalContacts,
  searchContacts,
  getLastSyncTime,
  setupAutoSync,
  type DeviceContact,
  type SyncResult,
} from './device-contacts-service';

interface ContactSyncContextType {
  contacts: DeviceContact[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncResult: SyncResult | null;
  error: string | null;
  
  // Methods
  syncContacts: () => Promise<void>;
  searchContacts: (query: string) => Promise<DeviceContact[]>;
  refreshContacts: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

const ContactSyncContext = createContext<ContactSyncContextType | undefined>(undefined);

export function ContactSyncProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize contacts on mount
  useEffect(() => {
    initializeContacts();
  }, []);

  const initializeContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Setup auto sync
      await setupAutoSync();

      // Load local contacts
      const localContacts = await getLocalContacts();
      setContacts(localContacts);

      // Get last sync time
      const lastSync = await getLastSyncTime();
      setLastSyncTime(lastSync);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize contacts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const syncContacts = useCallback(async () => {
    try {
      setIsSyncing(true);
      setError(null);

      const result = await syncDeviceContacts();
      setSyncResult(result);

      // Reload contacts
      const updatedContacts = await getLocalContacts();
      setContacts(updatedContacts);

      // Update last sync time
      const lastSync = await getLastSyncTime();
      setLastSyncTime(lastSync);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync contacts';
      setError(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const refreshContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const localContacts = await getLocalContacts();
      setContacts(localContacts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh contacts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      // Permission request is handled in device-contacts-service
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      return false;
    }
  }, []);

  const handleSearchContacts = useCallback(async (query: string): Promise<DeviceContact[]> => {
    try {
      return await searchContacts(query);
    } catch (err) {
      return [];
    }
  }, []);

  const value: ContactSyncContextType = {
    contacts,
    isLoading,
    isSyncing,
    lastSyncTime,
    syncResult,
    error,
    syncContacts,
    searchContacts: handleSearchContacts,
    refreshContacts,
    requestPermission,
  };

  return (
    <ContactSyncContext.Provider value={value}>
      {children}
    </ContactSyncContext.Provider>
  );
}

/**
 * Hook to use contact sync context
 */
export function useContactSync(): ContactSyncContextType {
  const context = useContext(ContactSyncContext);
  if (!context) {
    throw new Error('useContactSync must be used within ContactSyncProvider');
  }
  return context;
}
