# Руководство по переводам TSV Keeper

## 📋 Новые экраны, которые нужно перевести

### 1. call-history.tsx
```typescript
// Заголовки
"История звонков" // Call History
"Входящие" // Incoming
"Исходящие" // Outgoing
"Пропущенные" // Missed
"Все" // All

// Кнопки
"Очистить историю" // Clear History
"Удалить" // Delete
"Вызвать" // Call

// Сообщения
"История звонков пуста" // No call history
"Вы уверены?" // Are you sure?
"Это действие нельзя отменить" // This action cannot be undone
```

### 2. voice-message-recorder.tsx
```typescript
// Заголовки
"Запись голосового сообщения" // Voice Message

// Кнопки
"Начать запись" // Start Recording
"Остановить" // Stop
"Отправить" // Send
"Отмена" // Cancel

// Сообщения
"Ошибка при записи" // Recording error
"Микрофон недоступен" // Microphone not available
"Разрешите доступ к микрофону" // Allow microphone access
```

### 3. send-invitation.tsx
```typescript
// Заголовки
"Пригласить друзей" // Invite Friends
"Отправить приглашение" // Send Invitation

// Поля ввода
"Email адрес" // Email Address
"Номер телефона" // Phone Number
"Сообщение" // Message

// Кнопки
"Отправить по Email" // Send via Email
"Отправить по SMS" // Send via SMS
"Скопировать ссылку" // Copy Link

// Сообщения
"Приглашение отправлено" // Invitation sent
"Ошибка при отправке" // Error sending invitation
"Ссылка скопирована" // Link copied
"Действительна 12 часов" // Valid for 12 hours
```

### 4. accept-invitation.tsx
```typescript
// Заголовки
"Принять приглашение" // Accept Invitation

// Кнопки
"Принять" // Accept
"Отклонить" // Decline

// Сообщения
"Вас пригласили присоединиться" // You've been invited to join
"Ссылка истекла" // Link expired
"Ошибка при принятии приглашения" // Error accepting invitation
"Добро пожаловать!" // Welcome!
```

### 5. call-screen.tsx
```typescript
// Заголовки
"Звонок" // Call

// Статусы
"Подключение..." // Connecting...
"Звонит..." // Ringing...

// Кнопки
"Отключить звук" // Mute
"Громкая связь" // Speaker
"Завершить звонок" // End Call

// Сообщения
"Ошибка при инициализации звонка" // Error initializing call
"Звонок завершен" // Call ended
```

### 6. message-reactions.tsx
```typescript
// Кнопки
"Добавить реакцию" // Add Reaction

// Сообщения
"Реакция добавлена" // Reaction added
"Реакция удалена" // Reaction removed
```

### 7. pinned-messages.tsx
```typescript
// Заголовки
"Закрепленные сообщения" // Pinned Messages

// Кнопки
"Открепить" // Unpin
"Удалить" // Delete

// Сообщения
"Нет закрепленных сообщений" // No pinned messages
"Сообщение закреплено" // Message pinned
"Сообщение откреплено" // Message unpinned
```

### 8. group-detail.tsx
```typescript
// Заголовки
"Информация о группе" // Group Info
"Участники" // Members
"Управление группой" // Manage Group

// Кнопки
"Добавить участника" // Add Member
"Удалить участника" // Remove Member
"Сделать администратором" // Make Admin
"Удалить группу" // Delete Group
"Выйти из группы" // Leave Group

// Сообщения
"Группа удалена" // Group deleted
"Вы вышли из группы" // You left the group
"Участник добавлен" // Member added
"Участник удален" // Member removed
```

## 🔧 Как добавить переводы

### Вариант 1: Прямые строки (простой способ)
```typescript
<Text className="text-lg font-bold text-foreground">
  Пригласить друзей
</Text>
```

### Вариант 2: Использование i18n (рекомендуется)
```typescript
import { useTranslation } from 'react-i18next';

export default function MyScreen() {
  const { t } = useTranslation();
  
  return (
    <Text className="text-lg font-bold text-foreground">
      {t('invite_friends')}
    </Text>
  );
}
```

### Вариант 3: Константы переводов
```typescript
const TRANSLATIONS = {
  ru: {
    invite_friends: "Пригласить друзей",
    send_invitation: "Отправить приглашение",
  },
  en: {
    invite_friends: "Invite Friends",
    send_invitation: "Send Invitation",
  },
};
```

## ✅ Чек-лист переводов

- [ ] call-history.tsx
- [ ] voice-message-recorder.tsx
- [ ] send-invitation.tsx
- [ ] accept-invitation.tsx
- [ ] call-screen.tsx
- [ ] message-reactions.tsx
- [ ] pinned-messages.tsx
- [ ] group-detail.tsx
- [ ] Все сообщения об ошибках
- [ ] Все подсказки и уведомления

## 📚 Дополнительные ресурсы

- [React i18n Documentation](https://react.i18next.com/)
- [React Native Localization](https://github.com/stefalda/ReactNativeLocalization)

---

**Статус:** ✅ Переводы готовы к внедрению
