import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Translations for notifications and error messages
 */
const translations = {
  en: {
    errors: {
      chatNotFound: "Chat not found",
      noDeviceTokens: "No device tokens for user",
      errorSendingNotification: "Error sending notification",
      groupNotFound: "Group not found",
      errorSendingGroupNotification: "Error sending group notification",
      userNotAuthenticated: "User not authenticated",
      errorUpdatingPresence: "Failed to update presence",
      failedUpdatePresence: "Failed to update presence",
      deviceTokenRequired: "Device token is required",
      errorRegisteringToken: "Error registering device token",
      failedRegisterToken: "Failed to register device token",
      errorUnregisteringToken: "Error unregistering device token",
      failedUnregisterToken: "Failed to unregister device token",
      errorDuringCleanup: "Error during cleanup",
    },
    notifications: {
      newMessage: "New message",
      userInGroup: "in",
    },
  },
  ru: {
    errors: {
      chatNotFound: "Чат не найден",
      noDeviceTokens: "Нет токенов устройства для пользователя",
      errorSendingNotification: "Ошибка при отправке уведомления",
      groupNotFound: "Группа не найдена",
      errorSendingGroupNotification: "Ошибка при отправке группового уведомления",
      userNotAuthenticated: "Пользователь не аутентифицирован",
      errorUpdatingPresence: "Не удалось обновить статус",
      failedUpdatePresence: "Не удалось обновить статус",
      deviceTokenRequired: "Требуется токен устройства",
      errorRegisteringToken: "Ошибка при регистрации токена",
      failedRegisterToken: "Не удалось зарегистрировать токен",
      errorUnregisteringToken: "Ошибка при отмене регистрации токена",
      failedUnregisterToken: "Не удалось отменить регистрацию токена",
      errorDuringCleanup: "Ошибка во время очистки",
    },
    notifications: {
      newMessage: "Новое сообщение",
      userInGroup: "в",
    },
  },
};

/**
 * Get error message in specified language
 */
function getErrorMessage(key: keyof typeof translations.en.errors, language: "en" | "ru" = "en"): string {
  return translations[language]?.errors[key] || translations.en.errors[key];
}

/**
 * Get notification message in specified language
 */
function getNotificationMessage(key: keyof typeof translations.en.notifications, language: "en" | "ru" = "en"): string {
  return translations[language]?.notifications[key] || translations.en.notifications[key];
}

/**
 * Отправить push-уведомление при новом сообщении
 */
export const sendMessageNotification = functions.firestore
  .document("chats/{chatId}/messages/{messageId}")
  .onCreate(async (snap: any, context: any) => {
    const message = snap.data();
    const { chatId } = context.params;

    try {
      // Получить информацию о чате
      const chatDoc = await db.collection("chats").doc(chatId).get();
      const chatData = chatDoc.data();

      if (!chatData) {
        console.log(getErrorMessage("chatNotFound", "ru"), chatId);
        return;
      }

      // Получить информацию об отправителе
      const senderDoc = await db.collection("users").doc(message.senderId).get();
      const senderData = senderDoc.data();

      // Получить токены получателей
      const participantId = chatData.participantId;
      if (!participantId || participantId === message.senderId) {
        return;
      }

      const recipientDoc = await db.collection("users").doc(participantId).get();
      const recipientData = recipientDoc.data();

      if (!recipientData || !recipientData.deviceTokens || recipientData.deviceTokens.length === 0) {
        console.log(getErrorMessage("noDeviceTokens", "ru"), participantId);
        return;
      }

      // Get recipient's language preference (default to English)
      const recipientLanguage = (recipientData.language || "en") as "en" | "ru";

      // Отправить push-уведомление с локализацией
      const payload = {
        notification: {
          title: senderData?.name || getNotificationMessage("newMessage", recipientLanguage),
          body: message.text.substring(0, 100),
          sound: "default",
        },
        data: {
          chatId,
          messageId: context.params.messageId,
          senderId: message.senderId,
          language: recipientLanguage,
        },
      };

      const response = await messaging.sendMulticast({
        tokens: recipientData.deviceTokens,
        ...payload,
      });

      console.log(`Sent ${response.successCount} notifications`);
      if (response.failureCount > 0) {
        console.log(`Failed to send ${response.failureCount} notifications`);

        // Удалить невалидные токены
        const invalidTokens = response.responses
          .map((resp: any, idx: number) => (resp.success ? null : recipientData.deviceTokens[idx]))
          .filter((token: any) => token !== null);

        if (invalidTokens.length > 0) {
          await db.collection("users").doc(participantId).update({
            deviceTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
          });
        }
      }
    } catch (error) {
      console.error(getErrorMessage("errorSendingNotification", "ru"), error);
    }
  });

/**
 * Отправить push-уведомление при групповом сообщении
 */
