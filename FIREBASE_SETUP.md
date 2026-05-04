# Cool Messenger - Firebase Integration Guide

## Overview

This guide provides a complete, step-by-step approach to integrate Cool Messenger with Firebase. The setup is designed to be **simple, production-ready, and scalable** for up to 100+ users.

---

## Phase 1: Firebase Project Setup

### Step 1.1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `cool-messenger` (or your preferred name)
4. Accept the terms and click **"Create project"**
5. Wait for project initialization (2-3 minutes)

### Step 1.2: Enable Firebase Services

Once the project is created:

1. **Authentication**
   - Go to **Build → Authentication**
   - Click **"Get started"**
   - Enable **Email/Password** authentication
   - Enable **Google** authentication (optional, for easier signup)
   - Enable **Phone** authentication (optional, for phone-based login)

2. **Firestore Database**
   - Go to **Build → Firestore Database**
   - Click **"Create database"**
   - Choose region: **us-central1** (or closest to your users)
   - Start in **Test mode** (we'll secure it later)
   - Click **"Create"**

3. **Cloud Storage**
   - Go to **Build → Storage**
   - Click **"Get started"**
   - Choose region: **us-central1** (same as Firestore)
   - Click **"Create"**

4. **Realtime Database** (Optional, for real-time presence)
   - Go to **Build → Realtime Database**
   - Click **"Create Database"**
   - Choose region: **us-central1**
   - Start in **Test mode**
   - Click **"Enable"**

### Step 1.3: Get Firebase Configuration

1. Go to **Project Settings** (gear icon, top-left)
2. Scroll to **"Your apps"** section
3. Click **"</>" (Web)** to add a web app
4. Register app name: `cool-messenger-web`
5. Copy the Firebase config object (you'll need this later)

Example config:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};
```

---

## Phase 2: Firestore Database Schema

### Collection Structure

Create the following collections in Firestore:

#### 1. **users** Collection
```
/users/{userId}
  ├── uid: string (user ID)
  ├── email: string
  ├── displayName: string
  ├── avatar: string (URL to profile picture)
  ├── status: string ("online" | "offline" | "away")
  ├── lastSeen: timestamp
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  └── contacts: array (list of user IDs)
```

**Create index**: `email` (for search)

#### 2. **chats** Collection
```
/chats/{chatId}
  ├── id: string
  ├── type: string ("direct" | "group")
  ├── participants: array (user IDs)
  ├── participantDetails: map (user info for quick access)
  ├── lastMessage: string
  ├── lastMessageTime: timestamp
  ├── lastMessageSender: string
  ├── unreadCount: map (userId → count)
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  └── isArchived: boolean
```

**Create index**: `participants` (array-contains), `updatedAt` (descending)

#### 3. **messages** Collection (Subcollection)
```
/chats/{chatId}/messages/{messageId}
  ├── id: string
  ├── senderId: string
  ├── senderName: string
  ├── senderAvatar: string
  ├── content: string (text message)
  ├── type: string ("text" | "image" | "video" | "voice" | "call")
  ├── media: object (for media messages)
  │   ├── uri: string (Cloud Storage URL)
  │   ├── type: string ("image" | "video")
  │   ├── fileName: string
  │   ├── fileSize: number
  │   ├── width: number (for images)
  │   ├── height: number (for images)
  │   └── duration: number (for videos)
  ├── reactions: map (emoji → array of user IDs)
  ├── status: string ("sending" | "sent" | "delivered" | "read")
  ├── timestamp: timestamp
  ├── editedAt: timestamp (if edited)
  ├── deletedAt: timestamp (if deleted, soft delete)
  └── replyTo: string (messageId of replied message, optional)
```

**Create index**: `senderId`, `timestamp` (descending)

#### 4. **calls** Collection
```
/calls/{callId}
  ├── id: string
  ├── callerId: string
  ├── callerName: string
  ├── recipientId: string
  ├── recipientName: string
  ├── type: string ("incoming" | "outgoing" | "missed")
  ├── status: string ("ringing" | "active" | "ended")
  ├── startTime: timestamp
  ├── endTime: timestamp
  ├── duration: number (seconds)
  ├── signalingData: object (WebRTC SDP/ICE candidates)
  └── createdAt: timestamp
```

**Create index**: `callerId`, `recipientId`, `createdAt` (descending)

#### 5. **callHistory** Collection
```
/callHistory/{entryId}
  ├── id: string
  ├── callerId: string
  ├── callerName: string
  ├── recipientId: string
  ├── recipientName: string
  ├── type: string ("incoming" | "outgoing" | "missed")
  ├── duration: number (seconds)
  ├── startTime: timestamp
  └── createdAt: timestamp
```

**Create index**: `callerId`, `recipientId`, `createdAt` (descending)

---

## Phase 3: Firestore Security Rules

Replace the default security rules with these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuth() {
      return request.auth != null;
    }

    function isUser(userId) {
      return request.auth.uid == userId;
    }

    function isParticipant(chatId) {
      return request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuth();
      allow create: if isUser(userId);
      allow update: if isUser(userId);
      allow delete: if isUser(userId);
    }

    // Chats collection
    match /chats/{chatId} {
      allow read: if isAuth() && isParticipant(chatId);
      allow create: if isAuth();
      allow update: if isAuth() && isParticipant(chatId);
      allow delete: if isAuth() && isParticipant(chatId);

      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isAuth() && isParticipant(chatId);
        allow create: if isAuth() && isParticipant(chatId);
        allow update: if isAuth() && (resource.data.senderId == request.auth.uid);
        allow delete: if isAuth() && (resource.data.senderId == request.auth.uid);
      }
    }

    // Calls collection
    match /calls/{callId} {
      allow read: if isAuth() && (
        request.auth.uid == resource.data.callerId ||
        request.auth.uid == resource.data.recipientId
      );
      allow create: if isAuth();
      allow update: if isAuth() && (
        request.auth.uid == resource.data.callerId ||
        request.auth.uid == resource.data.recipientId
      );
    }

    // Call history
    match /callHistory/{entryId} {
      allow read: if isAuth() && (
        request.auth.uid == resource.data.callerId ||
        request.auth.uid == resource.data.recipientId
      );
      allow create: if isAuth();
    }
  }
}
```

---

## Phase 4: Cloud Storage Security Rules

Replace the default storage rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Media uploads (images, videos)
    match /media/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId && 
                      (request.resource.size < 50 * 1024 * 1024) && // 50MB max
                      request.resource.contentType.matches('image/.*|video/.*');
    }

    // Avatars
    match /avatars/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId && 
                      (request.resource.size < 5 * 1024 * 1024) && // 5MB max
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## Phase 5: Environment Configuration

