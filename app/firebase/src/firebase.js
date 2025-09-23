// Import Firebase SDK functions you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your config (from google-services.json + project settings)
const firebaseConfig = {
  apiKey: "AIzaSyC-tkURRvTk80HH-kfAvnW8V396iO1lcIE",
  authDomain: "file-6f3ac.firebaseapp.com", // standard format
  projectId: "file-6f3ac",
  storageBucket: "file-6f3ac.firebasestorage.app",
  messagingSenderId: "588974859374",
  appId: "1:588974859374:web:replace_this_with_web_app_id" // 👈 generate a Web app in console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services for use in your app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
