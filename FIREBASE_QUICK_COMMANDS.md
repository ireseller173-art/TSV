# ⚡ Шпаргалка: Быстрое развертывание TSV Keeper на Firebase

Все команды для развертывания приложения в одном месте!

---

## 🚀 Основные команды

### 1️⃣ Установка Firebase CLI (один раз)

```bash
npm install -g firebase-tools
```

### 2️⃣ Вход в Firebase (один раз)

```bash
firebase login
```

### 3️⃣ Инициализация проекта (один раз)

В папке проекта:

```bash
firebase init
```

**Ответы на вопросы:**
- Hosting: **Y** (да)
- Public directory: **dist**
- Single-page app: **y** (да)
- GitHub: **n** (нет)

### 4️⃣ Сборка приложения

```bash
npm run build
```

или для pnpm:

```bash
pnpm build
```

### 5️⃣ Развертывание на Firebase

```bash
firebase deploy
```

**Готово!** Ваше приложение будет доступно по URL:
```
https://ваш-проект.firebaseapp.com
```

---

## 📋 Полный процесс (первый раз)

Скопируйте и выполните эти команды по порядку:

```bash
# 1. Установка Firebase CLI
npm install -g firebase-tools

# 2. Вход в Firebase
firebase login

# 3. Переход в папку проекта
cd /path/to/cool-messenger

# 4. Инициализация (следуйте подсказкам выше)
firebase init

# 5. Установка зависимостей (если еще не установлены)
npm install

# 6. Сборка приложения
npm run build

# 7. Развертывание
firebase deploy
```

---

## 🔄 Обновление приложения (после изменений)

Если вы изменили код и хотите обновить приложение:

```bash
# 1. Сборка
npm run build

# 2. Развертывание
firebase deploy
```

Или одной командой:

```bash
npm run build && firebase deploy
```

---

## 📁 Структура файлов после инициализации

```
cool-messenger/
├── dist/                    ← Сюда собирается приложение
├── firebase.json            ← Конфиг Firebase (создается автоматически)
├── .firebaserc              ← ID проекта (создается автоматически)
├── .env.local               ← Ваши ключи Firebase (создайте вручную)
└── ...остальные файлы
```

---

## 🔑 Файл .env.local (важно!)

Создайте файл `.env.local` в корне проекта с вашими ключами Firebase:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tsv-keeper-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tsv-keeper-xxx
VITE_FIREBASE_STORAGE_BUCKET=tsv-keeper-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

**Где взять эти значения?**
1. Откройте https://console.firebase.google.com
2. Выберите ваш проект
3. Нажмите ⚙️ (Параметры проекта)
4. Перейдите на вкладку "Ваши приложения"
5. Выберите веб-приложение
6. Скопируйте конфиг

---

## ✅ Проверка статуса развертывания

```bash
# Посмотреть логи развертывания
firebase deploy --debug

# Посмотреть текущий проект
firebase projects:list

# Посмотреть информацию о проекте
firebase projects:describe
```

---

## 🐛 Решение проблем

### Ошибка: "firebase: command not found"

```bash
npm install -g firebase-tools
firebase --version
```

### Ошибка: "dist folder not found"

```bash
# Убедитесь, что сборка выполнена
npm run build

# Проверьте, что папка dist существует
ls dist
```

### Ошибка: "Permission denied"

```bash
# Проверьте, что вы вошли в Firebase
firebase login

# Убедитесь, что у вас есть права на проект
firebase projects:list
```

### Приложение не загружается

1. Откройте консоль браузера (F12)
2. Посмотрите ошибки в консоли
3. Проверьте, что `.env.local` имеет правильные значения
4. Перезагрузите страницу (Ctrl+R)

---

## 📊 Мониторинг приложения

После развертывания вы можете:

1. **Посмотреть аналитику** → https://console.firebase.google.com → Analytics
2. **Посмотреть логи** → https://console.firebase.google.com → Logs
3. **Посмотреть использование** → https://console.firebase.google.com → Usage
4. **Посмотреть базу данных** → https://console.firebase.google.com → Firestore

---

## 🎯 Полезные ссылки

| Ссылка | Описание |
|--------|---------|
| https://console.firebase.google.com | Firebase консоль |
| https://firebase.google.com/docs | Документация Firebase |
| https://nodejs.org | Node.js (для установки) |
| https://git-scm.com | Git (для управления кодом) |

---

## 💡 Советы

- **Сохраняйте `.env.local`** - не загружайте его в Git (добавьте в `.gitignore`)
- **Используйте `firebase deploy --only hosting`** - если хотите развернуть только приложение
- **Проверяйте `firebase.json`** - там хранятся настройки развертывания
- **Смотрите логи** - если что-то не работает, ищите ошибки в логах Firebase

---

## 🚀 Готово!

Теперь вы можете развернуть TSV Keeper на Firebase за несколько минут!

**Вопросы?** Посмотрите полное руководство в файле `FIREBASE_DEPLOYMENT_COMPLETE_RUSSIAN.md`
