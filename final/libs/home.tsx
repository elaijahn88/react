import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "./firebase";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Navigation types
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: { profile: { uid: string; email: string; name: string; photoURL?: string } };
};

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ route, navigation }: Props) {
  const { profile } = route.params;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(
    "You have logged in successfully 🎉"
  );
  const [photo, setPhoto] = useState<string | undefined>(profile.photoURL);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong while logging out.");
    }
  };

  const pickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setError("Permission to access media library is required!");
      return;
    }

    // Pick an image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // square crop
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPhoto(uri);

      // Update Firebase auth profile (photoURL)
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: uri });
        setSuccess("Profile picture updated ✅");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Success label */}
      {success && (
        <View style={[styles.messageCard, styles.successCard]}>
          <Text style={styles.successText}>{success}</Text>
          <TouchableOpacity onPress={() => setSuccess(null)}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error label */}
      {error && (
        <View style={[styles.messageCard, styles.errorCard]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Profile card */}
      <View style={styles.card}>
        {/* Editable Avatar */}
        <TouchableOpacity onPress={pickImage}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.title}>{profile.name} 👋</Text>
        <Text style={styles.subtitle}>Email: {profile.email}</Text>
        <Text style={styles.uid}>UID: {profile.uid}</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f2f4f7",
  },
  messageCard: {
    position: "absolute",
    top: 40,
    padding: 12,
    borderRadius: 8,
    width: "90%",
  },
  successCard: {
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb",
    borderWidth: 1,
  },
  errorCard: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    borderWidth: 1,
  },
  successText: {
    color: "#155724",
    fontSize: 14,
    marginBottom: 5,
  },
  errorText: {
    color: "#721c24",
    fontSize: 14,
    marginBottom: 5,
  },
  dismissText: {
    fontSize: 12,
    textAlign: "right",
    textDecorationLine: "underline",
    color: "#333",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#555",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#222",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 6,
    color: "#555",
  },
  uid: {
    fontSize: 12,
    marginBottom: 20,
    color: "#888",
  },
  logoutButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