### Step 5.1: Create `.env` File

Create a `.env` file in the project root:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

# App Configuration
EXPO_PUBLIC_APP_NAME=Cool Messenger
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Step 5.2: Create Firebase Config File

Create `lib/firebase-config.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

---

## Phase 6: Firebase Integration in App

### Step 6.1: Update Auth Provider

Update `lib/auth-provider.tsx` to use Firebase Authentication:

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase-config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface User {
  uid: string;
  email: string;
  displayName: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignUp = async (email: string, password: string, displayName: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    const userData: User = {
      uid: firebaseUser.uid,
      email,
      displayName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'online',
      contacts: [],
    });

    setUser(userData);
  };

  const handleSignIn = async (email: string, password: string) => {
    const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      setUser(userDoc.data() as User);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Step 6.2: Update Chat Service

Update `lib/chat-service.ts` to use Firestore:

```typescript
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase-config';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'voice';
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  reactions?: Record<string, string[]>;
}

export const chatService = {
  // Create or get direct chat
  async getOrCreateDirectChat(userId1: string, userId2: string) {
    const chatId = [userId1, userId2].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        id: chatId,
        type: 'direct',
        participants: [userId1, userId2],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastMessage: '',
        lastMessageTime: Timestamp.now(),
      });
    }

    return chatId;
  },

  // Send message
  async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    content: string,
    type: 'text' | 'image' | 'video' = 'text'
  ) {
    const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId,
      senderName,
      senderAvatar,
      content,
      type,
      status: 'sent',
      timestamp: Timestamp.now(),
      reactions: {},
    });

    // Update chat's last message
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: content,
      lastMessageTime: Timestamp.now(),
      lastMessageSender: senderId,
      updatedAt: Timestamp.now(),
    });

    return messageRef.id;
  },

  // Listen to messages in real-time
  onMessagesChange(chatId: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toMillis(),
      })) as Message[];

      callback(messages);
    });
  },

  // Add reaction to message
  async addReaction(chatId: string, messageId: string, emoji: string, userId: string) {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      [`reactions.${emoji}`]: arrayUnion(userId),
    });
  },
};
```

### Step 6.3: Update Call Service

Update `lib/call-service.ts` to use Firestore:

```typescript
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CallHistory {
  id: string;
  callerId: string;
  callerName: string;
  recipientId: string;
  recipientName: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: number;
  startTime: number;
}

