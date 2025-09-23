import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text } from "react-native";
import { auth, db } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function AuthDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Retrieve user data from Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setUserData({ email: user.email });
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "User registered!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "User signed in!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      {userData ? (
        <Text>Welcome, {userData.email}</Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Sign Up" onPress={signUp} />
          <View style={{ height: 10 }} />
          <Button title="Sign In" onPress={signIn} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
