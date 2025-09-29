// App.tsx
import React, { useEffect, useState } from "react";
import { messaging, VAPID_KEY } from "./firebase";
import { getToken } from "firebase/messaging";

function App() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const requestPermissionAndGetToken = async () => {
      try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          console.log("✅ Notification permission granted.");

          const token = await getToken(messaging, { vapidKey: VAPID_KEY });

          if (token) {
            console.log("📲 FCM Token:", token);
            setFcmToken(token);
            // Optionally send token to backend
            // await sendTokenToServer(token);
          } else {
            console.warn("⚠️ No FCM token received.");
          }
        } else {
          console.warn("🚫 Notification permission denied.");
        }
      } catch (error) {
        console.error("❌ Error getting FCM token:", error);
      }
    };

    requestPermissionAndGetToken();
  }, []);

  return (
    <div>
      <h1>FCM Token</h1>
      <pre>{fcmToken || "Token not available"}</pre>
    </div>
  );
}

export default App;
