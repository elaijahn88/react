// firebaseHelpers.ts
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPushNotification } from './fcmHelpers'; // See below

export const sendMessage = async (chatId: string, senderId: string, receiverId: string, text: string) => {
  try {
    // Save message to Firestore
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      sender: senderId,
      text,
      createdAt: serverTimestamp(),
    });

    // Get receiver FCM token
    const receiverRef = doc(db, 'users', receiverId);
    const receiverSnap = await getDoc(receiverRef);
    if (!receiverSnap.exists()) return;

    const receiverData = receiverSnap.data();
    const token = receiverData.fcmToken;

    if (token) {
      // Send FCM notification
      await sendPushNotification(token, {
        title: 'New Message',
        body: text,
        data: { chatId },
      });
    }
  } catch (err) {
    console.error('Error sending message:', err);
  }
};
