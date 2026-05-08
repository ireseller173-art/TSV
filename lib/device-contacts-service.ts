/**
 * Device Contacts Service
 * 
 * Handles importing and syncing contacts from device contact list
 */

import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DeviceContact {
  id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
  avatar?: string;
}

export interface SyncResult {
  imported: number;
  updated: number;
  failed: number;
  timestamp: number;
}

const STORAGE_KEY = 'device_contacts';
const SYNC_HISTORY_KEY = 'contact_sync_history';
const LAST_SYNC_KEY = 'last_contact_sync';

/**
 * Request permission to access device contacts
 */
export async function requestContactsPermission(): Promise<boolean> {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    return false;
  }
}

/**
 * Check if we have permission to access contacts
 */
export async function hasContactsPermission(): Promise<boolean> {
  try {
    const { status } = await Contacts.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    return false;
  }
}

/**
 * Get all device contacts
 */
export async function getDeviceContacts(): Promise<DeviceContact[]> {
  try {
    const hasPermission = await hasContactsPermission();
    if (!hasPermission) {
      const granted = await requestContactsPermission();
      if (!granted) {
        throw new Error('Contacts permission denied');
      }
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.ID,
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
        Contacts.Fields.Image,
      ],
    });

    return data
      .filter((contact: any) => contact.name)
      .map((contact: any) => ({
        id: contact.id || `contact_${Date.now()}_${Math.random()}`,
        name: contact.name || 'Unknown',
        phoneNumbers: contact.phoneNumbers?.map((p: any) => p.number || '') || [],
        emails: contact.emails?.map((e: any) => e.email || '') || [],
        avatar: contact.image?.uri,
      }))
      .filter((contact: DeviceContact) => contact.phoneNumbers.length > 0 || contact.emails.length > 0);
  } catch (error) {
    return [];
  }
}

/**
 * Normalize phone number for matching
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

/**
 * Deduplicate contacts by phone number and email
 */
export function deduplicateContacts(contacts: DeviceContact[]): DeviceContact[] {
  const seen = new Set<string>();
  const deduplicated: DeviceContact[] = [];

  for (const contact of contacts) {
    const key = [
      ...contact.phoneNumbers.map(normalizePhoneNumber),
      ...contact.emails,
    ]
      .filter(Boolean)
      .join('|');

    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(contact);
    }
  }

  return deduplicated;
}

/**
 * Save contacts to local storage
 */
export async function saveContactsLocally(contacts: DeviceContact[]): Promise<void> {
  try {
    const deduplicated = deduplicateContacts(contacts);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicated));
  } catch (error) {
  }
}

/**
 * Get locally saved contacts
 */
export async function getLocalContacts(): Promise<DeviceContact[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Sync device contacts with app
 */
export async function syncDeviceContacts(): Promise<SyncResult> {
  try {
    const deviceContacts = await getDeviceContacts();
    const localContacts = await getLocalContacts();

    // Find new and updated contacts
    let imported = 0;
    let updated = 0;

    for (const deviceContact of deviceContacts) {
      const existingIndex = localContacts.findIndex(
        (lc) =>
          lc.phoneNumbers.some((p) =>
            deviceContact.phoneNumbers.some(
              (dp) => normalizePhoneNumber(p) === normalizePhoneNumber(dp)
            )
          ) ||
          lc.emails.some((e) => deviceContact.emails.includes(e))
      );

      if (existingIndex === -1) {
        imported++;
      } else if (
        localContacts[existingIndex].name !== deviceContact.name ||
        localContacts[existingIndex].avatar !== deviceContact.avatar
      ) {
        updated++;
        localContacts[existingIndex] = deviceContact;
      }
    }

    // Save updated contacts
    await saveContactsLocally(deviceContacts);

    const result: SyncResult = {
      imported,
      updated,
      failed: 0,
      timestamp: Date.now(),
    };

    // Save sync history
    await saveSyncHistory(result);
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());

    return result;
  } catch (error) {
    return {
      imported: 0,
      updated: 0,
      failed: 1,
      timestamp: Date.now(),
    };
  }
}

/**
 * Save sync history
 */
async function saveSyncHistory(result: SyncResult): Promise<void> {
  try {
    const history = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
    const syncHistory: SyncResult[] = history ? JSON.parse(history) : [];
    syncHistory.push(result);
    // Keep only last 100 syncs
    if (syncHistory.length > 100) {
      syncHistory.shift();
    }
    await AsyncStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(syncHistory));
  } catch (error) {
  }
}

/**
 * Get last sync time
 */
export async function getLastSyncTime(): Promise<number | null> {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Get sync history
 */
export async function getSyncHistory(): Promise<SyncResult[]> {
  try {
    const history = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Search contacts by name or phone
 */
export async function searchContacts(query: string): Promise<DeviceContact[]> {
  try {
    const contacts = await getLocalContacts();
    const lowerQuery = query.toLowerCase();

    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowerQuery) ||
        contact.phoneNumbers.some((p) => p.includes(query)) ||
        contact.emails.some((e) => e.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    return [];
  }
}

/**
 * Clear all local contacts
 */
export async function clearLocalContacts(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
  }
}

/**
 * Export contacts as CSV
 */
export async function exportContactsAsCSV(): Promise<string> {
  try {
    const contacts = await getLocalContacts();
    let csv = 'Name,Phone,Email\n';

    for (const contact of contacts) {
      const phones = contact.phoneNumbers.join(';');
      const emails = contact.emails.join(';');
      csv += `"${contact.name}","${phones}","${emails}"\n`;
    }

    return csv;
  } catch (error) {
    return '';
  }
}

/**
 * Setup automatic sync on app launch
 */
export async function setupAutoSync(): Promise<void> {
  try {
    const lastSync = await getLastSyncTime();
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Sync if never synced or last sync was more than 24 hours ago
    if (!lastSync || now - lastSync > oneDayMs) {
      await syncDeviceContacts();
    }
  } catch (error) {
  }
}
