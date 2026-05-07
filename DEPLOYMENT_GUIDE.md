# 📱 TSV Keeper - Руководство по развертыванию

**Версия:** 1.0.0  
**Дата:** 7 мая 2026  
**Язык:** Русский

---

## 🚀 Быстрый старт

### Шаг 1: Установка зависимостей

```bash
# Установить Node.js (если не установлен)
# https://nodejs.org/ (версия 18+)

# Установить Firebase CLI
npm install -g firebase-tools

# Установить зависимости проекта
cd /home/ubuntu/cool-messenger
npm install
```

### Шаг 2: Настройка Firebase

```bash
# Войти в Firebase
firebase login

# Инициализировать Firebase проект
firebase init

# Выбрать опции:
# - Firestore Database
# - Cloud Storage
# - Cloud Functions
# - Hosting
```

### Шаг 3: Установка переменных окружения

Создать файл `.env.local`:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

Получить эти значения:
1. Перейти на https://console.firebase.google.com
2. Выбрать проект
3. Перейти в "Project Settings" (иконка шестерёнки)
4. Скопировать конфиг из раздела "Your apps"

### Шаг 4: Развертывание Firestore Rules

```bash
# Развернуть правила безопасности
firebase deploy --only firestore:rules

# Развернуть индексы
firebase deploy --only firestore:indexes

# Развернуть Storage Rules
firebase deploy --only storage
```

### Шаг 5: Развертывание Cloud Functions

```bash
# Развернуть Cloud Functions
firebase deploy --only functions
```

### Шаг 6: Запуск приложения

```bash
# Разработка
npm run dev

# Сборка для iOS
npm run ios

# Сборка для Android
npm run android

# Веб-версия
npm run dev:metro
```

---

## 📋 Конфигурация Firebase

### Firestore Database

**Коллекции:**
- `users` - профили пользователей
- `chats` - чаты между пользователями
- `chats/{chatId}/messages` - сообщения в чате
- `groups` - групповые чаты
- `groups/{groupId}/messages` - сообщения в группе
- `contacts` - контакты пользователей
- `presence` - статусы онлайн
- `notifications` - уведомления

### Cloud Storage

**Папки:**
- `/users/{userId}/` - аватары и файлы пользователя
- `/chats/{chatId}/` - медиа в чатах
- `/groups/{groupId}/` - медиа в группах
- `/avatars/{userId}/` - аватары

### Security Rules

**Правила безопасности:**
- Только аутентифицированные пользователи могут читать/писать
- Пользователи могут читать только свои данные и данные чатов, в которых они участвуют
- Редактировать/удалять могут только авторы сообщений
- Максимальный размер файла: 100 МБ

---

## 🔧 Переменные окружения

| Переменная | Описание | Пример |
|-----------|---------|--------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase API ключ | `AIzaSyD...` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Домен аутентификации | `project.firebaseapp.com` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ID проекта | `my-project-123` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket хранилища | `project.appspot.com` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID отправителя | `123456789` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | ID приложения | `1:123456789:web:abc...` |

---

## 📱 Сборка APK/IPA

### Android (APK)

```bash
# Требуется Java Development Kit (JDK)
# https://www.oracle.com/java/technologies/downloads/

# Сборка APK
eas build --platform android

# Сборка для тестирования
eas build --platform android --profile preview
```

### iOS (IPA)

```bash
# Требуется macOS и Xcode
# https://developer.apple.com/xcode/

# Сборка IPA
eas build --platform ios

# Сборка для тестирования
eas build --platform ios --profile preview
```

---

## 🧪 Тестирование

```bash
# Запустить все тесты
npm test

# Запустить тесты с покрытием
npm test -- --coverage

# Запустить конкретный тест
npm test -- __tests__/chat-service.test.ts
```

**Текущее состояние:**
- ✅ 167 тестов проходят успешно
- ✅ 0 TypeScript ошибок
- ✅ Dev server работает без ошибок

---

## 🐛 Решение проблем

### Проблема: "Cannot find module 'firebase'"

**Решение:**
```bash
npm install firebase
```

### Проблема: "Firebase config is missing"

**Решение:**
1. Проверить `.env.local` файл
2. Убедиться, что все переменные заполнены
3. Перезапустить dev server

### Проблема: "Firestore rules error"

**Решение:**
```bash
# Проверить синтаксис правил
firebase deploy --only firestore:rules --dry-run

# Развернуть правила
firebase deploy --only firestore:rules
```

### Проблема: "AsyncStorage not working"

**Решение:**
- На веб-версии используется localStorage
- На мобильных используется AsyncStorage
- Убедиться, что используется правильный сервис

---

## 📊 Мониторинг

### Firebase Console

Мониторить приложение можно в Firebase Console:
https://console.firebase.google.com

**Разделы:**
- **Firestore Database** - просмотр данных
- **Cloud Storage** - управление файлами
- **Authentication** - управление пользователями
- **Cloud Functions** - логи функций
- **Analytics** - статистика приложения

### Логи

```bash
# Просмотр логов Cloud Functions
firebase functions:log

# Просмотр логов в реальном времени
firebase functions:log --follow
```

---

## ✅ Контрольный список развертывания

- [ ] Node.js установлен (версия 18+)
- [ ] Firebase CLI установлен
- [ ] Firebase проект создан
- [ ] `.env.local` файл заполнен
- [ ] Firestore Rules развернуты
- [ ] Cloud Storage Rules развернуты
- [ ] Cloud Functions развернуты
- [ ] Все 167 тестов проходят
- [ ] Dev server работает без ошибок
- [ ] Приложение протестировано на iOS и Android
- [ ] APK/IPA собраны и готовы к публикации

---

## 📞 Поддержка

Для вопросов и проблем:
1. Проверить логи: `firebase functions:log`
2. Проверить консоль браузера (F12)
3. Проверить Firebase Console
4. Прочитать документацию: https://firebase.google.com/docs

---

**Статус:** 🟢 Готово к развертыванию  
**Последнее обновление:** 7 мая 2026, 18:08 UTC+3
