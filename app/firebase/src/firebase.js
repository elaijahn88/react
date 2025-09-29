// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken } from "firebase/messaging";
import { getDatabase , ref, push, onValue} from "firebase/database";

// 🔑 Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-tkURRvTk80HH-kfAvnW8V396iO1lcIE",
  authDomain: "file-6f3ac.firebaseapp.com",
  projectId: "file-6f3ac",
  storageBucket: "file-6f3ac.appspot.com",
  messagingSenderId: "588974859374",
  appId: "1:588974859374:android:b0661bd1bfdb356aa3f27f",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export const database = getDatabase(app);
export { ref, push, onValue };

// 🔐 VAPID Key for Web Push
export const VAPID_KEY = "BOzsw0X4rASZJI6TbOPnqb-zUU4SJVyYWZsnXlO4iw9GAvhhywZBCF3jlFB47WqBkw8Ro4zGK36DkcLq4TRElzA";
