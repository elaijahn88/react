// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";
import { getDatabase } from "firebase/database";

// 🔑 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-tkURRvTk80HH-kfAvnW8V396iO1lcIE",
  authDomain: "file-6f3ac.firebaseapp.com",
  projectId: "file-6f3ac",
  storageBucket: "file-6f3ac.firebasestorage.app",
  messagingSenderId: "588974859374",
  appId: "1:588974859374:android:b0661bd1bfdb356aa3f27f",
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore
export const db = getFirestore(app);
//messaging
export const messaging = getMessaging(app);

// ✅ Firebase Auth & Storage
export const auth = getAuth(app);
//realtime database 
export const database = getDatabase(app);

export const storage = getStorage(app);
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

