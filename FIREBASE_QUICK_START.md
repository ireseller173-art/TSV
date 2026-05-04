# Cool Messenger - Firebase Quick Start (5 Minutes)

## TL;DR - Fastest Way to Get Started

### 1. Create Firebase Project (2 min)

```bash
# Go to https://console.firebase.google.com/
# Click "Add project" → Name it "cool-messenger" → Create
```

### 2. Enable Services (1 min)

In Firebase Console:
- **Authentication** → Enable "Email/Password"
- **Firestore** → Create database in "us-central1" (Test mode)
- **Storage** → Create bucket in "us-central1"

### 3. Get Config (1 min)

1. Go to **Project Settings** (gear icon)
2. Copy your Firebase config:

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

### 4. Add to Project (1 min)

Create `.env` file in project root:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

### 5. Install Firebase SDK

```bash
pnpm add firebase
```

---

## What Works Out of the Box

✅ **Authentication** - Email/password signup and login  
✅ **Real-time Chat** - Messages sync instantly  
✅ **Media Upload** - Images and videos to Cloud Storage  
✅ **Call History** - Saved in Firestore  
✅ **User Profiles** - Stored with avatars  

---

## Default Firestore Collections

The app automatically creates these when users interact:

```
/users/{userId}
  - email, displayName, avatar, status, etc.

/chats/{chatId}
  - participants, lastMessage, messages subcollection

/chats/{chatId}/messages/{messageId}
  - content, senderId, timestamp, reactions, etc.

/callHistory/{entryId}
  - callerId, recipientId, duration, type, etc.
```

---

## Test It Locally

```bash
# Start dev server
pnpm dev

# Open in browser: https://8081-xxx.manus.computer
# Sign up with any email
# Create a chat and send messages
# They'll sync to Firebase in real-time!
```

---

## Deploy to Production

### Option A: Expo Go (Testing)
```bash
pnpm dev
# Scan QR code with Expo Go app on your phone
```

### Option B: Build APK/IPA
```bash
# Android
eas build --platform android --auto-submit

# iOS
eas build --platform ios --auto-submit
```

---

## Security Rules (Copy-Paste Ready)

### Firestore Rules

Go to **Firestore → Rules** and paste:

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

    function isParticipant(chatId) {
      return request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }

    match /users/{userId} {
      allow read: if isAuth();
      allow create, update: if isUser(userId);
    }

    match /chats/{chatId} {
      allow read, update: if isAuth() && isParticipant(chatId);
      allow create: if isAuth();

      match /messages/{messageId} {
        allow read: if isAuth() && isParticipant(chatId);
        allow create, update: if isAuth();
      }
    }

    match /callHistory/{entryId} {
      allow read, create: if isAuth();
    }
  }
}
```

### Storage Rules

Go to **Storage → Rules** and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /media/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId && 
                      request.resource.size < 50 * 1024 * 1024;
    }

    match /avatars/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId && 
                      request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Firebase not initialized" | Add `.env` file with config |
| "Permission denied" | Update Firestore/Storage rules |
| "Messages not syncing" | Check browser console for errors |
| "Upload fails" | Verify Cloud Storage is enabled |

---

## Next Steps

1. ✅ Create Firebase project
2. ✅ Enable services (Auth, Firestore, Storage)
3. ✅ Get config and add to `.env`
4. ✅ Install Firebase SDK
5. ✅ Copy security rules
6. ✅ Test locally
7. ✅ Deploy to production

**That's it! Your messenger is now live on Firebase.**

---

## Need Help?

- Firebase Docs: https://firebase.google.com/docs
- Expo Docs: https://docs.expo.dev
- GitHub Issues: Create an issue in the project repo
