# Развертывание Cloud Functions для TSV Keeper

## 📋 Требования

- Node.js 18+ установлен
- Firebase CLI установлен (`npm install -g firebase-tools`)
- Firebase проект создан на console.firebase.google.com
- Аутентификация в Firebase (`firebase login`)

## 🚀 Шаги развертывания

### 1. Инициализация Firebase (если не сделано)

```bash
cd /home/ubuntu/cool-messenger
firebase init functions
```

Выберите:
- **JavaScript** или **TypeScript** (рекомендуется TypeScript)
- **ESLint** (по желанию)

### 2. Установка зависимостей для Functions

```bash
cd functions
npm install
```

### 3. Развертывание Cloud Functions

```bash
cd /home/ubuntu/cool-messenger
firebase deploy --only functions
```

Это развернет следующие функции:
- `sendMessageNotification` - отправка уведомлений при новом сообщении
- `sendGroupMessageNotification` - отправка уведомлений в группах
- `updateUserPresence` - обновление статуса онлайн
- `registerDeviceToken` - регистрация токена устройства
- `unregisterDeviceToken` - удаление токена устройства
- `cleanupOldMessages` - очистка старых сообщений

### 4. Развертывание Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 5. Развертывание Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

### 6. Развертывание Storage Rules

```bash
firebase deploy --only storage
```

### 7. Развертывание всего сразу

```bash
firebase deploy
```

## ✅ Проверка развертывания

### Просмотр логов функций

```bash
firebase functions:log
```

### Просмотр списка развернутых функций

```bash
firebase functions:list
```

### Тестирование функции

```bash
firebase functions:shell
> sendMessageNotification({userId: "test-user", message: "Hello"})
```

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env.local` в папке `functions/`:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
NOTIFICATION_TITLE=TSV Keeper
NOTIFICATION_SOUND=default
```

Используйте переменные в функциях:

```typescript
const projectId = process.env.FIREBASE_PROJECT_ID;
```

## 🐛 Решение проблем

### Ошибка: "Cannot find module 'firebase-functions'"

```bash
cd functions
npm install firebase-functions firebase-admin
```

### Ошибка: "Deployment failed"

```bash
# Проверьте аутентификацию
firebase login

# Проверьте проект
firebase use --list

# Выберите проект
firebase use your-project-id
```

### Ошибка: "Permission denied"

Проверьте Firestore Rules в `firestore.rules` - убедитесь, что правила позволяют Cloud Functions писать данные.

## 📊 Мониторинг

### Просмотр использования

```bash
firebase functions:describe sendMessageNotification
```

### Просмотр метрик

Перейдите в Firebase Console → Functions → Metrics

## 🔐 Безопасность

- Никогда не коммитьте `.env.local` в Git
- Используйте Firebase Secrets для чувствительных данных
- Регулярно обновляйте зависимости

## 📚 Дополнительные ресурсы

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Cloud Functions Best Practices](https://cloud.google.com/functions/docs/bestpractices/retries)

---

**Статус:** ✅ Cloud Functions готовы к развертыванию
