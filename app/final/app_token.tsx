import messaging from "@react-native-firebase/messaging";

async function getFcmToken() {
  const token = await messaging().getToken();
  console.log("FCM Registration Token:", token);
  return token;
}
