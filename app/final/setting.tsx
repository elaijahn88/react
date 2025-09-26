import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  TouchableOpacity,
  Image,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [user, setUser] = useState({
    name: "Atom services",
    email: "jah@icloud.com",
    avatar: "https://xlijah.com/pics/icon.png", // Updated avatar link
  });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(isDark);

  const bgColor = isDark ? "#121212" : "#f9f9f9";
  const cardBg = isDark ? "#1c1c1e" : "#fff";
  const textColor = isDark ? "#fff" : "#000";
  const secondaryText = isDark ? "#aaa" : "gray";

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: bgColor }]}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <TouchableOpacity style={styles.changePicButton}>
          <Ionicons name="camera" size={20} color="white" />
          <Text style={styles.changePicText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      {!editing ? (
        <>
          <Text style={[styles.name, { color: textColor }]}>{user.name}</Text>
          <Text style={[styles.email, { color: secondaryText }]}>{user.email}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setEditing(true)}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.buttonText}>+Prof</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: textColor }]}>+Prof</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[styles.input, { backgroundColor: cardBg, color: textColor, borderColor: isDark ? "#333" : "#ccc" }]}
            placeholder="Name"
            placeholderTextColor={secondaryText}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={[styles.input, { backgroundColor: cardBg, color: textColor, borderColor: isDark ? "#333" : "#ccc" }]}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor={secondaryText}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setUser({ ...user, name, email });
              setEditing(false);
            }}
          >
            <Ionicons name="save-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Save </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Tools Section */}
      <View style={[styles.toolsContainer, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Tools</Text>
        <TouchableOpacity style={styles.toolButton}>
          <Ionicons name="bag-outline" size={20} color="#007bff" />
          <Text style={styles.toolText}>My Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#007bff" />
          <Text style={styles.toolText}>Security</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton}>
          <Ionicons name="help-circle-outline" size={20} color="#007bff" />
          <Text style={styles.toolText}>Help Center</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      <View style={[styles.toolsContainer, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Settings</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>Enable Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>Privacy Mode</Text>
          <Switch value={false} />
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "red" }]}
        onPress={() => alert("Logout feature coming soon!")}
      >
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", padding: 20 },

  avatarContainer: { alignItems: "center", marginBottom: 15 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  changePicButton: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: -30,
    alignItems: "center",
  },
  changePicText: { color: "white", marginLeft: 5 },

  name: { fontSize: 20, fontWeight: "bold", marginTop: 10 },
  email: { fontSize: 16, color: "gray", marginBottom: 20 },

  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 12,
    marginTop: 15,
    borderRadius: 8,
    width: "80%",
  },
  buttonText: { color: "#fff", fontSize: 16, marginLeft: 8 },

  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, alignSelf: "flex-start" },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },

  toolsContainer: {
    marginTop: 25,
    width: "100%",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  toolButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  toolText: { fontSize: 16, marginLeft: 10, color: "#007bff" },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  settingLabel: { fontSize: 16 },
});
