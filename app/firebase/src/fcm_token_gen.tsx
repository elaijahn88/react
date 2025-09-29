import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Your Firebase configuration object.
// You still need to replace these with your actual Firebase project settings.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);

// src/App.js
import React, { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "./firebase-config"; // The file from Step 1

// **YOUR PROVIDED PUBLIC VAPID KEY**
const VAPID_KEY = "BOzsw0X4rASZJI6TbOPnqb-zUU4SJVyYWZsnXlO4iw9GAvhhywZBCF3jlFB47WqBkw8Ro4zGK36DkcLq4TRElzA";

function App() {
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    async function requestPermissionAndGetToken() {
      try {
        // Request notification permission from the user
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          console.log("Notification permission granted.");
          
          // Get the FCM token using the VAPID key
          const token = await getToken(messaging, { vapidKey: VAPID_KEY });
          console.log("FCM Token generated:", token);
          setFcmToken(token);

          // You would typically send this token to your backend server
          // to store it for sending targeted notifications.
          // sendTokenToServer(token);

        } else if (permission === "denied") {
          console.log("Notification permission denied.");
        }
      } catch (err) {
        console.error("Error retrieving FCM token:", err);
      }
    }

    requestPermissionAndGetToken();

  }, []);

  return (
    <div>
      <h1>React FCM Token Generator</h1>
      {fcmToken ? (
        <p>FCM Token: <strong>{fcmToken}</strong></p>
      ) : (
        <p>Awaiting notification permission and token...</p>
      )}
    </div>
  );
}

export default App;
