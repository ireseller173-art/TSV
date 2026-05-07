# Firestore Database Schema для TSV Keeper

Этот документ описывает структуру базы данных Firestore для приложения TSV Keeper.

## Коллекции и документы

### 1. `users` - Коллекция пользователей

**Путь:** `/users/{userId}`

**Документ:**
```typescript
{
  id: string;                    // Firebase UID пользователя
  name: string;                  // Имя пользователя
  email: string;                 // Email адрес
  phone: string;                 // Номер телефона
  avatar?: string;               // URL аватара
  status?: string;               // Статус пользователя ("Hey there! I am using TSV Keeper")
  isOnline?: boolean;            // Онлайн ли пользователь
  lastSeen?: Timestamp;          // Последний раз был онлайн
  createdAt?: Timestamp;         // Дата создания профиля
  blockedUsers?: string[];       // Массив ID заблокированных пользователей
  favorites?: string[];          // Массив ID избранных контактов
}
```

**Индексы:**
- `email` (для поиска по email)
- `isOnline` (для фильтрации онлайн пользователей)

---

### 2. `chats` - Коллекция чатов

**Путь:** `/chats/{chatId}`

**Документ:**
```typescript
{
  id: string;                    // Уникальный ID чата
  type: 'direct' | 'group';      // Тип чата
  participants: string[];        // Массив ID участников
  createdBy: string;             // ID создателя чата
  createdAt: Timestamp;          // Дата создания
  updatedAt: Timestamp;          // Дата последнего обновления
  lastMessage?: string;          // Текст последнего сообщения
  lastMessageTime?: Timestamp;   // Время последнего сообщения
  lastMessageSender?: string;    // ID отправителя последнего сообщения
  
  // Для групповых чатов:
  name?: string;                 // Название группы
  description?: string;          // Описание группы
  avatar?: string;               // Аватар группы
  admins?: string[];             // ID администраторов группы
}
```

**Подколлекция:** `messages` (см. ниже)

---

### 3. `chats/{chatId}/messages` - Коллекция сообщений

**Путь:** `/chats/{chatId}/messages/{messageId}`

**Документ:**
```typescript
{
  id: string;                    // Уникальный ID сообщения
  chatId: string;                // ID чата
  senderId: string;              // ID отправителя
  senderName: string;            // Имя отправителя
  senderAvatar: string;          // Аватар отправителя
  
  // Содержание сообщения
  type: 'text' | 'image' | 'video' | 'audio' | 'call';
  content: string;               // Текст сообщения или описание медиа
  mediaUrl?: string;             // URL медиафайла (для image/video/audio)
  mediaSize?: number;            // Размер файла в байтах
  mediaDuration?: number;        // Длительность видео/аудио в секундах
  
  // Статус доставки
  status: 'sending' | 'sent' | 'delivered' | 'read';
  createdAt: Timestamp;          // Время отправки
  deliveredAt?: Timestamp;       // Время доставки
  readAt?: Timestamp;            // Время прочтения
  
  // Дополнительно
  replyTo?: string;              // ID сообщения, на которое отвечаем
  reactions?: {                  // Реакции на сообщение
    [emoji: string]: string[];   // emoji: [userId1, userId2, ...]
  };
  isEdited?: boolean;            // Было ли отредактировано
  editedAt?: Timestamp;          // Время редактирования
  isPinned?: boolean;            // Закреплено ли сообщение
  isDeleted?: boolean;           // Удалено ли сообщение
}
```

**Индексы:**
- `chatId, createdAt` (для сортировки сообщений)
- `senderId` (для поиска сообщений пользователя)

---

### 4. `calls` - Коллекция истории звонков

**Путь:** `/calls/{callId}`

**Документ:**
```typescript
{
  id: string;                    // Уникальный ID звонка
  callerId: string;              // ID инициатора звонка
  callerName: string;            // Имя инициатора
  callerAvatar: string;          // Аватар инициатора
  
  recipientId: string;           // ID получателя звонка
  recipientName: string;         // Имя получателя
  recipientAvatar: string;       // Аватар получателя
  
  type: 'incoming' | 'outgoing' | 'missed';
  status: 'ringing' | 'accepted' | 'rejected' | 'missed' | 'ended';
  
  startTime: Timestamp;          // Время начала звонка
  endTime?: Timestamp;           // Время окончания звонка
  duration?: number;             // Длительность звонка в секундах
  
  createdAt: Timestamp;          // Дата звонка
}
```

