/**
 * Internationalization (i18n) System
 * Supports Russian and English languages
 */

export type Language = 'en' | 'ru';

/**
 * Translation strings
 */
export const translations = {
  en: {
    // Auth screens
    'auth.welcome': 'Welcome to Cool Messenger',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.phone': 'Phone Number',
    'auth.name': 'Full Name',
    'auth.loginButton': 'Sign In',
    'auth.registerButton': 'Create Account',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.loginHere': 'Login here',
    'auth.registerHere': 'Register here',

    // Chat screens
    'chat.newMessage': 'New Message',
    'chat.typeMessage': 'Type a message...',
    'chat.send': 'Send',
    'chat.attach': 'Attach',
    'chat.emoji': 'Emoji',
    'chat.call': 'Call',
    'chat.videocall': 'Video Call',
    'chat.moreOptions': 'More Options',
    'chat.deleteMessage': 'Delete Message',
    'chat.editMessage': 'Edit Message',
    'chat.copyMessage': 'Copy Message',
    'chat.forwardMessage': 'Forward Message',
    'chat.pinMessage': 'Pin Message',
    'chat.replyMessage': 'Reply',
    'chat.messageDeleted': 'Message deleted',
    'chat.messageEdited': '(edited)',
    'chat.typing': 'is typing...',
    'chat.online': 'Online',
    'chat.offline': 'Offline',
    'chat.lastSeen': 'Last seen',
    'chat.deliveryStatus.sending': 'Sending...',
    'chat.deliveryStatus.sent': 'Sent',
    'chat.deliveryStatus.delivered': 'Delivered',
    'chat.deliveryStatus.read': 'Read',
    'chat.reply': 'Reply',
    'chat.react': 'React',
    'chat.forward': 'Forward',
    'chat.edit': 'Edit',
    'chat.delete': 'Delete',
    'chat.pin': 'Pin',
    'chat.unpin': 'Unpin',
    'chat.mute': 'Mute',
    'chat.unmute': 'Unmute',
    'chat.archive': 'Archive',
    'chat.messages': 'Messages',
    'chat.searchConversations': 'Search conversations',
    'chat.noChats': 'No conversations yet',
    'chat.startChatting': 'Start Chatting',
    'chat.noMessages': 'No messages yet',
    'chat.startConversation': 'Start a conversation!',

    // Contacts
    'contacts.title': 'Contacts',
    'contacts.addContact': 'Add Contact',
    'contacts.importFromPhone': 'Import from Phone',
    'contacts.search': 'Search contacts',
    'contacts.noContacts': 'No contacts yet',
    'contacts.block': 'Block',
    'contacts.unblock': 'Unblock',
    'contacts.delete': 'Delete',
    'contacts.favorite': 'Add to Favorites',
    'contacts.unfavorite': 'Remove from Favorites',
    'contacts.blocked': 'Blocked Contacts',
    'contacts.favorites': 'Favorites',

    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit Profile',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.status': 'Status',
    'profile.avatar': 'Avatar',
    'profile.changeAvatar': 'Change Avatar',
    'profile.logout': 'Logout',
    'profile.settings': 'Settings',
    'profile.privacy': 'Privacy',
    'profile.notifications': 'Notifications',
    'profile.language': 'Language',
    'profile.theme': 'Theme',
    'profile.about': 'About',

    // Calls
    'call.incoming': 'Incoming Call',
    'call.outgoing': 'Outgoing Call',
    'call.accept': 'Accept',
    'call.reject': 'Reject',
    'call.end': 'End Call',
    'call.mute': 'Mute',
    'call.unmute': 'Unmute',
    'call.speaker': 'Speaker',
    'call.duration': 'Duration',
    'call.missed': 'Missed Call',
    'call.history': 'Call History',
    'call.noHistory': 'No call history',

    // Notifications
    'notification.newMessage': 'New message from',
    'notification.incomingCall': 'Incoming call from',
    'notification.missedCall': 'Missed call from',
    'notification.enable': 'Enable Notifications',
    'notification.disable': 'Disable Notifications',

    // Settings
    'settings.title': 'Settings',
    'settings.account': 'Account',
    'settings.security': 'Security',
    'settings.privacy': 'Privacy',
    'settings.notifications': 'Notifications',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.about': 'About',
    'settings.version': 'Version',
    'settings.help': 'Help',
    'settings.feedback': 'Send Feedback',

    // Notes
    'notes.title': 'Notes',
    'notes.new': 'New Note',
    'notes.edit': 'Edit Note',
    'notes.delete': 'Delete Note',
    'notes.search': 'Search notes',
    'notes.empty': 'No notes yet',
    'notes.label_title': 'Title',
    'notes.label_content': 'Content',
    'notes.label_date': 'Date (YYYY-MM-DD)',
    'notes.label_time': 'Time (HH:mm)',
    'notes.error_empty': 'Title and content cannot be empty',
    'notes.error_save': 'Error saving note',

    // Common
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.more': 'More',
    'common.less': 'Less',
  },

  ru: {
    // Auth screens
    'auth.welcome': 'Добро пожаловать в Cool Messenger',
    'auth.login': 'Вход',
    'auth.register': 'Регистрация',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Подтвердить пароль',
    'auth.phone': 'Номер телефона',
    'auth.name': 'Полное имя',
    'auth.loginButton': 'Войти',
    'auth.registerButton': 'Создать аккаунт',
    'auth.forgotPassword': 'Забыли пароль?',
    'auth.noAccount': 'Нет аккаунта?',
    'auth.haveAccount': 'Уже есть аккаунт?',
    'auth.loginHere': 'Войдите здесь',
    'auth.registerHere': 'Зарегистрируйтесь здесь',

    // Chat screens
    'chat.newMessage': 'Новое сообщение',
    'chat.typeMessage': 'Введите сообщение...',
    'chat.send': 'Отправить',
    'chat.attach': 'Прикрепить',
    'chat.emoji': 'Эмодзи',
    'chat.call': 'Звонок',
    'chat.videocall': 'Видеозвонок',
    'chat.moreOptions': 'Ещё опции',
    'chat.deleteMessage': 'Удалить сообщение',
    'chat.editMessage': 'Редактировать сообщение',
    'chat.copyMessage': 'Копировать сообщение',
    'chat.forwardMessage': 'Переслать сообщение',
    'chat.pinMessage': 'Закрепить сообщение',
    'chat.replyMessage': 'Ответить',
    'chat.messageDeleted': 'Сообщение удалено',
    'chat.messageEdited': '(отредактировано)',
    'chat.typing': 'печатает...',
    'chat.online': 'В сети',
    'chat.offline': 'Не в сети',
    'chat.lastSeen': 'Последний раз',
    'chat.deliveryStatus.sending': 'Отправка...',
    'chat.deliveryStatus.sent': 'Отправлено',
    'chat.deliveryStatus.delivered': 'Доставлено',
    'chat.deliveryStatus.read': 'Прочитано',
    'chat.reply': 'Ответить',
    'chat.react': 'Реакция',
    'chat.forward': 'Переслать',
    'chat.edit': 'Редактировать',
    'chat.delete': 'Удалить',
    'chat.pin': 'Закрепить',
    'chat.unpin': 'Открепить',
    'chat.mute': 'Отключить звук',
    'chat.unmute': 'Включить звук',
    'chat.archive': 'Архивировать',
    'chat.messages': 'Сообщения',
    'chat.searchConversations': 'Поиск диалогов',
    'chat.noChats': 'Диалогов нет',
    'chat.startChatting': 'Начать чат',
    'chat.noMessages': 'Сообщений нет',
    'chat.startConversation': 'Начните разговор!',

    // Contacts
    'contacts.title': 'Контакты',
    'contacts.addContact': 'Добавить контакт',
    'contacts.importFromPhone': 'Импортировать из телефона',
    'contacts.search': 'Поиск контактов',
    'contacts.noContacts': 'Контактов нет',
    'contacts.block': 'Заблокировать',
    'contacts.unblock': 'Разблокировать',
    'contacts.delete': 'Удалить',
    'contacts.favorite': 'Добавить в избранное',
    'contacts.unfavorite': 'Удалить из избранного',
    'contacts.blocked': 'Заблокированные контакты',
    'contacts.favorites': 'Избранное',

    // Profile
    'profile.title': 'Профиль',
    'profile.edit': 'Редактировать профиль',
    'profile.name': 'Имя',
    'profile.email': 'Email',
    'profile.phone': 'Телефон',
    'profile.status': 'Статус',
    'profile.avatar': 'Аватар',
    'profile.changeAvatar': 'Изменить аватар',
    'profile.logout': 'Выход',
    'profile.settings': 'Настройки',
    'profile.privacy': 'Конфиденциальность',
    'profile.notifications': 'Уведомления',
    'profile.language': 'Язык',
    'profile.theme': 'Тема',
    'profile.about': 'О приложении',

    // Calls
    'call.incoming': 'Входящий звонок',
    'call.outgoing': 'Исходящий звонок',
    'call.accept': 'Принять',
    'call.reject': 'Отклонить',
    'call.end': 'Завершить звонок',
    'call.mute': 'Отключить звук',
    'call.unmute': 'Включить звук',
    'call.speaker': 'Динамик',
    'call.duration': 'Длительность',
    'call.missed': 'Пропущенный звонок',
    'call.history': 'История звонков',
    'call.noHistory': 'История звонков пуста',

    // Notifications
    'notification.newMessage': 'Новое сообщение от',
    'notification.incomingCall': 'Входящий звонок от',
    'notification.missedCall': 'Пропущенный звонок от',
    'notification.enable': 'Включить уведомления',
    'notification.disable': 'Отключить уведомления',

    // Notes
    'notes.title': 'Заметки',
    'notes.new': 'Новая заметка',
    'notes.edit': 'Редактировать заметку',
    'notes.delete': 'Удалить заметку',
    'notes.search': 'Поиск заметок',
    'notes.empty': 'Заметок нет',
    'notes.label_title': 'Заголовок',
    'notes.label_content': 'Содержание',
    'notes.label_date': 'Дата (YYYY-MM-DD)',
    'notes.label_time': 'Время (HH:mm)',
    'notes.error_empty': 'Заголовок и содержание не могут быть пустыми',
    'notes.error_save': 'Ошибка при сохранении заметки',

    // Settings
    'settings.title': 'Настройки',
    'settings.account': 'Аккаунт',
    'settings.security': 'Безопасность',
    'settings.privacy': 'Конфиденциальность',
    'settings.notifications': 'Уведомления',
    'settings.language': 'Язык',
    'settings.theme': 'Тема',
    'settings.about': 'О приложении',
    'settings.version': 'Версия',
    'settings.help': 'Помощь',
    'settings.feedback': 'Отправить отзыв',

    // Common
    'common.yes': 'Да',
    'common.no': 'Нет',
    'common.ok': 'ОК',
    'common.cancel': 'Отмена',
    'common.save': 'Сохранить',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.close': 'Закрыть',
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успешно',
    'common.warning': 'Предупреждение',
    'common.info': 'Информация',
    'common.back': 'Назад',
    'common.next': 'Далее',
    'common.previous': 'Назад',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.sort': 'Сортировка',
    'common.more': 'Ещё',
    'common.less': 'Меньше',
  },
};

/**
 * Get translation for a key
 */
export function t(language: Language, key: string, defaultValue: string = key): string {
  const lang = translations[language] as Record<string, string>;
  return lang?.[key] || defaultValue;
}

/**
 * Format string with variables
 */
export function formatMessage(
  language: Language,
  key: string,
  variables?: Record<string, string | number>
): string {
  let message = t(language, key);

  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
    });
  }

  return message;
}

/**
 * Get all translations for a language
 */
export function getLanguageTranslations(language: Language): Record<string, string> {
  return translations[language];
}

/**
 * Check if language is supported
 */
export function isLanguageSupported(language: string): language is Language {
  return language === 'en' || language === 'ru';
}
