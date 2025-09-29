// App.tsx
import React, { useEffect, useState } from 'react';
import { Text, View, Alert, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

function App() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const requestPermissionAndGetToken = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('✅ Notification permission granted.');

          const token = await messaging().getToken();

          if (token) {
            console.log('📲 FCM Token:', token);
            setFcmToken(token);
            // Optionally send token to backend
            // await sendTokenToServer(token);
          } else {
            console.warn('⚠️ No FCM token received.');
          }
        } else {
          console.warn('🚫 Notification permission denied.');
          Alert.alert('Permission denied for notifications');
        }
      } catch (error) {
        console.error('❌ Error getting FCM token:', error);
      }
    };

    requestPermissionAndGetToken();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>FCM Token:</Text>
      <Text selectable>{fcmToken || 'Token not available'}</Text>
    </View>
  );
}

export default App;