**Индексы:**
- `callerId, createdAt` (для истории звонков)
- `recipientId, createdAt` (для входящих звонков)

---

### 5. `notes` - Коллекция заметок

**Путь:** `/notes/{userId}/userNotes/{noteId}`

**Документ:**
```typescript
{
  id: string;                    // Уникальный ID заметки
  userId: string;                // ID владельца заметки
  title: string;                 // Заголовок заметки
  content: string;               // Содержание заметки
  date: string;                  // Дата (YYYY-MM-DD)
  time: string;                  // Время (HH:mm)
  createdAt: Timestamp;          // Дата создания
  updatedAt: Timestamp;          // Дата последнего обновления
}
```

---

### 6. `contacts` - Коллекция контактов

**Путь:** `/contacts/{userId}/userContacts/{contactId}`

**Документ:**
```typescript
{
  id: string;                    // Уникальный ID контакта
  userId: string;                // ID владельца контакта
  contactUserId?: string;        // ID пользователя в приложении (если зарегистрирован)
  
  name: string;                  // Имя контакта
  phone: string;                 // Номер телефона
  email?: string;                // Email адрес
  avatar?: string;               // Аватар контакта
  
  isFavorite: boolean;           // Избранный ли контакт
  isBlocked: boolean;            // Заблокирован ли контакт
  
  source: 'manual' | 'phone' | 'import';  // Источник контакта
  createdAt: Timestamp;          // Дата добавления
}
```

---

## Правила безопасности Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать и писать только свой профиль
    match /users/{userId} {
      allow read: if request.auth.uid == userId || 
                     request.auth.uid in resource.data.contacts;
      allow write: if request.auth.uid == userId;
      allow create: if request.auth.uid != null;
    }

    // Чаты - доступ только для участников
    match /chats/{chatId} {
      allow read: if request.auth.uid in resource.data.participants;
      allow write: if request.auth.uid in resource.data.participants;
      allow create: if request.auth.uid != null;
      
      // Сообщения в чатах
      match /messages/{messageId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create: if request.auth.uid != null && 
                        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow update: if request.auth.uid == resource.data.senderId;
        allow delete: if request.auth.uid == resource.data.senderId;
      }
    }

    // Звонки - доступ для инициатора и получателя
    match /calls/{callId} {
      allow read: if request.auth.uid == resource.data.callerId || 
                     request.auth.uid == resource.data.recipientId;
      allow create: if request.auth.uid != null;
    }

    // Заметки - только личные
    match /notes/{userId}/userNotes/{noteId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Контакты - только личные
    match /contacts/{userId}/userContacts/{contactId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## Индексы для производительности

Создайте следующие индексы в Firebase Console для оптимальной производительности:

1. **Коллекция `users`:**
   - Поле: `isOnline` (Ascending)
   - Поле: `lastSeen` (Descending)

2. **Коллекция `chats`:**
   - Поле: `participants` (Array)
   - Поле: `updatedAt` (Descending)

3. **Коллекция `chats/{chatId}/messages`:**
   - Поле: `chatId` (Ascending)
   - Поле: `createdAt` (Descending)

4. **Коллекция `calls`:**
   - Поле: `callerId` (Ascending)
   - Поле: `createdAt` (Descending)
   - Поле: `recipientId` (Ascending)
   - Поле: `createdAt` (Descending)

---

## Примеры запросов

### Получить все чаты пользователя
```typescript
const chatsRef = collection(db, 'chats');
const q = query(chatsRef, where('participants', 'array-contains', userId));
const snapshot = await getDocs(q);
```

### Получить сообщения из чата
```typescript
const messagesRef = collection(db, 'chats', chatId, 'messages');
const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));
const snapshot = await getDocs(q);
```

### Получить историю звонков
```typescript
const callsRef = collection(db, 'calls');
const q = query(
  callsRef,
  where('callerId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(20)
);
const snapshot = await getDocs(q);
```

---

## Рекомендации

1. **Размер документов:** Старайтесь держать документы меньше 1 МБ
2. **Вложенные данные:** Используйте подколлекции для больших наборов данных
3. **Realtime слушатели:** Используйте `onSnapshot()` для синхронизации в реальном времени
4. **Кэширование:** Включите offline persistence для лучшего UX
5. **Оптимизация:** Используйте индексы для частых запросов

