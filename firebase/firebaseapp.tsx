// App.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { auth, db } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Fetch user data from Firestore
        const docRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sign up new user
  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        createdAt: new Date(),
      });
    } catch (error) {
      alert(error.message);
    }
  };

  // Login existing user
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  };

  // Logout
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text>Welcome, {user.email}</Text>
          {userData && <Text>Joined: {userData.createdAt.toDate().toString()}</Text>}
          <Button title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
          <Button title="Sign Up" onPress={handleSignup} />
          <Button title="Login" onPress={handleLogin} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
});
