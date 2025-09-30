import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // ensure your Firestore is initialized

export default function UserFetcher() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchedEmail, setFetchedEmail] = useState("");

  const fetchUser = async () => {
    if (!email) {
      setError("Please enter an email.");
      return;
    }

    setLoading(true);
    setError("");
    setFetchedEmail("");

    try {
      // Lookup by email as document ID
      const userRef = doc(db, "users", email);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setFetchedEmail(data.email || "No email found in document");
      } else {
        setError(`No user found with ID: ${email}`);
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching user document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login with Email</Text>

      {/* User input */}
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Button title="Fetch Email" onPress={fetchUser} />

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

      {fetchedEmail ? (
        <Text style={styles.result}>Email in DB: {fetchedEmail}</Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  result: {
    marginTop: 10,
    fontSize: 16,
    color: "green",
  },
  error: {
    marginTop: 10,
    fontSize: 16,
    color: "red",
  },
});
