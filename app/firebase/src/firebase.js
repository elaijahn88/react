// firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔑 Firebase config from console
const firebaseConfig = {
  apiKey: "AIzaSyC-tkURRvTk80HH-kfAvnW8V396iO1lcIE",
  authDomain: "file-6f3ac.firebaseapp.com",
  projectId: "file-6f3ac",
  storageBucket: "file-6f3ac.appspot.com",
  messagingSenderId: "588974859374",
  appId: "1:588974859374:android:b0661bd1bfdb356aa3f27f",
};

// ✅ Initialize Firebase App only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(), // handles multiple tabs if web
  }),
});

// ✅ Auth & Storage
export const auth = getAuth(app);
export const storage = getStorage(app);
