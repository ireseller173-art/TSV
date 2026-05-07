# Руководство по синхронизации контактов (Contact Sync Guide)

## Русский язык

### Что это?

Функция синхронизации контактов позволяет приложению TSV Keeper автоматически импортировать контакты из телефонной книги вашего устройства. Это упрощает поиск друзей и коллег в приложении.

### Как это работает?

1. **Автоматическая синхронизация** — контакты синхронизируются автоматически при первом запуске приложения и каждые 24 часа
2. **Ручная синхронизация** — вы можете нажать кнопку "Синхронизировать" для немедленного обновления
3. **Локальное хранилище** — контакты хранятся локально на вашем устройстве для быстрого доступа
4. **Дедупликация** — приложение автоматически удаляет дубликаты контактов

### Разрешения

Приложение запросит разрешение на доступ к контактам при первой синхронизации. Вы должны разрешить доступ, чтобы функция работала.

**Как разрешить доступ:**
- iOS: Перейдите в Настройки → TSV Keeper → Контакты → Разрешить
- Android: Перейдите в Настройки → Приложения → TSV Keeper → Разрешения → Контакты → Разрешить

### Функции

- ✅ Импорт контактов с номерами телефонов
- ✅ Импорт контактов с email адресами
- ✅ Поиск и фильтрация контактов
- ✅ Автоматическое обновление каждые 24 часа
- ✅ Ручная синхронизация по требованию
- ✅ Просмотр истории синхронизации
- ✅ Экспорт контактов в CSV
- ✅ Удаление дубликатов

### Как использовать

1. Откройте приложение TSV Keeper
2. Перейдите в раздел "Контакты"
3. Нажмите на кнопку "Синхронизировать контакты"
4. Разрешите доступ к контактам (если потребуется)
5. Ждите завершения синхронизации
6. Ваши контакты будут доступны в приложении

### Часто задаваемые вопросы

**Q: Где хранятся мои контакты?**
A: Контакты хранятся локально на вашем устройстве в приложении. Они не отправляются на серверы без вашего согласия.

**Q: Как часто синхронизируются контакты?**
A: Автоматическая синхронизация происходит каждые 24 часа. Вы также можете синхронизировать вручную в любой момент.

**Q: Что если я удалю контакт из телефонной книги?**
A: При следующей синхронизации удаленный контакт останется в приложении. Вы можете удалить его вручную.

**Q: Могу ли я экспортировать контакты?**
A: Да, в экране синхронизации контактов есть кнопка для экспорта контактов в формате CSV.

---

## English

### What is this?

The contact sync feature allows TSV Keeper to automatically import contacts from your device's contact list. This makes it easier to find friends and colleagues in the app.

### How does it work?

1. **Automatic sync** — contacts sync automatically on first app launch and every 24 hours
2. **Manual sync** — you can press the "Sync" button for immediate update
3. **Local storage** — contacts are stored locally on your device for fast access
4. **Deduplication** — the app automatically removes duplicate contacts

### Permissions

The app will request permission to access contacts on first sync. You must allow access for the feature to work.

**How to allow access:**
- iOS: Go to Settings → TSV Keeper → Contacts → Allow
- Android: Go to Settings → Apps → TSV Keeper → Permissions → Contacts → Allow

### Features

- ✅ Import contacts with phone numbers
- ✅ Import contacts with email addresses
- ✅ Search and filter contacts
- ✅ Automatic update every 24 hours
- ✅ Manual sync on demand
- ✅ View sync history
- ✅ Export contacts to CSV
- ✅ Remove duplicates

### How to use

1. Open TSV Keeper app
2. Go to "Contacts" section
3. Press "Sync Contacts" button
4. Allow access to contacts (if prompted)
5. Wait for sync to complete
6. Your contacts will be available in the app

### FAQ

**Q: Where are my contacts stored?**
A: Contacts are stored locally on your device in the app. They are not sent to servers without your consent.

**Q: How often are contacts synced?**
A: Automatic sync happens every 24 hours. You can also sync manually at any time.

**Q: What if I delete a contact from my phone?**
A: On next sync, the deleted contact will remain in the app. You can delete it manually.

**Q: Can I export contacts?**
A: Yes, there's an export button in the contact sync screen to export contacts as CSV.

---

## Техническая информация (Technical Information)

### API Reference

```typescript
// Get device contacts
const contacts = await getDeviceContacts();

// Sync device contacts
const result = await syncDeviceContacts();

// Search contacts
const results = await searchContacts('John');

// Get local contacts
const localContacts = await getLocalContacts();

// Export as CSV
const csv = await exportContactsAsCSV();
```

### Data Structure

```typescript
interface DeviceContact {
  id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
  avatar?: string;
}

interface SyncResult {
  imported: number;
  updated: number;
  failed: number;
  timestamp: number;
}
```

### Storage

- **Local Storage Key**: `device_contacts`
- **Sync History Key**: `contact_sync_history`
- **Last Sync Key**: `last_contact_sync`

### Permissions

- iOS: `NSContactsUsageDescription` in Info.plist
- Android: `android.permission.READ_CONTACTS` in AndroidManifest.xml

### Performance

- Sync time: ~1-5 seconds (depending on contact count)
- Storage: ~50KB per 100 contacts
- Memory: ~5MB for 1000 contacts

---

## Решение проблем (Troubleshooting)

### Контакты не импортируются

**Проблема**: Контакты не появляются после синхронизации.

**Решение**:
1. Проверьте, что вы разрешили доступ к контактам
2. Убедитесь, что в телефонной книге есть контакты
3. Попробуйте ручную синхронизацию
4. Перезагрузите приложение

### Синхронизация зависает

**Проблема**: Синхронизация не завершается.

**Решение**:
1. Закройте приложение
2. Откройте его снова
3. Попробуйте синхронизировать снова
4. Если проблема сохраняется, очистите кэш приложения

### Дубликаты контактов

**Проблема**: Один контакт появляется несколько раз.

**Решение**:
1. Объедините дубликаты в телефонной книге
2. Выполните новую синхронизацию
3. Дубликаты должны быть удалены автоматически

### Контакты не обновляются

**Проблема**: Изменения в телефонной книге не отражаются в приложении.

**Решение**:
1. Выполните ручную синхронизацию
2. Подождите 24 часа для автоматической синхронизации
3. Перезагрузите приложение

---

**Версия**: 1.0  
**Последнее обновление**: Май 2026  
**Язык**: Русский/English