export const callService = {
  // Save call to Firestore
  async saveCallToHistory(
    callerId: string,
    callerName: string,
    recipientId: string,
    recipientName: string,
    startTime: number,
    duration: number,
    type: 'incoming' | 'outgoing' | 'missed'
  ) {
    await addDoc(collection(db, 'callHistory'), {
      callerId,
      callerName,
      recipientId,
      recipientName,
      type,
      duration,
      startTime: Timestamp.fromMillis(startTime),
      createdAt: Timestamp.now(),
    });
  },

  // Get call history from Firestore
  async getCallHistory(userId: string): Promise<CallHistory[]> {
    const q = query(
      collection(db, 'callHistory'),
      where('callerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime.toMillis(),
    })) as CallHistory[];
  },

  // Get missed calls
  async getMissedCalls(userId: string): Promise<CallHistory[]> {
    const q = query(
      collection(db, 'callHistory'),
      where('recipientId', '==', userId),
      where('type', '==', 'missed'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime.toMillis(),
    })) as CallHistory[];
  },
};
```

### Step 6.4: Update Media Service

Update `lib/media-service.ts` to use Cloud Storage:

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase-config';

export const mediaService = {
  // Upload media to Cloud Storage
  async uploadMedia(
    userId: string,
    fileUri: string,
    fileName: string,
    fileType: 'image' | 'video'
  ): Promise<string> {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const storageRef = ref(storage, `media/${userId}/${Date.now()}_${fileName}`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  },

  // Upload avatar
  async uploadAvatar(userId: string, fileUri: string): Promise<string> {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const storageRef = ref(storage, `avatars/${userId}/profile.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },
};
```

---

## Phase 7: Install Firebase Dependencies

Run the following command:

```bash
pnpm add firebase
```

---

## Phase 8: Testing the Integration

### Test Checklist

- [ ] **Authentication**
  - [ ] Sign up with email/password
  - [ ] Sign in with existing account
  - [ ] Sign out
  - [ ] User data persists in Firestore

- [ ] **Chat**
  - [ ] Send text messages
  - [ ] Messages appear in real-time
  - [ ] Message status updates (sending → sent → delivered)
  - [ ] Add emoji reactions to messages
  - [ ] Messages persist in Firestore

- [ ] **Media**
  - [ ] Pick and preview images
  - [ ] Pick and preview videos
  - [ ] Upload media to Cloud Storage
  - [ ] Media messages appear in chat
  - [ ] Media URLs are accessible

- [ ] **Calls**
  - [ ] Initiate call
  - [ ] Call history is saved
  - [ ] Missed calls are tracked
  - [ ] Call duration is recorded

- [ ] **Contacts**
  - [ ] View list of users
  - [ ] Search for contacts
  - [ ] Add contacts to favorites

---

## Phase 9: Deployment to Production

### Step 9.1: Update Security Rules

Before deploying to production, update Firestore and Storage rules to be more restrictive:

**Firestore Rules (Production)**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuth() {
      return request.auth != null;
    }

    function isUser(userId) {
      return request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read: if isAuth();
      allow create: if isUser(userId) && request.resource.data.uid == userId;
      allow update: if isUser(userId);
      allow delete: if false; // Prevent deletion
    }

    match /chats/{chatId} {
      allow read, write: if isAuth() && 
        request.auth.uid in resource.data.participants;
    }

    match /chats/{chatId}/messages/{messageId} {
      allow read: if isAuth() && 
        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      allow create: if isAuth();
      allow update, delete: if isAuth() && 
        resource.data.senderId == request.auth.uid;
    }
  }
}
```

### Step 9.2: Build APK/IPA

```bash
# For Android
eas build --platform android

# For iOS
eas build --platform ios
```

### Step 9.3: Deploy to App Stores

- **Google Play Store**: Follow [Expo EAS Submit](https://docs.expo.dev/submit/android/)
- **Apple App Store**: Follow [Expo EAS Submit](https://docs.expo.dev/submit/ios/)

---

## Troubleshooting

### Issue: Messages not syncing
**Solution**: Check Firestore security rules and ensure user is authenticated.

### Issue: Media upload fails
**Solution**: Verify Cloud Storage rules allow uploads and check file size limits.

### Issue: Real-time updates not working
**Solution**: Ensure `onSnapshot` listeners are properly set up and not unsubscribed prematurely.

### Issue: Authentication fails
**Solution**: Verify Firebase config is correct and authentication method is enabled in Firebase Console.

---

## Performance Optimization

1. **Pagination**: Load messages in batches of 20-50
2. **Caching**: Use local AsyncStorage for offline support
3. **Indexes**: Create composite indexes for complex queries
4. **Cloud Functions**: Use for server-side operations (optional)

---

## Security Best Practices

1. ✅ Use environment variables for Firebase config
2. ✅ Implement proper Firestore security rules
3. ✅ Validate all user inputs
4. ✅ Use HTTPS for all communications
5. ✅ Implement rate limiting (via Cloud Functions)
6. ✅ Enable two-factor authentication for admin accounts

---

## Next Steps

1. Follow Phase 1-5 to set up Firebase
2. Implement code changes from Phase 6
3. Install Firebase SDK (Phase 7)
4. Run tests from Phase 8
5. Deploy to production (Phase 9)

For questions or issues, refer to [Firebase Documentation](https://firebase.google.com/docs).
