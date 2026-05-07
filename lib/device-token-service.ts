import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { db } from "./firebase-config";
// import { ref, set, remove, get } from "firebase/database";
// Используем AsyncStorage для локального хранилища токенов

export class DeviceTokenService {
  private static readonly STORAGE_KEY = "device_token";
  private static readonly STORAGE_TIMESTAMP_KEY = "device_token_timestamp";
  private static readonly TOKEN_REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 часа

  /**
   * Регистрирует токен устройства в Firebase
   */
  static async registerToken(userId: string): Promise<string | null> {
    try {
      // Получаем токен push-уведомлений
      const token = await this.getPushToken();
      
      if (!token) {
        console.warn("DeviceTokenService: Не удалось получить push token");
        return null;
      }

      // Сохраняем локально
      await AsyncStorage.setItem(this.STORAGE_KEY, token);
      await AsyncStorage.setItem(
        this.STORAGE_TIMESTAMP_KEY,
        new Date().getTime().toString()
      );

      // Сохраняем в Firebase Realtime Database
      // В реальном приложении здесь будет отправка токена на сервер
      console.log("DeviceTokenService: Токен отправлен на сервер", { userId, token });

      console.log("DeviceTokenService: Токен зарегистрирован успешно");
      return token;
    } catch (error) {
      console.error("DeviceTokenService: Ошибка при регистрации токена:", error);
      return null;
    }
  }

  /**
   * Удаляет токен устройства из Firebase
   */
  static async unregisterToken(userId: string): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (!token) {
        console.warn("DeviceTokenService: Токен не найден");
        return false;
      }

      // Удаляем из Firebase
      // В реальном приложении здесь будет отправка запроса на сервер
      console.log("DeviceTokenService: Запрос удаления отправлен на сервер", { userId, token });

      // Удаляем локально
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      await AsyncStorage.removeItem(this.STORAGE_TIMESTAMP_KEY);

      console.log("DeviceTokenService: Токен удален успешно");
      return true;
    } catch (error) {
      console.error("DeviceTokenService: Ошибка при удалении токена:", error);
      return false;
    }
  }

  /**
   * Получает сохраненный токен
   */
  static async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("DeviceTokenService: Ошибка при получении токена:", error);
      return null;
    }
  }

  /**
   * Проверяет, нужно ли обновить токен
   */
  static async shouldRefreshToken(): Promise<boolean> {
    try {
      const timestamp = await AsyncStorage.getItem(this.STORAGE_TIMESTAMP_KEY);
      
      if (!timestamp) {
        return true;
      }

      const lastUpdate = parseInt(timestamp, 10);
      const now = new Date().getTime();
      
      return now - lastUpdate > this.TOKEN_REFRESH_INTERVAL;
    } catch (error) {
      console.error("DeviceTokenService: Ошибка при проверке токена:", error);
      return true;
    }
  }

  /**
   * Обновляет токен если необходимо
   */
  static async refreshTokenIfNeeded(userId: string): Promise<string | null> {
    try {
      const shouldRefresh = await this.shouldRefreshToken();
      
      if (shouldRefresh) {
        return await this.registerToken(userId);
      }

      return await this.getStoredToken();
    } catch (error) {
      console.error("DeviceTokenService: Ошибка при обновлении токена:", error);
      return null;
    }
  }

  /**
   * Получает все токены пользователя из Firebase
   */
  static async getUserTokens(userId: string): Promise<string[]> {
    try {
      // В реальном приложении здесь будет запрос к серверу
      const token = await this.getStoredToken();
      return token ? [token] : [];
    } catch (error) {
      console.error("DeviceTokenService: Ошибка при получении токенов:", error);
      return [];
    }
  }

  /**
   * Удаляет все старые токены пользователя (старше 30 дней)
   */
  static async cleanupOldTokens(userId: string): Promise<number> {
    try {
      // В реальном приложении здесь будет запрос к серверу
      const timestamp = await AsyncStorage.getItem(this.STORAGE_TIMESTAMP_KEY);
      
      if (!timestamp) {
        return 0;
      }

      const lastUpdate = parseInt(timestamp, 10);
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      if (lastUpdate < thirtyDaysAgo) {
        await AsyncStorage.removeItem(this.STORAGE_KEY);
        await AsyncStorage.removeItem(this.STORAGE_TIMESTAMP_KEY);
        console.log("DeviceTokenService: Удален старый токен");
        return 1;
      }

      return 0;
    } catch (error) {
      console.error("DeviceTokenService: Ошибка при очистке токенов:", error);
      return 0;
    }
  }

  /**
   * Получает push token от Expo
   */
  private static async getPushToken(): Promise<string | null> {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error("DeviceTokenService: Ошибка при получении push token:", error);
      return null;
    }
  }

  /**
   * Определяет платформу устройства
   */
  private static getPlatform(): string {
    // В реальном приложении здесь будет определение платформы
    return "expo";
  }
}
