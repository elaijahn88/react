// notifications.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging"; // if using bare RN
import { getMessaging, getToken } from "firebase/messaging"; // if using web SDK

// Ask permission & return token
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert("Must use physical device for Push Notifications");
    return null;
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return null;
  }

  // ✅ Get Expo Push Token (works with Expo’s own push service)
  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
  console.log("Expo push token:", expoPushToken);

  // ✅ Get FCM Token (for Firebase Cloud Messaging)
  if (Platform.OS === "android") {
    await Notifications.getPermissionsAsync(); // make sure perms granted
    const fcmToken = (await Notifications.getDevicePushTokenAsync()).data;
    console.log("FCM token:", fcmToken);
    return fcmToken;
  }

  return expoPushToken; // fallback
}
