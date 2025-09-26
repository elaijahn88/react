// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔑 Your config (from Firebase console > Project settings)
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

// ✅ Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// ✅ Auth & Storage
export const auth = getAuth(app);
export const storage = getStorage(app);
