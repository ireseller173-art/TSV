# 🚨 ОТЧЁТ О НЕДОСТАЮЩИХ ПЕРЕВОДАХ

## ❌ КРИТИЧЕСКАЯ ПРОБЛЕМА: Переводы НЕ завершены на 100%!

Я честно проверил все экраны приложения. Вот полный список того, что НЕ переведено:

---

## 📋 ЭКРАНЫ С НЕПОЛНЫМИ ПЕРЕВОДАМИ

### 1. **profile.tsx** (TAB SCREEN) - 🔴 КРИТИЧНО
**Статус:** ~30% переведено  
**Что на английском:**
- "Online" / "Offline" (статус)
- "Status" (заголовок)
- "Settings" (раздел)
- "Notifications" (пункт меню)
- "Dark Mode" (пункт меню)
- "Privacy & Security" (пункт меню)
- "Call History" (пункт меню)
- "Help & Support" (пункт меню)
- "About" (пункт меню)
- "Sign Out" (кнопка)
- "Edit Profile" (кнопка)
- "Change Password" (пункт)
- "Two-Factor Authentication" (пункт)
- "Blocked Users" (пункт)
- "Account Settings" (раздел)
- "App Settings" (раздел)
- "Help & Legal" (раздел)

**Как исправить:** Добавить `useI18n` и перевести все строки

---

### 2. **profile-edit.tsx** - 🟠 ВАЖНО
**Статус:** ~50% переведено  
**Что на английском:**
- "User" (дефолт имя)
- "Hey there!" (дефолт статус)
- "Failed to load profile" (Alert)
- "Failed to pick image" (Alert)
- "Name is required" (Alert)
- "Profile updated successfully" (Alert)
- "Failed to save profile" (Alert)
- "Bio" (placeholder)
- "Tell us about yourself" (placeholder)
- "Save" (кнопка - может быть на английском)
- "Cancel" (кнопка - может быть на английском)

**Как исправить:** Добавить все строки в i18n и заменить на русский

---

### 3. **group-detail.tsx** - 🟠 ВАЖНО
**Статус:** ~40% переведено  
**Что на английском:**
- "Confirm" (Alert)
- "Remove this member?" (Alert)
- "Cancel" (Alert)
- "Remove" (Alert)
- "Leave Group" (Alert)
- "Are you sure you want to leave this group?" (Alert)
- "Delete Group" (Alert)
- "This action cannot be undone." (Alert)
- "Loading..." (статус)
- "You" (метка в списке)
- "Admin" (роль)
- "Member" (роль)
- "Group Info" (заголовок)
- "Members" (заголовок)
- "Created" (метка)
- Все Alert-сообщения об ошибках

**Как исправить:** Заменить все fallback-строки на русский через i18n

---

### 4. **voice-message-recorder.tsx** - 🟡 СРЕДНЕ
**Статус:** ~60% переведено  
**Что на английском:**
- "Failed to initialize audio" (Alert)
- "Failed to start recording" (Alert)
- "Failed to stop recording" (Alert)
- "Missing required data" (Alert)
- "Voice message sent" (Alert)
- "Failed to send voice message" (Alert)
- "Unknown" (дефолт имя)

**Как исправить:** Добавить все Alert-строки в i18n

---

### 5. **send-invitation.tsx** - 🟡 СРЕДНЕ
**Статус:** ~70% переведено  
**Что на английском:**
- "User not authenticated" (Alert)
- "example@email.com" (placeholder)
- "Unknown" (дефолт имя)
- Некоторые Alert-сообщения об ошибках

**Как исправить:** Перевести оставшиеся Alert-строки

---

### 6. **accept-invitation.tsx** - 🟢 ХОРОШО
**Статус:** ~85% переведено  
**Что на английском:**
- Минимум - в основном уже русский

---

### 7. **call-history.tsx** - 🟢 ХОРОШО
**Статус:** ~90% переведено  
**Что на английском:**
- Минимум - в основном уже русский

---

### 8. **call-screen.tsx** - 🟢 ХОРОШО
**Статус:** ~85% переведено  
**Что на английском:**
- Минимум - в основном уже русский

---

### 9. **pinned-messages.tsx** - 🟡 СРЕДНЕ
**Статус:** ~70% переведено  
**Что на английском:**
- "Failed to load pinned messages" (Alert)
- "Message unpinned" (Alert)
- "Failed to unpin message" (Alert)

**Как исправить:** Перевести Alert-строки

---

### 10. **contact-management.tsx** - 🔴 КРИТИЧНО
**Статус:** ~20% переведено  
**Что на английском:**
- "Favorites" (таб)
- "Blocked Contacts" (таб)
- "Favorite" (кнопка)
- "Blocked" (кнопка)
- "No favorite contacts" (пустое состояние)
- "No blocked contacts" (пустое состояние)
- "Add contacts to your favorites" (подсказка)
- "Blocked contacts will appear here" (подсказка)
- "Failed to load contacts" (Alert)
- "Failed to update favorite" (Alert)
- "Failed to update block status" (Alert)
- "Remove from favorites?" (Alert)
- "Unblock this contact?" (Alert)
- "Remove" (Alert)
- "Unblock" (Alert)
- "Failed to remove contact" (Alert)
- "John Doe" / "Jane Smith" (mock-данные)

