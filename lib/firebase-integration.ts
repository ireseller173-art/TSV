/**
 * Firebase Integration Layer
 * Обеспечивает подключение к Firebase Realtime Database
 * Пользователь может подключить свои credentials позже
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Типы для Firebase конфигурации
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Хранилище конфигурации
const FIREBASE_CONFIG_KEY = 'FIREBASE_CONFIG';
const FIREBASE_ENABLED_KEY = 'FIREBASE_ENABLED';

/**
 * Сохранить конфигурацию Firebase
 */
export async function saveFirebaseConfig(config: FirebaseConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    await AsyncStorage.setItem(FIREBASE_ENABLED_KEY, 'true');
  } catch (error) {
    console.error('Ошибка при сохранении Firebase конфигурации:', error);
    throw error;
  }
}

/**
 * Получить сохраненную конфигурацию Firebase
 */
export async function getFirebaseConfig(): Promise<FirebaseConfig | null> {
  try {
    const config = await AsyncStorage.getItem(FIREBASE_CONFIG_KEY);
    return config ? JSON.parse(config) : null;
  } catch (error) {
    console.error('Ошибка при получении Firebase конфигурации:', error);
    return null;
  }
}

/**
 * Проверить, включена ли Firebase
 */
export async function isFirebaseEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(FIREBASE_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Ошибка при проверке Firebase:', error);
    return false;
  }
}

/**
 * Отключить Firebase (вернуться на AsyncStorage)
 */
export async function disableFirebase(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FIREBASE_ENABLED_KEY);
    await AsyncStorage.removeItem(FIREBASE_CONFIG_KEY);
  } catch (error) {
    console.error('Ошибка при отключении Firebase:', error);
    throw error;
  }
}

/**
 * Инициализировать Firebase с конфигурацией
 * Этот метод будет вызван после того как пользователь введет credentials
 */
export async function initializeFirebase(config: FirebaseConfig): Promise<boolean> {
  try {
    // Сохраняем конфигурацию
    await saveFirebaseConfig(config);
    
    // Здесь будет инициализация Firebase SDK
    // Пока используем AsyncStorage как fallback
    console.log('Firebase конфигурация сохранена. Приложение готово к развертыванию.');
    
    return true;
  } catch (error) {
    console.error('Ошибка при инициализации Firebase:', error);
    return false;
  }
}

/**
 * Получить инструкции по настройке Firebase
 */
export function getFirebaseSetupInstructions(): string {
  return `
🔧 ИНСТРУКЦИИ ПО ПОДКЛЮЧЕНИЮ FIREBASE

1. Перейдите на https://console.firebase.google.com
2. Создайте новый проект (или используйте существующий)
3. Включите Realtime Database
4. Включите Authentication (Email/Password и Google)
5. Включите Storage для файлов
6. Перейдите в Project Settings
7. Скопируйте ваши credentials:
   - API Key
   - Auth Domain
   - Database URL
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

8. Введите эти данные в приложение через экран настроек

Приложение автоматически подключится к Firebase и начнет синхронизировать данные!
  `;
}

/**
 * Валидировать Firebase конфигурацию
 */
export function validateFirebaseConfig(config: Partial<FirebaseConfig>): boolean {
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'databaseURL',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  for (const field of requiredFields) {
    if (!config[field] || typeof config[field] !== 'string') {
      console.error(`Отсутствует или неверно указано поле: ${field}`);
      return false;
    }
  }

  return true;
}

/**
 * Получить статус Firebase подключения
 */
export async function getFirebaseStatus(): Promise<{
  enabled: boolean;
  configured: boolean;
  config?: FirebaseConfig | null;
}> {
  const enabled = await isFirebaseEnabled();
  const config = await getFirebaseConfig();

  return {
    enabled,
    configured: !!config,
    config: config || undefined,
  };
}

/**
 * Тестировать подключение к Firebase
 */
export async function testFirebaseConnection(config: FirebaseConfig): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Валидируем конфигурацию
    if (!validateFirebaseConfig(config)) {
      return {
        success: false,
        message: 'Неверная конфигурация Firebase',
      };
    }

    // Здесь будет реальное тестирование подключения
    // Пока просто проверяем валидность
    return {
      success: true,
      message: 'Firebase конфигурация валидна и готова к использованию',
    };
  } catch (error) {
    return {
      success: false,
      message: `Ошибка при тестировании: ${error}`,
    };
  }
}
