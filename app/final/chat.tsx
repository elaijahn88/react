import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Video from "react-native-video";

type Message = {
  id: string;
  text?: string;
  videoUrl?: string;
  sender: "user" | "ai";
};

const { width } = Dimensions.get("window");

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", text: "WELCOME...aTOM", sender: "ATOM" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

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
        id: Date.now().toString() + "-ai",
        text: `AI Response to: "${userMessage.text}"`,
        videoUrl: "https://xlijah.com/ai.mp4", // Replace with real AI video URL
        sender: "ATOM",
      };
      setMessages((prev) => [aiMessage, ...prev]);
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
        item.sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {item.text && <Text style={styles.messageText}>{item.text}</Text>}
      {item.videoUrl && (
        <Video
          source={{ uri: item.videoUrl }}
          style={styles.video}
          controls
          resizeMode="contain"
        />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={90}
    >
      {/* Header with AI icon + active/inactive status */}
      <View style={styles.header}>
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
            <Text style={styles.statusText}>
              {isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
      </View>

      {/* Chat list */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ padding: 10 }}
      />

      {loading && <ActivityIndicator size="large" color="#25D366" />}

      {/* Input box */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="CHAT_ATOM..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Header (WhatsApp style)
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#075E54",
    padding: 10,
    paddingTop: 40,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
  },

  // Messages
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6", // WhatsApp user bubble
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ECECEC", // WhatsApp other bubble
  },
  messageText: { fontSize: 16 },
  video: {
    width: width * 0.7,
    height: 200,
    marginTop: 8,
    borderRadius: 10,
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#25D366", // WhatsApp green
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
