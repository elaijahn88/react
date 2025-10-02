// fcmHelpers.ts
import fetch from 'node-fetch';

export const sendPushNotification = async (token: string, { title, body, data }: any) => {
  try {
    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': 'key=YOUR_SERVER_KEY', // Replace with your Firebase Server Key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        notification: { title, body },
        data,
      }),
    });
  } catch (err) {
    console.error('FCM send error:', err);
  }
};
