import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "../firebase"; // adjust path
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface IUserData {
  email: string;
  name: string;
  account: number;
  password: string;
  age: number;
  transaction: string;
  photoUrl: string;
  updatedUrl: string;
  videoUrl: string;
  createdAt?: string;
}

export default function AuthAndFetcher(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [account, setAccount] = useState<string>("");
  const [age, setAge] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // SIGN UP
  const signUp = async (): Promise<void> => {
    if (!email || !password || !name || !account || !age) {
      setMessage("All required fields must be filled");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const userRef = doc(db, "users", email);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setMessage("User with this email already exists!");
        setLoading(false);
        return;
      }

      // Create Firebase Auth user
      await createUserWithEmailAndPassword(auth, email, password);

      // Add user data in Firestore with empty fields for future transactions and URLs
      const userData: IUserData = {
        email,
        name,
        account: parseInt(account, 10),
        password, // plain text for demo; hash in production
        age: parseInt(age, 10),
        transaction: "",   // placeholder label
        photoUrl: "",      // placeholder label
        updatedUrl: "",    // placeholder label
        videoUrl: "",      // placeholder label
        createdAt: new Date().toISOString(),
      };

      await setDoc(userRef, userData);
      setMessage("✅ User registered successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // SIGN IN
  const signIn = async (): Promise<void> => {
    if (!email || !password) {
      setMessage("Email & Password required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("✅ Signed in successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Account Number"
        value={account}
        onChangeText={setAccount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <Button title="Sign Up" onPress={signUp} />
      <View style={{ height: 10 }} />
      <Button title="Login" onPress={signIn} />

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: {
    height: 50,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  message: { marginTop: 10, fontSize: 16, color: "green", textAlign: "center" },
});
