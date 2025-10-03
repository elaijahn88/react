import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { db } from "../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

interface IUserData {
  id: string;
  email: string;
  name: string;
  account: number;
  age: number;
  transaction: string;
  phone?: string;
  location?: string;
  createdAt?: string;
}

export default function SettingsScreen() {
  const [userData, setUserData] = useState<IUserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersQuery = query(collection(db, "users"));

    const unsubscribe = onSnapshot(
      usersQuery,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          setUserData({
            id: doc.id,
            email: data.email ?? "N/A",
            name: data.name ?? "No Name",
            account: data.account ?? 0,
            age: data.age ?? 0,
            transaction: data.transaction ?? "None",
            phone: data.phone,
            location: data.location,
            createdAt: data.createdAt,
          });
        } else {
          Alert.alert("Info", "No user data found in database");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: "key-outline" as const,
          label: "Privacy",
          value: "Last seen, profile info",
          onPress: () => Alert.alert("Privacy", "Manage your privacy settings"),
        },
        {
          icon: "shield-checkmark-outline" as const,
          label: "Security",
          value: "Two-step verification",
          onPress: () => Alert.alert("Security", "Security settings"),
        },
        {
          icon: "phone-portrait-outline" as const,
          label: "Change Number",
          value: userData?.phone ?? "Not set",
          onPress: () => Alert.alert("Change Number", "Update your phone number"),
        },
        {
          icon: "document-text-outline" as const,
          label: "Request Account Info",
          value: "Download your data",
          onPress: () => Alert.alert("Account Info", "Request your account data"),
        },
      ],
    },
    {
      title: "Finance",
      items: [
        {
          icon: "card-outline" as const,
          label: "Payment Methods",
          value: "Bank accounts, cards",
          onPress: () => Alert.alert("Payment Methods", "Manage payment options"),
        },
        {
          icon: "trending-up-outline" as const,
          label: "Transaction History",
          value: "View all transactions",
          onPress: () => Alert.alert("Transactions", "View your transaction history"),
        },
        {
          icon: "notifications-outline" as const,
          label: "Alerts & Notifications",
          value: "Transaction alerts",
          onPress: () => Alert.alert("Notifications", "Manage your alerts"),
        },
      ],
    },
    {
      title: "Chats",
      items: [
        {
          icon: "cloud-upload-outline" as const,
          label: "Chat Backup",
          value: "Last backup: Never",
          onPress: () => Alert.alert("Backup", "Backup your chats"),
        },
        {
          icon: "archive-outline" as const,
          label: "Archive All Chats",
          value: "",
          onPress: () => Alert.alert("Archive", "Archive all chats"),
        },
        {
          icon: "time-outline" as const,
          label: "Chat History",
          value: "Keep chats archived",
          onPress: () => Alert.alert("Chat History", "Manage chat history"),
        },
      ],
    },
    {
      title: "Help",
      items: [
        {
          icon: "help-circle-outline" as const,
          label: "Help Center",
          value: "FAQs and support",
          onPress: () => Alert.alert("Help", "Visit help center"),
        },
        {
          icon: "headset-outline" as const,
          label: "Contact Us",
          value: "Get help from support",
          onPress: () => Alert.alert("Contact", "Contact support team"),
        },
        {
          icon: "information-circle-outline" as const,
          label: "App Info",
          value: "Version 2.22.25.76",
          onPress: () => Alert.alert("App Info", "Finance App v2.22.25.76"),
        },
      ],
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#666" />
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userData?.name || "No User Found"}</Text>
          <Text style={styles.userStatus}>
            {userData ? "Hey there! I am using FinanceApp" : "Please add user data to database"}
          </Text>
        </View>
      </View>

      {/* User Info */}
      {userData && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.row}>
            <Ionicons name="person-circle-outline" size={28} color="#666" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Name</Text>
              <Text style={styles.rowValue}>{userData.name}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <Ionicons name="mail-outline" size={28} color="#666" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{userData.email}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <Ionicons name="cash-outline" size={28} color="#666" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Account Balance</Text>
              <Text style={styles.rowValue}>${userData.account.toLocaleString()}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <Ionicons name="calendar-outline" size={28} color="#666" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Age</Text>
              <Text style={styles.rowValue}>{userData.age}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <Ionicons name="swap-horizontal-outline" size={28} color="#666" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Last Transaction</Text>
              <Text style={styles.rowValue}>{userData.transaction}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Settings Sections */}
      {settingsSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.row, index === section.items.length - 1 && styles.lastRow]}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={28} color="#666" />
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                {item.value ? <Text style={styles.rowValue}>{item.value}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => Alert.alert("Logout", "Are you sure you want to logout?")}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  profileHeader: { flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: "#f6f6f6", borderBottomWidth: 1, borderBottomColor: "#e5e5e5" },
  avatarContainer: { marginRight: 15 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#e1e1e1", justifyContent: "center", alignItems: "center" },
  profileInfo: { flex: 1 },
  userName: { fontSize: 22, fontWeight: "bold", color: "#000" },
  userStatus: { fontSize: 16, color: "#666", marginTop: 5 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#666", marginBottom: 5, paddingHorizontal: 20 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 20, backgroundColor: "#fff" },
  lastRow: { borderBottomWidth: 0 },
  rowContent: { flex: 1, marginLeft: 15 },
  rowLabel: { fontSize: 16, fontWeight: "500", color: "#000" },
  rowValue: { fontSize: 14, color: "#666", marginTop: 2 },
  logoutButton: { margin: 20, padding: 15, backgroundColor: "#FF3B30", borderRadius: 10, alignItems: "center" },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
