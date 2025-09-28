import React, { useState, useRef } from "react";
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

const { width } = Dimensions.get("window");

export default function AIChat() {
  const videoRef = useRef<Video>(null);

  const [videoPaused, setVideoPaused] = useState(false);
  const [messages, setMessages] = useState<
    { id: string; text: string; type: "sent" | "received" }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleVideoEnd = () => {
    setVideoPaused(true);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now().toString(), text: input, type: "sent" };
    setMessages((prev) => [newMsg, ...prev]);

    // Fake auto reply for demo
    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        text: "Got it ✅",
        type: "received",
      };
      setMessages((prev) => [reply, ...prev]);
    }, 1200);

    setInput("");
  };

  const renderItem = ({
    item,
  }: {
    item: { id: string; text: string; type: "sent" | "received" };
  }) => (
    <View
      style={[
        styles.messageBubble,
        item.type === "sent"
          ? { alignSelf: "flex-end", backgroundColor: "#ffe5e5" }
          : { alignSelf: "flex-start", backgroundColor: "#e5ffe5" },
      ]}
    >
      <Text
        style={[
          styles.messageText,
          { color: item.type === "sent" ? "red" : "green" },
        ]}
      >
        {item.type === "sent" ? "Sent: " : "Received: "} {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={90}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: "#25D366", shadowColor: "#25D366" },
        ]}
      >
        <Ionicons name="person-circle" size={44} color="#fff" />
        <View style={{ marginLeft: 14 }}>
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

      {/* Video */}
      <Video
        ref={videoRef}
        source={{ uri: "https://xlijah.com/ai.mp4" }}
        style={[
          styles.video,
          {
            shadowColor: isDark ? "#000" : "#aaa",
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 6,
          },
        ]}
        paused={videoPaused}
        resizeMode="contain"
        onEnd={handleVideoEnd}
        repeat={false}
        controls={false}
        playInBackground={false}
        playWhenInactive={false}
      />

      {/* Chat messages */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      />

      {loading && <ActivityIndicator size="large" color="#25D366" />}

      {/* Input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? "#121212" : "#fff",
            borderColor: isDark ? "#333" : "#ddd",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 5,
            elevation: 10,
          },
        ]}
      >
        <View style={{ flex: 1, justifyContent: "center" }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#1c1c1e" : "#F0F0F0",
                color: isDark ? "#f5f5f5" : "#000",
              },
            ]}
            placeholder="Type your message..."
            placeholderTextColor={isDark ? "#888" : "#888"}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
        </View>

        {/* Attachments & media buttons */}
        <TouchableOpacity style={styles.iconButton} onPress={() => console.log("Attach File")}>
          <Text style={styles.iconText}>📎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => console.log("Video")}>
          <Text style={styles.iconText}>🎥</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => console.log("Audio")}>
          <Text style={styles.iconText}>🎵</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => console.log("Mic")}>
          <Text style={styles.iconText}>🎙️</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={sendMessage} style={styles.sendButton} activeOpacity={0.7}>
          <Ionicons name="send" size={24} color="#fff" />
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  headerText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  video: {
    width: width * 0.9,
    height: 220,
    alignSelf: "center",
    marginBottom: 14,
    borderRadius: 14,
    overflow: "hidden",
  },
  messageBubble: {
    padding: 14,
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: { fontSize: 16, fontWeight: "600" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
  },
  iconButton: {
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#4caf50",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: { fontSize: 20, color: "#fff" },
  sendButton: {
    marginLeft: 12,
    backgroundColor: "#25D366",
    padding: 14,
    borderRadius: 30,
    shadowColor: "#25D366",
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
