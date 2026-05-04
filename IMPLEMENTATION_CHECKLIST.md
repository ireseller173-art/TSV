# Firebase Implementation Checklist

## Phase 1: Firebase Project Setup ✅

- [ ] Create Firebase project at console.firebase.google.com
- [ ] Enable Authentication (Email/Password)
- [ ] Enable Firestore Database (us-central1, Test mode)
- [ ] Enable Cloud Storage (us-central1)
- [ ] Get Firebase config from Project Settings
- [ ] Create `.env` file with config values
- [ ] Run `pnpm add firebase`

## Phase 2: Firestore Collections ✅

### Create Collections

- [ ] `/users` - User profiles
- [ ] `/chats` - Chat rooms
- [ ] `/chats/{chatId}/messages` - Messages (subcollection)
- [ ] `/calls` - Active calls
- [ ] `/callHistory` - Call history

### Create Indexes

- [ ] `users`: email (ascending)
- [ ] `chats`: participants (array-contains), updatedAt (descending)
- [ ] `chats/messages`: timestamp (descending)
- [ ] `calls`: callerId, recipientId, createdAt (descending)
- [ ] `callHistory`: callerId, recipientId, createdAt (descending)

## Phase 3: Security Rules ✅

- [ ] Copy Firestore rules from FIREBASE_SETUP.md
- [ ] Copy Storage rules from FIREBASE_SETUP.md
- [ ] Test rules in Firebase Console
- [ ] Verify test mode is enabled (for development)

## Phase 4: Code Integration ✅

### Update Auth Provider

- [ ] Create `lib/firebase-config.ts`
- [ ] Update `lib/auth-provider.tsx` to use Firebase Auth
- [ ] Test signup with email/password
- [ ] Test login with existing account
- [ ] Test logout
- [ ] Verify user data saved to Firestore

### Update Chat Service

- [ ] Update `lib/chat-service.ts` to use Firestore
- [ ] Implement `getOrCreateDirectChat()`
- [ ] Implement `sendMessage()` with Firestore
- [ ] Implement `onMessagesChange()` with real-time listener
- [ ] Test sending messages
- [ ] Test real-time message sync
- [ ] Test message reactions

### Update Call Service

- [ ] Update `lib/call-service.ts` to use Firestore
- [ ] Implement `saveCallToHistory()` with Firestore
- [ ] Implement `getCallHistory()` from Firestore
- [ ] Implement `getMissedCalls()` from Firestore
- [ ] Test call history saving
- [ ] Test call history retrieval

### Update Media Service

- [ ] Update `lib/media-service.ts` to use Cloud Storage
- [ ] Implement `uploadMedia()` to Cloud Storage
- [ ] Implement `uploadAvatar()` to Cloud Storage
- [ ] Test image upload
- [ ] Test video upload
- [ ] Verify download URLs work

## Phase 5: Feature Testing ✅

### Authentication Tests

- [ ] Sign up with email/password
- [ ] Verify user created in Firestore
- [ ] Sign in with existing account
- [ ] Verify session persists on app restart
- [ ] Sign out and verify session cleared

### Chat Tests

- [ ] Create new chat with contact
- [ ] Send text message
- [ ] Verify message appears in Firestore
- [ ] Receive message in real-time
- [ ] Add emoji reaction to message
- [ ] Verify reaction saved in Firestore
- [ ] Edit message
- [ ] Delete message (soft delete)

### Media Tests

- [ ] Pick image from library
- [ ] Preview image before sending
- [ ] Send image with caption
- [ ] Verify image uploaded to Cloud Storage
- [ ] Verify image URL works
- [ ] Pick video from library
- [ ] Send video with caption
- [ ] Verify video uploaded to Cloud Storage

### Call Tests

- [ ] Initiate call
- [ ] Accept call
- [ ] Reject call
- [ ] Mute/unmute microphone
- [ ] Toggle speaker/earpiece
- [ ] End call
- [ ] Verify call saved to history
- [ ] View call history
- [ ] Verify missed calls tracked

### User & Contact Tests

- [ ] View user profile
- [ ] Edit profile
- [ ] Upload profile picture
- [ ] View contacts list
- [ ] Search for contact
- [ ] See online/offline status
- [ ] See last seen time

## Phase 6: Performance Optimization ✅

- [ ] Enable Firestore offline persistence
- [ ] Implement message pagination (load 20 at a time)
- [ ] Add loading indicators
- [ ] Optimize image compression
- [ ] Test with slow network
- [ ] Monitor Firestore read/write counts

## Phase 7: Security Hardening ✅

- [ ] Update Firestore rules to production mode
- [ ] Update Storage rules to production mode
- [ ] Enable two-factor authentication for Firebase account
- [ ] Set up billing alerts
- [ ] Review security rules for vulnerabilities
- [ ] Test that unauthorized users can't access data

## Phase 8: Deployment ✅

### Build for Testing

- [ ] Build APK for Android testing
- [ ] Build IPA for iOS testing
- [ ] Test on real devices
- [ ] Test on slow network
- [ ] Test with multiple users simultaneously

### Production Deployment

- [ ] Update app version number
- [ ] Update app.config.ts with production settings
- [ ] Build production APK
- [ ] Build production IPA
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store
- [ ] Monitor crash logs
- [ ] Monitor performance metrics

## Phase 9: Post-Launch ✅

- [ ] Monitor Firestore usage
- [ ] Monitor Storage usage
- [ ] Monitor Authentication usage
- [ ] Set up alerts for quota limits
- [ ] Collect user feedback
- [ ] Fix bugs and issues
- [ ] Plan for scaling to 100+ users

---

## Quick Verification

### Test Locally First

```bash
# Start dev server
pnpm dev

# Open in browser
# https://8081-xxx.manus.computer

# Test flow:
# 1. Sign up with test@example.com
# 2. Create new chat
# 3. Send message
# 4. Check Firestore console for data
# 5. Refresh page - message should still be there
```

### Check Firestore Console

1. Go to Firebase Console
2. Go to Firestore Database
3. Verify collections created:
   - `/users` has your user document
   - `/chats` has chat document
   - `/chats/{chatId}/messages` has message documents
   - `/callHistory` has call entries

### Check Cloud Storage

1. Go to Firebase Console
2. Go to Storage
3. Verify folders created:
   - `/media/{userId}/` has uploaded images/videos
   - `/avatars/{userId}/` has profile pictures

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Firebase not initialized" | Check `.env` file has all config values |
| "Permission denied" | Check Firestore security rules are correct |
| "Messages not syncing" | Check browser console for errors, verify `onSnapshot` is set up |
| "Upload fails" | Check Cloud Storage rules, verify file size limits |
| "User not found" | Check `/users` collection has user document |

---

## Success Criteria

✅ All features working with Firebase  
✅ Real-time sync working  
✅ Messages persist after app restart  
✅ Media uploads working  
✅ Call history saved  
✅ Security rules preventing unauthorized access  
✅ App ready for production deployment  

---

## Final Steps

1. Complete all checkboxes above
2. Run full test suite
3. Deploy to production
4. Monitor for issues
5. Celebrate! 🎉
