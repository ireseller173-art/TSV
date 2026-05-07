# 🚀 Полное руководство по развертыванию TSV Keeper на Firebase

**Это руководство написано максимально просто для начинающих!**

---

## 📋 Содержание

1. [Что вам понадобится](#что-вам-понадобится)
2. [Установка необходимых программ](#установка-необходимых-программ)
3. [Создание проекта в Firebase](#создание-проекта-в-firebase)
4. [Настройка приложения](#настройка-приложения)
5. [Развертывание на Firebase Hosting](#развертывание-на-firebase-hosting)
6. [Проверка работы](#проверка-работы)
7. [Решение проблем](#решение-проблем)

---

## 🎯 Что вам понадобится

| Элемент | Описание |
|---------|---------|
| **Компьютер** | Windows, Mac или Linux |
| **Интернет** | Для скачивания программ и развертывания |
| **Аккаунт Google** | Для создания Firebase проекта (бесплатно) |
| **Время** | 30-45 минут на полную настройку |

### Программы для установки

| Программа | Назначение | Ссылка |
|-----------|-----------|--------|
| **Node.js (LTS)** | Запуск приложения | https://nodejs.org |
| **Git** | Управление кодом | https://git-scm.com |
| **Visual Studio Code** | Редактор кода | https://code.visualstudio.com |
| **Chrome браузер** | Тестирование | https://google.com/chrome |

---

## 🔧 Установка необходимых программ

### Шаг 1: Установка Node.js

**Что это?** Node.js позволяет запускать JavaScript на вашем компьютере.

**Как установить:**

1. Откройте https://nodejs.org в браузере
2. Нажмите на зеленую кнопку **"LTS"** (Long Term Support - стабильная версия)
3. Скачайте файл для вашей системы:
   - **Windows** → выберите `.msi` файл
   - **Mac** → выберите `.pkg` файл
   - **Linux** → следуйте инструкциям
4. Откройте скачанный файл и установите (нажимайте "Далее" везде)
5. **Перезагрузите компьютер**

**Проверка:**

Откройте командную строку (Command Prompt / Terminal) и напишите:

```bash
node --version
npm --version
```

Должны появиться номера версий (например, `v20.10.0`). Если да - все хорошо! ✅

---

### Шаг 2: Установка Git

**Что это?** Git нужен для скачивания и управления кодом.

**Как установить:**

1. Откройте https://git-scm.com
2. Нажмите **"Download"**
3. Выберите вашу операционную систему
4. Установите (нажимайте "Далее" везде)
5. **Перезагрузите компьютер**

**Проверка:**

```bash
git --version
```

---

### Шаг 3: Установка Visual Studio Code (опционально)

**Что это?** Удобный редактор для работы с кодом.

**Как установить:**

1. Откройте https://code.visualstudio.com
2. Нажмите **"Download"** и выберите вашу систему
3. Установите программу

---

## 🔥 Создание проекта в Firebase

### Шаг 1: Создание Firebase проекта

1. Откройте https://console.firebase.google.com в браузере
2. Нажмите **"Добавить проект"** (Add project)
3. Введите название проекта: **`tsv-keeper`**
4. Нажмите **"Продолжить"** (Continue)
5. На вопрос про Google Analytics выберите **"Отключить"** (Disable)
6. Нажмите **"Создать проект"** (Create project)

Подождите 1-2 минуты, пока проект создается...

### Шаг 2: Получение учетных данных

1. В левом меню нажмите **"Параметры проекта"** (Project Settings) - иконка шестеренки
2. Перейдите на вкладку **"Ваши приложения"** (Your apps)
3. Нажмите **"Добавить приложение"** (Add app) → выберите **"Web"** (веб-приложение)
4. Введите название: **`TSV Keeper Web`**
5. Нажмите **"Зарегистрировать приложение"** (Register app)

Вы увидите код конфигурации Firebase. **Скопируйте его!** Он выглядит так:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tsv-keeper-xxx.firebaseapp.com",
  projectId: "tsv-keeper-xxx",
  storageBucket: "tsv-keeper-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

---

## ⚙️ Настройка приложения

### Шаг 1: Создание файла конфигурации

1. Откройте папку проекта TSV Keeper в Visual Studio Code
2. В корне проекта создайте файл `.env.local`
3. Вставьте туда конфигурацию Firebase:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tsv-keeper-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tsv-keeper-xxx
VITE_FIREBASE_STORAGE_BUCKET=tsv-keeper-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

**Важно:** Замените значения на свои из Firebase консоли!

### Шаг 2: Установка зависимостей

Откройте командную строку в папке проекта и напишите:

```bash
npm install
```

или если используете pnpm:

```bash
pnpm install
```

Подождите, пока установятся все пакеты (может занять 2-5 минут).

---

## 🔐 Настройка Firestore (База данных)

### Шаг 1: Создание Firestore

1. В Firebase консоли нажмите **"Firestore Database"** в левом меню
2. Нажмите **"Создать базу данных"** (Create database)
3. Выберите регион (например, **`europe-west1`** для Европы)
4. Нажмите **"Далее"** (Next)

### Шаг 2: Установка правил безопасности

1. Перейдите на вкладку **"Правила"** (Rules)
2. Замените содержимое на:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать и писать свои данные
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Чаты - пользователи могут читать чаты, в которых они участники
    match /chats/{chatId} {
      allow read: if request.auth.uid in resource.data.members;
      allow write: if request.auth.uid in resource.data.members;
      
      // Сообщения в чатах
      match /messages/{messageId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.members;
        allow create: if request.auth.uid == request.resource.data.senderId;
        allow update, delete: if request.auth.uid == resource.data.senderId;
      }
    }
    
    // Групповые чаты
    match /groups/{groupId} {
      allow read: if request.auth.uid in resource.data.memberIds;
      allow write: if request.auth.uid == resource.data.createdBy;
      
      // Сообщения в группах
      match /messages/{messageId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.memberIds;
        allow create: if request.auth.uid == request.resource.data.senderId;
        allow update, delete: if request.auth.uid == resource.data.senderId;
      }
    }
    
    // Контакты
    match /contacts/{contactId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Нажмите **"Опубликовать"** (Publish)

---

## 🔑 Настройка Authentication (Вход в приложение)

### Шаг 1: Включение Email/Password

1. В Firebase консоли нажмите **"Authentication"** в левом меню
2. Перейдите на вкладку **"Способы входа"** (Sign-in method)
3. Нажмите **"Email/Password"**
4. Включите **"Email/Password"** (переключатель должен быть синим)
5. Нажмите **"Сохранить"** (Save)

### Шаг 2: Включение Google Sign-In (опционально)

1. Нажмите **"Google"** в списке способов входа
2. Включите переключатель
3. Выберите email для проекта
4. Нажмите **"Сохранить"** (Save)

---

## 📁 Настройка Storage (Хранилище файлов)

### Шаг 1: Создание Storage

1. В Firebase консоли нажмите **"Storage"** в левом меню
2. Нажмите **"Начать"** (Get started)
3. Выберите регион (например, **`europe-west1`**)
4. Нажмите **"Далее"** (Next)

### Шаг 2: Правила безопасности для Storage

1. Перейдите на вкладку **"Правила"** (Rules)
2. Замените содержимое на:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Пользователи могут загружать свои аватары
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    
    // Пользователи могут загружать медиа в чаты
    match /chats/{chatId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Пользователи могут загружать медиа в группы
    match /groups/{groupId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. Нажмите **"Опубликовать"** (Publish)

---

## 🚀 Развертывание на Firebase Hosting

### Шаг 1: Установка Firebase CLI

Откройте командную строку и напишите:

```bash
npm install -g firebase-tools
```

или для pnpm:

```bash
pnpm add -g firebase-tools
```

**Проверка:**

```bash
firebase --version
```

### Шаг 2: Вход в Firebase

```bash
firebase login
```

Откроется браузер. Выберите аккаунт Google, который использовали для Firebase проекта, и нажмите **"Разрешить"** (Allow).

### Шаг 3: Инициализация проекта

В папке проекта напишите:

```bash
firebase init
```

Ответьте на вопросы:

- **Which Firebase features do you want to set up?** → выберите **Hosting** (нажмите Space, потом Enter)
- **What do you want to use as your public directory?** → напишите: **`dist`**
- **Configure as a single-page app?** → ответьте **y** (да)
- **Set up automatic builds and deploys with GitHub?** → ответьте **n** (нет)

### Шаг 4: Сборка приложения

```bash
npm run build
```

или для pnpm:

```bash
pnpm build
```

Это создаст папку `dist` с готовым приложением.

### Шаг 5: Развертывание

```bash
firebase deploy
```

Подождите, пока приложение развернется. Вы увидите URL вашего приложения:

```
Hosting URL: https://tsv-keeper-xxx.firebaseapp.com
```

**Готово! Ваше приложение в интернете!** 🎉

---

## ✅ Проверка работы

1. Откройте URL вашего приложения в браузере
2. Попробуйте зарегистрироваться с email и паролем
3. Создайте новый чат
4. Отправьте сообщение
5. Создайте групповой чат с несколькими участниками

Если все работает - поздравляем! Приложение успешно развернуто! 🚀

---

## 🐛 Решение проблем

### Проблема: "Firebase CLI не найден"

**Решение:**
```bash
npm install -g firebase-tools
firebase --version
```

### Проблема: "Ошибка при входе в Firebase"

**Решение:**
1. Откройте https://console.firebase.google.com
2. Убедитесь, что вы вошли в аккаунт Google
3. Попробуйте снова: `firebase login`

### Проблема: "Ошибка при развертывании"

**Решение:**
1. Проверьте, что папка `dist` существует
2. Проверьте файл `.env.local` - все ли значения Firebase правильные
3. Попробуйте еще раз: `firebase deploy`

### Проблема: "Приложение не загружается"

**Решение:**
1. Откройте консоль браузера (F12)
2. Посмотрите ошибки в консоли
3. Проверьте, что все значения в `.env.local` правильные
4. Убедитесь, что Firestore и Authentication включены

### Проблема: "Не могу отправить сообщение"

**Решение:**
1. Проверьте правила безопасности Firestore
2. Убедитесь, что пользователь вошел в приложение
3. Посмотрите ошибки в консоли браузера

---

## 📞 Дополнительная помощь

Если у вас возникли проблемы:

1. **Проверьте консоль браузера** (F12 → Console) - там обычно видны ошибки
2. **Посмотрите логи Firebase** в консоли: https://console.firebase.google.com → Logs
3. **Убедитесь, что интернет работает** и вы не в VPN
4. **Перезагрузите приложение** (Ctrl+R или Cmd+R)

---

## 🎓 Что дальше?

После успешного развертывания вы можете:

1. **Добавить больше пользователей** - они смогут зарегистрироваться сами
2. **Включить Google Sign-In** - для удобства входа
3. **Настроить Push-уведомления** - чтобы пользователи получали оповещения
4. **Добавить голосовые сообщения** - для более богатого общения
5. **Включить видеозвонки** - для групповых конференций

---

## 📝 Заметки

- **Бесплатный план Firebase** включает 1 ГБ хранилища и достаточно операций для ~100 пользователей
- **Все данные зашифрованы** при передаче по интернету (HTTPS)
- **Резервные копии** создаются автоматически
- **Масштабирование** происходит автоматически при росте пользователей

---

**Спасибо за использование TSV Keeper! 🎉**

Если у вас есть вопросы или предложения, не стесняйтесь обращаться!