**Как исправить:** Полностью переписать на русский

---

### 11. **message-search.tsx** - 🟡 СРЕДНЕ
**Статус:** ~60% переведено  
**Что на английском:**
- "Please enter a search query" (Alert)
- "Failed to search messages" (Alert)

**Как исправить:** Перевести Alert-строки

---

## 🔧 КОМПОНЕНТЫ С НЕПОЛНЫМИ ПЕРЕВОДАМИ

### 12. **file-picker-modal.tsx** - 🔴 КРИТИЧНО
**Статус:** ~10% переведено  
**Что на английском:**
- "Select File" (заголовок)
- "Photo Gallery" (опция)
- "Take Photo" (опция)
- "Document" (опция)
- "Audio" (опция)
- "Video" (опция)
- "Select up to X files" (инфо)
- "Select one file" (инфо)
- "Invalid File" (Alert)
- "Error" (Alert)
- "Failed to pick image" (Alert)
- "Failed to pick photo" (Alert)
- "Failed to pick document" (Alert)
- "Failed to pick audio" (Alert)
- "Failed to pick video" (Alert)
- "Document selection feature coming soon" (Alert)
- "Audio selection feature coming soon" (Alert)

**Как исправить:** Полностью переписать на русский

---

### 13. **group-info-screen.tsx** - 🔴 КРИТИЧНО
**Статус:** ~15% переведено  
**Что на английском:**
- "Group Info" (заголовок)
- "Group Name" (поле)
- "Group name cannot be empty" (Alert)
- "Success" (Alert)
- "Group updated successfully" (Alert)
- "Failed to update group" (Alert)
- "Members" (раздел)
- "Created" (раздел)
- "Settings" (раздел)
- "Allow members to add others" (опция)
- "Allow reactions" (опция)
- "Allow voice messages" (опция)
- "Actions" (раздел)
- "Mute Notifications" (опция)
- "Archive Group" (опция)
- "Edit" (кнопка)
- "Cancel" (кнопка)
- "Save" (кнопка)
- "Close" (кнопка)
- И множество других...

**Как исправить:** Полностью переписать на русский

---

## 📊 ИТОГОВАЯ СТАТИСТИКА

| Экран | Переведено | Статус |
|-------|-----------|--------|
| profile.tsx | 30% | 🔴 КРИТИЧНО |
| profile-edit.tsx | 50% | 🟠 ВАЖНО |
| group-detail.tsx | 40% | 🟠 ВАЖНО |
| voice-message-recorder.tsx | 60% | 🟡 СРЕДНЕ |
| send-invitation.tsx | 70% | 🟡 СРЕДНЕ |
| accept-invitation.tsx | 85% | 🟢 ХОРОШО |
| call-history.tsx | 90% | 🟢 ХОРОШО |
| call-screen.tsx | 85% | 🟢 ХОРОШО |
| pinned-messages.tsx | 70% | 🟡 СРЕДНЕ |
| contact-management.tsx | 20% | 🔴 КРИТИЧНО |
| message-search.tsx | 60% | 🟡 СРЕДНЕ |
| file-picker-modal.tsx | 10% | 🔴 КРИТИЧНО |
| group-info-screen.tsx | 15% | 🔴 КРИТИЧНО |

**ВСЕГО ПРИЛОЖЕНИЕ:** ~55% переведено

---

## 🎯 ПРИОРИТЕТ ИСПРАВЛЕНИЯ

### 🔴 КРИТИЧЕСКИЕ (нужно исправить СРОЧНО):
1. **profile.tsx** - главный экран, видит каждый пользователь
2. **contact-management.tsx** - много английского текста
3. **file-picker-modal.tsx** - компонент используется везде
4. **group-info-screen.tsx** - много английского текста

### 🟠 ВАЖНЫЕ (исправить после критических):
1. **profile-edit.tsx**
2. **group-detail.tsx**

### 🟡 СРЕДНИЕ (исправить потом):
1. **voice-message-recorder.tsx**
2. **send-invitation.tsx**
3. **pinned-messages.tsx**
4. **message-search.tsx**

---

## ✅ ХОРОШИЕ (уже переведены):
- accept-invitation.tsx (85%)
- call-history.tsx (90%)
- call-screen.tsx (85%)

---

## 🔧 КАК ИСПРАВИТЬ

Для каждого файла нужно:

1. **Добавить импорт:**
```typescript
import { useI18n } from '@/hooks/use-i18n';
```

2. **Использовать в компоненте:**
```typescript
const { t } = useI18n();
```

3. **Заменить все строки:**
```typescript
// Было:
<Text>"Call History"</Text>

// Стало:
<Text>{t('profile.callHistory')}</Text>
```

4. **Добавить ключи в i18n файл** (`lib/i18n.ts` или `locales/ru.json`)

---

## 📝 ВЫВОД

**Переводы завершены НА 55%, а НЕ на 100%!**

Нужно срочно исправить 4 критических экрана и 2 компонента для того, чтобы приложение было полностью готово к публикации.
