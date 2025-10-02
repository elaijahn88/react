import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { db } from "../firebase"; // adjust path
import { doc, onSnapshot } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

interface IUserData {
  email: string;
  name: string;
  account: number;
  age: number;
  transaction: string;
  createdAt?: string;
}

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<IUserData | null>(null);
  const [error, setError] = useState("");

  const defaultEmail = "elajahn8@gmail.com"; // or fetch dynamically

  useEffect(() => {
    const userRef = doc(db, "users", defaultEmail);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data() as IUserData);
          setError("");
        } else {
          setError("User not found");
          setUserData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Error fetching user data: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // clean up listener
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: "center" }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {userData && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity style={styles.row}>
              <Ionicons name="person-circle-outline" size={28} color="#007aff" />
              <View style={styles.rowText}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{userData.name}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.row}>
              <Ionicons name="mail-outline" size={28} color="#007aff" />
              <View style={styles.rowText}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{userData.email}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.row}>
              <Ionicons name="cash-outline" size={28} color="#007aff" />
              <View style={styles.rowText}>
                <Text style={styles.label}>Account Balance</Text>
                <Text style={styles.value}>${userData.account}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.row}>
              <Ionicons name="calendar-outline" size={28} color="#007aff" />
              <View style={styles.rowText}>
                <Text style={styles.label}>Age</Text>
                <Text style={styles.value}>{userData.age}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.row}>
              <Ionicons name="swap-horizontal-outline" size={28} color="#007aff" />
              <View style={styles.rowText}>
                <Text style={styles.label}>Last Transaction</Text>
                <Text style={styles.value}>{userData.transaction}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", padding: 10 },
  error: { color: "red", textAlign: "center", marginVertical: 10 },
  section: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#888",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowText: { marginLeft: 12 },
  label: { fontSize: 14, color: "#888" },
  value: { fontSize: 16, fontWeight: "500", marginTop: 2 },
});