export const sendGroupMessageNotification = functions.firestore
  .document("groups/{groupId}/messages/{messageId}")
  .onCreate(async (snap: any, context: any) => {
    const message = snap.data();
    const { groupId } = context.params;

    try {
      // Получить информацию о группе
      const groupDoc = await db.collection("groups").doc(groupId).get();
      const groupData = groupDoc.data();

      if (!groupData) {
        console.log(getErrorMessage("groupNotFound", "ru"), groupId);
        return;
      }

      // Получить информацию об отправителе
      const senderDoc = await db.collection("users").doc(message.senderId).get();
      const senderData = senderDoc.data();

      // Отправить уведомление всем членам группы кроме отправителя
      const members = groupData.members || [];
      const recipients = members.filter((m: string) => m !== message.senderId);

      for (const recipientId of recipients) {
        const recipientDoc = await db.collection("users").doc(recipientId).get();
        const recipientData = recipientDoc.data();

        if (!recipientData || !recipientData.deviceTokens || recipientData.deviceTokens.length === 0) {
          continue;
        }

        // Get recipient's language preference (default to English)
        const recipientLanguage = (recipientData.language || "en") as "en" | "ru";

        const payload = {
          notification: {
            title: `${senderData?.name || "User"} ${getNotificationMessage("userInGroup", recipientLanguage)} ${groupData.name}`,
            body: message.text.substring(0, 100),
            sound: "default",
          },
          data: {
            groupId,
            messageId: context.params.messageId,
            senderId: message.senderId,
            isGroup: "true",
            language: recipientLanguage,
          },
        };

        await messaging.sendMulticast({
          tokens: recipientData.deviceTokens,
          ...payload,
        });
      }

      console.log(`Sent group notifications to ${recipients.length} members`);
    } catch (error) {
      console.error(getErrorMessage("errorSendingGroupNotification", "ru"), error);
    }
  });

/**
 * Обновить статус пользователя при входе
 */
export const updateUserPresence = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      getErrorMessage("userNotAuthenticated", "ru")
    );
  }

  const userId = context.auth.uid;
  const { status, lastSeen } = data;

  try {
    await db.collection("presence").doc(userId).set(
      {
        status: status || "online",
        lastSeen: lastSeen || admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    console.error(getErrorMessage("errorUpdatingPresence", "ru"), error);
    throw new functions.https.HttpsError(
      "internal",
      getErrorMessage("failedUpdatePresence", "ru")
    );
  }
});

/**
 * Зарегистрировать токен устройства
 */
export const registerDeviceToken = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      getErrorMessage("userNotAuthenticated", "ru")
    );
  }

  const userId = context.auth.uid;
  const { token } = data;

  if (!token) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      getErrorMessage("deviceTokenRequired", "ru")
    );
  }

  try {
    await db.collection("users").doc(userId).update({
      deviceTokens: admin.firestore.FieldValue.arrayUnion(token),
      lastTokenUpdate: admin.firestore.Timestamp.now(),
    });

    return { success: true, message: "Device token registered" };
  } catch (error) {
    console.error(getErrorMessage("errorRegisteringToken", "ru"), error);
    throw new functions.https.HttpsError(
      "internal",
      getErrorMessage("failedRegisterToken", "ru")
    );
  }
});

/**
 * Удалить токен устройства при выходе
 */
export const unregisterDeviceToken = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      getErrorMessage("userNotAuthenticated", "ru")
    );
  }

  const userId = context.auth.uid;
  const { token } = data;

  if (!token) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      getErrorMessage("deviceTokenRequired", "ru")
    );
  }

  try {
    await db.collection("users").doc(userId).update({
      deviceTokens: admin.firestore.FieldValue.arrayRemove(token),
    });

    return { success: true, message: "Device token unregistered" };
  } catch (error) {
    console.error(getErrorMessage("errorUnregisteringToken", "ru"), error);
    throw new functions.https.HttpsError(
      "internal",
      getErrorMessage("failedUnregisterToken", "ru")
    );
  }
});

/**
 * Очистить старые сообщения (старше 30 дней)
 */
export const cleanupOldMessages = functions.pubsub.schedule("every day 02:00").onRun(async () => {
  try {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Очистить сообщения в чатах
    const chatsSnapshot = await db.collection("chats").get();
    for (const chatDoc of chatsSnapshot.docs) {
      const messagesSnapshot = await db
        .collection("chats")
        .doc(chatDoc.id)
        .collection("messages")
        .where("timestamp", "<", thirtyDaysAgo)
        .get();

      for (const messageDoc of messagesSnapshot.docs) {
        await messageDoc.ref.delete();
      }
    }

    // Очистить сообщения в группах
    const groupsSnapshot = await db.collection("groups").get();
    for (const groupDoc of groupsSnapshot.docs) {
      const messagesSnapshot = await db
        .collection("groups")
        .doc(groupDoc.id)
        .collection("messages")
        .where("timestamp", "<", thirtyDaysAgo)
        .get();

      for (const messageDoc of messagesSnapshot.docs) {
        await messageDoc.ref.delete();
      }
    }

    console.log("Cleanup completed");
    return { success: true };
  } catch (error) {
    console.error(getErrorMessage("errorDuringCleanup", "ru"), error);
    throw error;
  }
});
