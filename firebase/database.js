import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Save user profile
export const saveUser = async (uid, userData) => {
  await setDoc(doc(db, "users", uid), userData);
};

// Get user profile
export const getUser = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};
