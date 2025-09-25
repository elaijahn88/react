import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Video from "react-native-video";
import messaging from "@react-native-firebase/messaging";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

type Message = {
  id: string;
  text?: string;
  videoUrl?: string;
  sender: "user" | "ai" | "ATOM";
};

const { width } = Dimensions.get("window");

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", text: "WELCOME...aTOM", sender: "ATOM" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Fetch FCM token from Firestore
  const fetchFcmToken = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.fcmToken) {
          setFcmToken(data.fcmToken);
          console.log("Fetched FCM Token from DB:", data.fcmToken);
        }
      }
    } catch (err) {
      console.error("Error fetching FCM token:", err);
    }
  };

  useEffect(() => {
    fetchFcmToken();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };
    setMessages((prev) => [userMessage, ...prev]);
    setInput("");
    setLoading(true);

    try {
      // Simulate AI API response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const aiMessage: Message = {
        id: Date.now().toString() + "..",
        text: `sms: "${userMessage.text}"`,
        videoUrl: "https://xlijah.com/ai.mp4",
        sender: "ATOM",
      };
      setMessages((prev) => [aiMessage, ...prev]);

      // 🔔 Send push notification via FCM server (backend/API call)
      if (fcmToken) {
        await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=YOUR_SERVER_KEY`, // <-- from Firebase console
          },
          body: JSON.stringify({
            to: fcmToken,
            notification: {
              title: "ATOM Reply",
              body: aiMessage.text,
            },
            data: { screen: "chat" },
          }),
        });
      }
    } catch (err) {
      const errorMessage: Message = {
        id: Date.now().toString() + "-err",
        text: "❌ RESP_FAIL_TRY_AGAIN.",
        sender: "ai",
      };
      setMessages((prev) => [errorMessage, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        item.sender === "user"
          ? { ...styles.userMessage, backgroundColor: isDark ? "#056D4E" : "#DCF8C6" }
          : { ...styles.aiMessage, backgroundColor: isDark ? "#333" : "#ECECEC" },
      ]}
    >
      {item.text && <Text style={{ color: isDark ? "#f5f5f5" : "#000" }}>{item.text}</Text>}
      {item.videoUrl && (
        <Video
          source={{ uri: item.videoUrl }}
          style={styles.video}
          controls={false}
          resizeMode="contain"
        />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={90}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={[styles.header, { backgroundColor: "#075E54" }]}>
        <Ionicons name="person-circle" size={40} color="#fff" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.headerText}>ATOM</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isActive ? "limegreen" : "red" },
              ]}
            />
            <Text style={styles.statusText}>{isActive ? "Active" : "Inactive"}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ padding: 10 }}
      />

      {loading && <ActivityIndicator size="large" color="#25D366" />}

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: isDark ? "#121212" : "#fff", borderColor: isDark ? "#333" : "#ddd" },
        ]}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          style={[
            styles.input,
            { backgroundColor: isDark ? "#1c1c1e" : "#F0F0F0", color: isDark ? "#f5f5f5" : "#000" },
          ]}
          placeholder="CHAT_ATOM..."
          placeholderTextColor={isDark ? "#888" : "#999"}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingTop: 40,
  },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  statusText: { color: "#fff", fontSize: 12 },

  message: { marginVertical: 5, padding: 10, borderRadius: 10, maxWidth: "75%" },
  userMessage: { alignSelf: "flex-end" },
  aiMessage: { alignSelf: "flex-start" },
  video: { width: width * 0.7, height: 200, marginTop: 8, borderRadius: 10 },

  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    alignItems: "center",
  },
  input: { flex: 1, height: 40, borderRadius: 20, paddingHorizontal: 15, fontSize: 16 },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#25D366",
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
