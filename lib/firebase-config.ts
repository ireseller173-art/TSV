/**
 * Firebase Configuration
 * 
 * This file initializes Firebase for the TSV Keeper messenger app.
 * Replace the config values with your own Firebase project credentials.
 * 
 * How to get these values:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project or select existing one
 * 3. Go to Project Settings (gear icon)
 * 4. Copy the config object from "Your apps" section
 */

import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { Platform } from 'react-native';

// TODO: Replace these with your Firebase project config
// Get these values from Firebase Console > Project Settings
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Initialize Firebase only once
let app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence for Firestore
if (Platform.OS !== 'web') {
  // For React Native, persistence is enabled by default
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
    } else if (err.code === 'unimplemented') {
    }
  });
}

// Connect to emulators in development (optional)
const USE_EMULATOR = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

if (USE_EMULATOR && Platform.OS === 'web') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
  }
}

export default app;
