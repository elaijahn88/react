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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  const [user, setUser] = useState({
    name: "Atom services",
    email: "jah@example.com",
    avatar: "https://via.placeholder.com/120",
  });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setEditing(true)}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Edit Profile</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Name"
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setUser({ ...user, name, email });
              setEditing(false);
            }}
          >
            <Ionicons name="save-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Tools Section */}
      <View style={styles.toolsContainer}>
        <Text style={styles.sectionTitle}>Tools</Text>
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
      <View style={styles.toolsContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Privacy Mode</Text>
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
  container: { flexGrow: 1, alignItems: "center", padding: 20, backgroundColor: "#f9f9f9" },

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
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: "100%",
    backgroundColor: "white",
  },

  toolsContainer: {
    marginTop: 25,
    width: "100%",
    padding: 15,
    backgroundColor: "white",
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
