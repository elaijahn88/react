import React, { useState, useEffect } from "react";
import { 
  View, 
  TextInput, 
  Button, 
  Alert, 
  StyleSheet, 
  Text, 
  useColorScheme, 
  StatusBar 
} from "react-native";
import { auth, db } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface IUserData {
  email: string;
  createdAt?: string;
}

export default function AuthDemo({ navigation }: any) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [userData, setUserData] = useState<IUserData | null>(null);
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Listen for auth state changes
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

          navigation.replace("explore");
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up user
  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "User registered!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // Sign in user
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

      Alert.alert("Success", "User signed in!");
      navigation.replace("explore");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  if (loading) return <Text style={{ flex: 1, textAlign: "center", marginTop: 50 }}>Loading...</Text>;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
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
                borderColor: isDark ? "#333" : "#ccc"
              }
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
                borderColor: isDark ? "#333" : "#ccc"
              }
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
  text: { fontSize: 18, fontWeight: "600" },
});
