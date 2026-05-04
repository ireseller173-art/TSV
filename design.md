# Cool Messenger - Mobile App Design Plan

## Overview

A modern, feature-rich messenger app for ~100 users with real-time chat, audio calls, and engaging features. Designed for iOS-first experience with Android support. All interactions optimized for one-handed portrait usage (9:16 aspect ratio).

---

## Screen List

1. **Splash Screen** — App logo, loading indicator, brand colors
2. **Auth Screens** — Login/Register with phone/email, OTP verification
3. **Chat List Screen** — All conversations, search, create new chat
4. **Chat Detail Screen** — 1-on-1 or group conversation, message history
5. **Audio Call Screen** — Active call UI with controls, end call
6. **Incoming Call Screen** — Accept/Reject incoming calls
7. **Contacts Screen** — Browse all users, start new chat
8. **Profile Screen** — User profile, status, settings
9. **Group Creation Screen** — Create group, add members
10. **Settings Screen** — App settings, notifications, privacy, logout

---

## Primary Content & Functionality

### Chat List Screen
- **Content**: List of recent conversations (1-on-1 + groups)
- **Per Item**: User avatar, name, last message preview, timestamp, unread badge
- **Functionality**: Tap to open chat, long-press for options (pin, mute, delete), search by name
- **Actions**: FAB to create new chat, access contacts

### Chat Detail Screen
- **Content**: Message history (scrollable), input area at bottom
- **Message Types**: Text, images, voice messages, reactions (emoji), mentions
- **Per Message**: Avatar, name, timestamp, read receipt (checkmarks)
- **Functionality**: Send message, attach image, record voice message, add reaction, forward, delete, reply
- **Features**: Typing indicator, "online" status, delivery status (pending/sent/read)

### Audio Call Screen
- **Content**: Large caller avatar, name, call duration, signal strength
- **Controls**: Mute/Unmute, Speaker/Earpiece toggle, End Call button
- **Functionality**: Accept/reject, switch audio route, end call

### Contacts Screen
- **Content**: Alphabetical list of all app users
- **Per Item**: Avatar, name, status (online/offline/away), last seen
- **Functionality**: Tap to start chat, view profile, add to favorites

### Profile Screen
- **Content**: User avatar (editable), name, phone/email, status message, joined date
- **Functionality**: Edit profile, change status, view account settings

---

## Key User Flows

### Flow 1: Send a Message
1. User taps Chat List
2. Selects conversation or creates new one
3. Types message in input field
4. Taps Send button
5. Message appears with "sending" state
6. Transitions to "sent" (1 checkmark) then "read" (2 checkmarks)

### Flow 2: Make an Audio Call
1. User opens Chat Detail screen
2. Taps phone icon (call button)
3. Incoming Call screen appears on recipient's device
4. Recipient taps Accept
5. Audio Call screen shows for both users
6. Either user taps End Call to disconnect

### Flow 3: Create Group Chat
1. User taps FAB on Chat List
2. Selects "New Group"
3. Enters group name
4. Selects members from Contacts
5. Taps Create
6. Group appears in Chat List

### Flow 4: Record Voice Message
1. User opens Chat Detail
2. Long-presses microphone icon
3. Records audio (visual waveform feedback)
4. Releases to send (or swipes left to cancel)
5. Voice message appears as playable bubble

### Flow 5: Add Reaction to Message
1. User long-presses a message
2. Reaction picker appears (emoji options)
3. Selects emoji
4. Reaction badge appears on message

---

## Color Scheme

### Primary Brand Colors
- **Primary Accent**: `#0A7EA4` (vibrant teal-blue) — buttons, highlights, active states
- **Secondary**: `#FF6B6B` (coral red) — notifications, online status, call buttons
- **Success**: `#22C55E` (bright green) — sent/read indicators, success states

### Neutral Colors
- **Background**: `#FFFFFF` (light) / `#151718` (dark)
- **Surface**: `#F5F5F5` (light) / `#1E2022` (dark) — message bubbles, cards
- **Text Primary**: `#11181C` (light) / `#ECEDEE` (dark)
- **Text Secondary**: `#687076` (light) / `#9BA1A6` (dark) — timestamps, metadata
- **Border**: `#E5E7EB` (light) / `#334155` (dark)

### Message Bubbles
- **Sent (User)**: Gradient from `#0A7EA4` to `#0891B2` (teal)
- **Received**: `#F5F5F5` (light) / `#2D3139` (dark)

### Status Indicators
- **Online**: `#22C55E` (bright green)
- **Away**: `#F59E0B` (amber)
- **Offline**: `#9CA3AF` (gray)

---

## Typography & Spacing

- **Headings**: SF Pro Display (iOS) / Roboto (Android), 24-28px, bold
- **Body Text**: SF Pro Text / Roboto, 16px, regular
- **Captions**: 12-14px, secondary color
- **Line Height**: 1.4-1.6× for readability
- **Spacing**: 8px base unit (8, 12, 16, 24, 32px)

---

## Interaction Patterns

### Gestures
- **Tap**: Open chat, send message, accept call
- **Long Press**: Message options, reaction picker, voice message recording
- **Swipe Left**: Delete message, mute conversation
- **Swipe Right**: Reply to message
- **Pull to Refresh**: Reload chat list (if needed)

### Feedback
- **Haptic**: Light tap on send, medium on call connect, success on message delivery
- **Visual**: Loading spinners, skeleton screens, toast notifications
- **Audio**: Notification sound for new messages (mutable)

---

## Cool Features to Implement

1. **Message Reactions** — Emoji reactions on any message
2. **Voice Messages** — Record and send audio clips
3. **Typing Indicators** — "User is typing..." status
4. **Read Receipts** — Checkmarks for sent/delivered/read
5. **Online Status** — Real-time user presence
6. **Message Search** — Full-text search in conversations
7. **Pinned Messages** — Pin important messages in group chats
8. **User Stories** — Share ephemeral status updates (24h)
9. **Message Forwarding** — Forward messages to other chats
10. **Dark Mode** — Full dark mode support with smooth transitions
11. **Notification Badges** — Unread message count on app icon & chat list
12. **Call History** — Log of missed/completed calls
13. **Favorites** — Star favorite contacts for quick access
14. **Message Reactions Analytics** — See who reacted with what

---

## Responsive Design Notes

- **Notch Handling**: SafeArea insets for iPhone X+ and Android devices
- **Tab Bar**: Fixed at bottom, 56px height + safe area
- **Chat Input**: Stays above keyboard, expands with multi-line text
- **Message Bubbles**: Max width 85% of screen, wrap text appropriately
- **Landscape**: Not supported initially (portrait-only)

---

## Accessibility

- **Contrast**: All text meets WCAG AA standards (4.5:1 ratio)
- **Touch Targets**: Minimum 44×44pt for interactive elements
- **Labels**: All icons have semantic labels for screen readers
- **Focus States**: Clear visual focus indicators for keyboard navigation
- **Font Scaling**: Respects system font size preferences

