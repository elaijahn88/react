import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

interface IUserData {
  email: string;
  name: string;
  account: number;
  age: number;
  phone?: string;
  address?: string;
}

export default function EnhancedAuth() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [account, setAccount] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setMessage("Email is required");
      return false;
    }

    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address");
      return false;
    }

    if (!password.trim()) {
      setMessage("Password is required");
      return false;
    }

    if (!isLoginMode) {
      if (!name.trim()) {
        setMessage("Full name is required");
        return false;
      }

      if (confirmPassword && password !== confirmPassword) {
        setMessage("Passwords do not match");
        return false;
      }
    }

    return true;
  };

  const handleSignUp = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    try {
      const userRef = doc(db, "users", email);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setMessage("User with this email already exists!");
      } else {
        const userData: IUserData = {
          email,
          name,
          account: Number(account) || 0,
          age: Number(age) || 0,
        };
        await setDoc(userRef, userData);
        setMessage("✅ Account created successfully!");
      }
    } catch (err: any) {
      console.error(err);
      setMessage("Error creating account: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("✅ Welcome back!");
    } catch (err: any) {
      console.error(err);
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={48} color="#007AFF" />
          </View>
          <Text style={styles.welcomeTitle}>
            {isLoginMode ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {isLoginMode
              ? "Sign in to continue to your account"
              : "Create your account to get started"}
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={text => {
                setEmail(text);
                setMessage("");
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  setMessage("");
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password (only for sign up) */}
          {!isLoginMode && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={text => {
                    setConfirmPassword(text);
                    setMessage("");
                  }}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Name Input for Sign Up */}
          {!isLoginMode && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={text => {
                  setName(text);
                  setMessage("");
                }}
              />
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={isLoginMode ? handleSignIn : handleSignUp}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {isLoginMode ? "Sign In" : "Create Account"}
            </Text>
          </TouchableOpacity>

          {/* Toggle Login/Sign Up */}
          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => {
              setIsLoginMode(!isLoginMode);
              setMessage("");
            }}
          >
            <Text style={styles.switchModeText}>
              {isLoginMode
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}

          {/* Message Display */}
          {message ? (
            <View
              style={[
                styles.messageContainer,
                message.includes("✅") ? styles.successMessage : styles.errorMessage,
              ]}
            >
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 30 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  welcomeTitle: { fontSize: 28, fontWeight: "700", color: "#1a1a1a", textAlign: "center", marginBottom: 8 },
  welcomeSubtitle: { fontSize: 16, color: "#6b7280", textAlign: "center", marginBottom: 20 },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  inputWrapper: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 4 },
  input: { flex: 1, fontSize: 16, color: "#1a1a1a" },
  passwordToggle: { padding: 4 },
  submitButton: { backgroundColor: "#007AFF", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  switchModeButton: { paddingVertical: 12, alignItems: "center" },
  switchModeText: { color: "#007AFF", fontSize: 14, fontWeight: "500" },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.8)", justifyContent: "center", alignItems: "center" },
  messageContainer: { padding: 12, borderRadius: 8, marginTop: 16 },
  successMessage: { backgroundColor: "#d1fae5", borderColor: "#a7f3d0" },
  errorMessage: { backgroundColor: "#fee2e2", borderColor: "#fecaca" },
  messageText: { fontSize: 14, textAlign: "center" },
});
