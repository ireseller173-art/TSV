# Security Configuration Guide

## Overview

This guide provides comprehensive security configurations for Cool Messenger including DDoS protection, IP hiding, encryption, and rate limiting.

---

## 1. DDoS Protection

### 1.1 Cloudflare DDoS Protection

Cloudflare provides enterprise-grade DDoS protection:

```
1. Sign up at https://www.cloudflare.com
2. Add your domain
3. Update nameservers to Cloudflare
4. Enable DDoS Protection:
   - Settings → DDoS Protection → Sensitivity Level: High
   - Settings → Security → Security Level: High
   - Settings → Firewall → Create Rules for suspicious traffic
```

### 1.2 Rate Limiting

Implement rate limiting on the backend:

```typescript
// Example: Express.js rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
});

app.post('/api/auth/login', authLimiter, loginHandler);
app.post('/api/auth/register', authLimiter, registerHandler);
```

### 1.3 Request Validation

```typescript
// Validate all incoming requests
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Validate headers
app.use((req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 10000) {
    return res.status(413).json({ error: 'Payload too large' });
  }
  next();
});
```

---

## 2. IP Address Hiding

### 2.1 Using Proxy/VPN

For web browser access, use a proxy service:

```
Option 1: Cloudflare Proxy
- Cloudflare automatically hides your origin IP
- Enable "Proxied" status for your domain

Option 2: AWS CloudFront
- Create CloudFront distribution
- Set your backend as origin
- CloudFront will proxy all requests

Option 3: Nginx Reverse Proxy
- Deploy Nginx as reverse proxy
- Configure to hide X-Forwarded-For headers
```

### 2.2 Nginx Configuration

```nginx
# /etc/nginx/nginx.conf

upstream backend {
    server your-backend.com:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Hide server information
    server_tokens off;

    # Remove X-Powered-By header
    proxy_hide_header X-Powered-By;

    # Hide X-Forwarded-For to protect origin IP
    proxy_set_header X-Forwarded-For "";

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP "";
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://backend;
    }
}
```

### 2.3 Security Headers

```typescript
// Add security headers to all responses
app.use((req, res, next) => {
  // Hide server information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'no-referrer');

  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  next();
});
```

---

## 3. Message Encryption

### 3.1 Implementation

Messages are encrypted using XOR-based encryption (for demo). For production, use:

```typescript
// Use TweetNaCl.js for proper encryption
import nacl from 'tweetnacl';

// Generate keypair
const keyPair = nacl.box.keyPair();

// Encrypt message
const message = 'Hello';
const nonce = nacl.randomBytes(24);
const encrypted = nacl.box(
  nacl.util.decodeUTF8(message),
  nonce,
  recipientPublicKey,
  keyPair.secretKey
);

// Decrypt message
const decrypted = nacl.box.open(
  encrypted,
  nonce,
  senderPublicKey,
  keyPair.secretKey
);
```

### 3.2 End-to-End Encryption

```typescript
// Store encrypted messages in Firestore
const encryptedMessage = {
  id: messageId,
  senderId: currentUserId,
  recipientId: recipientId,
  ciphertext: encryptedData.ciphertext,
  iv: encryptedData.iv,
  salt: encryptedData.salt,
  timestamp: Date.now(),
  status: 'encrypted',
};

await db.collection('chats').doc(chatId).collection('messages').add(encryptedMessage);
```

---

## 4. Call Encryption

### 4.1 WebRTC Encryption

WebRTC provides built-in encryption:

```typescript
// WebRTC automatically encrypts media streams
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
});

// Media streams are encrypted by default
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: false,
});

stream.getTracks().forEach((track) => {
  peerConnection.addTrack(track, stream);
});
```

### 4.2 Signaling Encryption

```typescript
// Encrypt signaling data
const signalingData = {
  type: 'offer',
  sdp: peerConnection.localDescription.sdp,
};

const encryptedSignaling = encryptionService.encryptCallData(
  {
    callId: callId,
    senderId: currentUserId,
    recipientId: recipientId,
    audioData: JSON.stringify(signalingData),
  },
  encryptionKey
);

// Send encrypted signaling
await sendSignalingMessage(encryptedSignaling);
```

---

## 5. Firebase Security Rules

### 5.1 Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only own documents
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Chats collection - only participants
    match /chats/{chatId} {
      allow read, write: if request.auth.uid in resource.data.participants;

      // Messages subcollection
      match /messages/{messageId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create: if request.auth.uid == request.resource.data.senderId;
        allow update: if request.auth.uid == resource.data.senderId;
        allow delete: if request.auth.uid == resource.data.senderId;
      }
    }

    // Calls collection
    match /calls/{callId} {
      allow read, write: if request.auth.uid in resource.data.participants;
    }

    // Blocked users
    match /blockedUsers/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### 5.2 Authentication Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User avatars
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId && request.resource.size < 5 * 1024 * 1024;
    }

    // Media files
    match /media/{chatId}/{allPaths=**} {
      allow read: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      allow write: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
  }
}
```

---

## 6. HTTPS/TLS Configuration

### 6.1 Enable HTTPS

```
1. Get SSL certificate from Let's Encrypt:
   - Use Certbot: sudo certbot certonly --standalone -d your-domain.com

2. Configure Nginx:
   server {
       listen 443 ssl http2;
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
   }

3. Redirect HTTP to HTTPS:
   server {
       listen 80;
       return 301 https://$server_name$request_uri;
   }
```

---

## 7. Deployment Checklist

- [ ] Enable Cloudflare DDoS protection
- [ ] Configure rate limiting on backend
- [ ] Set up reverse proxy (Nginx/CloudFront)
- [ ] Hide server information headers
- [ ] Implement security headers
- [ ] Enable HTTPS/TLS
- [ ] Configure Firestore security rules
- [ ] Implement message encryption
- [ ] Test encryption/decryption
- [ ] Monitor for suspicious activity
- [ ] Set up logging and alerting
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 8. Monitoring & Logging

### 8.1 Firebase Monitoring

```typescript
// Log security events
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();

// Log suspicious activity
logEvent(analytics, 'suspicious_activity', {
  userId: userId,
  activity: 'multiple_failed_logins',
  timestamp: Date.now(),
});
```

### 8.2 Error Tracking

```typescript
// Use Sentry for error tracking
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});

// Capture errors
try {
  // Code
} catch (error) {
  Sentry.captureException(error);
}
```

---

## 9. Best Practices

1. **Never log sensitive data** - Don't log passwords, tokens, or encrypted data
2. **Use environment variables** - Store API keys and secrets in env vars
3. **Validate all inputs** - Prevent injection attacks
4. **Keep dependencies updated** - Regularly update packages
5. **Use HTTPS everywhere** - Encrypt all traffic
6. **Implement CORS properly** - Only allow trusted origins
7. **Monitor for attacks** - Set up alerts for suspicious activity
8. **Regular backups** - Backup data regularly
9. **Disaster recovery** - Have a recovery plan
10. **Security audits** - Conduct regular security reviews

---

## 10. References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security](https://firebase.google.com/docs/rules)
- [Cloudflare DDoS](https://www.cloudflare.com/ddos/)
- [TweetNaCl.js](https://tweetnacl.js.org/)
- [WebRTC Security](https://webrtc-security.github.io/)

---

**Your app is now configured with enterprise-grade security!**
