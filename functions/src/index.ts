import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

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
        console.log("Chat not found:", chatId);
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
        console.log("No device tokens for user:", participantId);
        return;
      }

      // Отправить push-уведомление
      const payload = {
        notification: {
          title: senderData?.name || "Новое сообщение",
          body: message.text.substring(0, 100),
          sound: "default",
        },
        data: {
          chatId,
          messageId: context.params.messageId,
          senderId: message.senderId,
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
      console.error("Error sending notification:", error);
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
        console.log("Group not found:", groupId);
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

        const payload = {
          notification: {
            title: `${senderData?.name || "Пользователь"} в ${groupData.name}`,
            body: message.text.substring(0, 100),
            sound: "default",
          },
          data: {
            groupId,
            messageId: context.params.messageId,
            senderId: message.senderId,
            isGroup: "true",
          },
        };

        await messaging.sendMulticast({
          tokens: recipientData.deviceTokens,
          ...payload,
        });
      }

      console.log(`Sent group notifications to ${recipients.length} members`);
    } catch (error) {
      console.error("Error sending group notification:", error);
    }
  });

/**
 * Обновить статус пользователя при входе
 */
export const updateUserPresence = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
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
    console.error("Error updating presence:", error);
    throw new functions.https.HttpsError("internal", "Failed to update presence");
  }
});

/**
 * Зарегистрировать токен устройства
 */
export const registerDeviceToken = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
  }

  const userId = context.auth.uid;
  const { token } = data;

  if (!token) {
    throw new functions.https.HttpsError("invalid-argument", "Device token is required");
  }

  try {
    await db.collection("users").doc(userId).update({
      deviceTokens: admin.firestore.FieldValue.arrayUnion(token),
      lastTokenUpdate: admin.firestore.Timestamp.now(),
    });

    return { success: true, message: "Device token registered" };
  } catch (error) {
    console.error("Error registering device token:", error);
    throw new functions.https.HttpsError("internal", "Failed to register device token");
  }
});

/**
 * Удалить токен устройства при выходе
 */
export const unregisterDeviceToken = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
  }

  const userId = context.auth.uid;
  const { token } = data;

  if (!token) {
    throw new functions.https.HttpsError("invalid-argument", "Device token is required");
  }

  try {
    await db.collection("users").doc(userId).update({
      deviceTokens: admin.firestore.FieldValue.arrayRemove(token),
    });

    return { success: true, message: "Device token unregistered" };
  } catch (error) {
    console.error("Error unregistering device token:", error);
    throw new functions.https.HttpsError("internal", "Failed to unregister device token");
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
    console.error("Error during cleanup:", error);
    throw error;
  }
});
