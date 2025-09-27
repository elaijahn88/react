import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface IUserData {
  email: string;
  createdAt?: string;
}

export default function AuthDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState<IUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Auto-dismiss message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data() as IUserData);
          } else {
            setUserData({ email: user.email || "" });
          }
        } catch (err: any) {
          setMessage({ type: "error", text: "Error fetching user data: " + err.message });
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      setMessage({ type: "success", text: "User registered!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          createdAt: new Date().toISOString(),
        });
      }

      setMessage({ type: "success", text: "User signed in!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  if (loading) return <Text style={{ flex: 1, textAlign: "center", marginTop: 50 }}>Loading...</Text>;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {message && (
        <TouchableOpacity onPress={() => setMessage(null)} activeOpacity={0.8}>
          <View
            style={[
              styles.messageCard,
              {
                backgroundColor: message.type === "success" ? "#e6ffed" : "#ffe6e6",
                borderColor: message.type === "success" ? "#28a745" : "#dc3545",
              },
            ]}
          >
            <Text
              style={{
                color: message.type === "success" ? "#155724" : "#721c24",
                fontWeight: "700",
                fontSize: 16,
                marginBottom: 5,
              }}
            >
              {message.type === "success" ? "✅ Success" : "❌ Error"}
            </Text>
            <Text style={{ color: message.type === "success" ? "#155724" : "#721c24" }}>
              {message.text}
            </Text>
            <Text style={styles.dismissText}>Tap to dismiss</Text>
          </View>
        </TouchableOpacity>
      )}

      {userData ? (
        <Text style={[styles.text, { color: isDark ? "#f5f5f5" : "#000" }]}>
          Welcome, {userData.email}
        </Text>
      ) : (
        <>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#1c1c1e" : "#fff",
                color: isDark ? "#f5f5f5" : "#000",
                borderColor: isDark ? "#333" : "#ccc",
              },
            ]}
            placeholder="Email"
            placeholderTextColor={isDark ? "#888" : "#666"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#1c1c1e" : "#fff",
                color: isDark ? "#f5f5f5" : "#000",
                borderColor: isDark ? "#333" : "#ccc",
              },
            ]}
            placeholder="Password"
            placeholderTextColor={isDark ? "#888" : "#666"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Sign Up" onPress={signUp} />
          <View style={{ height: 10 }} />
          <Button title="Login" onPress={signIn} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: { height: 50, borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 5 },
  text: { fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: 20 },
  messageCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dismissText: {
    marginTop: 10,
    color: "#666",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "right",
  },
});
