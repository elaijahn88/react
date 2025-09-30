// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase, ref, push, onValue } from "firebase/database";

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
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const database = getDatabase(app);

export { db, auth, storage, database, ref, push, onValue };
