import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CropRegion {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export class AvatarCropperService {
  private static readonly STORAGE_KEY_PREFIX = "avatar_";
  private static readonly MAX_SIZE = 500; // px
  private static readonly QUALITY = 0.8;

  /**
   * Обрезает изображение аватара
   */
  static async cropImage(
    imageUri: string,
    cropRegion: CropRegion
  ): Promise<string | null> {
    try {
      // В реальном приложении здесь будет использование expo-image-manipulator
      console.log("AvatarCropperService: Обрезано изображение", { imageUri, cropRegion });
      return imageUri;
    } catch (error) {
      console.error("AvatarCropperService: Ошибка при обрезке:", error);
      return null;
    }
  }

  /**
   * Изменяет размер изображения
   */
  static async resizeImage(
    imageUri: string,
    width: number = this.MAX_SIZE,
    height: number = this.MAX_SIZE
  ): Promise<string | null> {
    try {
      // В реальном приложении здесь будет использование expo-image-manipulator
      console.log("AvatarCropperService: Изменен размер изображения", { imageUri, width, height });
      return imageUri;
    } catch (error) {
      console.error("AvatarCropperService: Ошибка при изменении размера:", error);
      return null;
    }
  }

  /**
   * Применяет фильтр к изображению (яркость, контраст)
   */
  static async applyFilter(
    imageUri: string,
    brightness: number = 1,
    contrast: number = 1
  ): Promise<string | null> {
    try {
      // В реальном приложении здесь будет применение фильтров
      console.log("AvatarCropperService: Применен фильтр", { imageUri, brightness, contrast });
      return imageUri;
    } catch (error) {
      console.error("AvatarCropperService: Ошибка при применении фильтра:", error);
      return null;
    }
  }

  /**
   * Сохраняет обработанный аватар в кэш
   */
  static async cacheAvatar(
    imageUri: string,
    userId: string
  ): Promise<string | null> {
    try {
      // Сохраняем путь в AsyncStorage
      const cacheKey = `${this.STORAGE_KEY_PREFIX}${userId}`;
      await AsyncStorage.setItem(cacheKey, imageUri);
      await AsyncStorage.setItem(`${cacheKey}_timestamp`, new Date().getTime().toString());

      console.log("AvatarCropperService: Аватар кэширован", { userId, imageUri });
      return imageUri;
    } catch (error) {
      console.error("AvatarCropperService: Ошибка при кэшировании:", error);
      return null;
    }
  }

  /**
   * Получает кэшированный аватар
   */
  static async getCachedAvatar(userId: string): Promise<string | null> {
    try {
      const cacheKey = `${this.STORAGE_KEY_PREFIX}${userId}`;
      const cachedUri = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedUri) {
        return null;
      }

      // Проверяем, не устарел ли кэш (7 дней)
      const timestampKey = `${cacheKey}_timestamp`;
      const timestamp = await AsyncStorage.getItem(timestampKey);
      
      if (timestamp) {
        const lastUpdate = parseInt(timestamp, 10);
        const now = new Date().getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        
        if (now - lastUpdate > sevenDays) {
          await this.deleteCachedAvatar(userId);
          return null;
        }
      }

      return cachedUri;
    } catch (error) {
      console.error("AvatarCropperService: Ошибка при получении кэша:", error);
      return null;
    }
  }

  /**
   * Удаляет кэшированный аватар
   */
  static async deleteCachedAvatar(userId: string): Promise<boolean> {
    try {
      const cacheKey = `${this.STORAGE_KEY_PREFIX}${userId}`;
      await AsyncStorage.removeItem(cacheKey);
      await AsyncStorage.removeItem(`${cacheKey}_timestamp`);

      console.log("AvatarCropperService: Кэш аватара удален", { userId });
      return true;
    } catch (error) {
      console.error("AvatarCropperService: Ошибка при удалении кэша:", error);
      return false;
    }
  }

  /**
   * Очищает весь кэш аватаров
   */
  static async clearAllCache(): Promise<number> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const avatarKeys = allKeys.filter((key) => key.startsWith(this.STORAGE_KEY_PREFIX));
      
      if (avatarKeys.length > 0) {
        await AsyncStorage.multiRemove(avatarKeys);
      }

      console.log(`AvatarCropperService: Удалено ${avatarKeys.length} файлов кэша`);
      return avatarKeys.length;
    } catch (error) {
      console.error("AvatarCropperService: Ошибка при очистке кэша:", error);
      return 0;
    }
  }

  /**
   * Получает информацию об изображении
   */
  static async getImageInfo(imageUri: string): Promise<{
    width: number;
    height: number;
    size: number;
  } | null> {
    try {
      // В реальном приложении здесь будет получение информации об изображении
      return {
        width: this.MAX_SIZE,
        height: this.MAX_SIZE,
        size: 0,
      };
    } catch (error) {
      console.error("AvatarCropperService: Ошибка при получении информации:", error);
      return null;
    }
  }

  /**
   * Сжимает изображение до нужного размера
   */
  static async compressImage(
    imageUri: string,
    maxSize: number = this.MAX_SIZE
  ): Promise<string | null> {
    try {
      // В реальном приложении здесь будет использование expo-image-manipulator
      console.log("AvatarCropperService: Изображение сжато", { maxSize });
      return imageUri;
    } catch (error) {
      console.error("AvatarCropperService: Ошибка при сжатии:", error);
      return null;
    }
  }

  /**
   * Полная обработка аватара (обрезка + сжатие + кэширование)
   */
  static async processAvatar(
    imageUri: string,
    userId: string,
    cropRegion?: CropRegion
  ): Promise<string | null> {
    try {
      let processedUri = imageUri;

      // Обрезаем если нужно
      if (cropRegion) {
        const croppedUri = await this.cropImage(imageUri, cropRegion);
        if (croppedUri) {
          processedUri = croppedUri;
        }
      }

      // Сжимаем
      const compressedUri = await this.compressImage(processedUri);
      if (!compressedUri) {
        return null;
      }

      // Кэшируем
      const cachedUri = await this.cacheAvatar(compressedUri, userId);
      
      console.log("AvatarCropperService: Аватар полностью обработан", { userId });
      return cachedUri;
    } catch (error) {
      console.error("AvatarCropperService: Ошибка при полной обработке:", error);
      return null;
    }
  }
}
