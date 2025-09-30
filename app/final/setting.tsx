import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { db } from "../firebase"; // adjust path
import { doc, getDoc } from "firebase/firestore";

interface IUserData {
  email: string;
  name: string;
  account: number;
  age: number;
  transaction: string;
  createdAt?: string;
}

export default function AuthAndFetcher(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<IUserData | null>(null);
  const [message, setMessage] = useState<string>("");

  const defaultEmail = "elajahn8@gmail.com";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", defaultEmail);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as IUserData;
          setUserData(data);
        } else {
          setMessage("User not found in database!");
        }
      } catch (err: any) {
        console.error(err);
        setMessage("Error fetching user data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: "center" }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {userData && (
        <View style={styles.userInfo}>
          <Text style={styles.userTitle}>User Info:</Text>
          <Text>Email: {userData.email}</Text>
          <Text>Name: {userData.name}</Text>
          <Text>Account: {userData.account}</Text>
          <Text>Age: {userData.age}</Text>
          <Text>Transaction: {userData.transaction}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  message: { fontSize: 16, color: "red", textAlign: "center", marginBottom: 10 },
  userInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  userTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
