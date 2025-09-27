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

  // ✅ Start unpaused so video auto-plays
  const [videoPaused, setVideoPaused] = useState(false);

  // States
  const [messages, setMessages] = useState<{ id: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Handler for video end event → pause when finished
  const handleVideoEnd = () => {
    setVideoPaused(true);
  };

  // Dummy sendMessage
  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now().toString(), text: input };
    setMessages((prev) => [newMsg, ...prev]);
    setInput("");
  };

  // Dummy renderItem
  const renderItem = ({ item }: { item: { id: string; text: string } }) => (
    <View
      style={{
        backgroundColor: isDark ? "#333" : "#eee",
        padding: 10,
        borderRadius: 8,
        marginVertical: 4,
      }}
    >
      <Text style={{ color: isDark ? "#fff" : "#000" }}>{item.text}</Text>
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

      {/* Global video player */}
      <Video
        ref={videoRef}
        source={{ uri: "https://xlijah.com/ai.mp4" }}
        style={styles.video}
        paused={videoPaused}   // starts false → auto-plays
        resizeMode="contain"
        onEnd={handleVideoEnd} // stops after first play
        repeat={false}
        controls={false}
        playInBackground={false}
        playWhenInactive={false}
      />

      {/* Chat Messages */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ padding: 10 }}
      />

      {loading && <ActivityIndicator size="large" color="#25D366" />}

      {/* Input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? "#121212" : "#fff",
            borderColor: isDark ? "#333" : "#ddd",
          },
        ]}
      >
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
    backgroundColor: "#25D366",
    padding: 10,
  },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: { color: "#fff", fontSize: 12 },
  video: {
    width: width * 0.9,
    height: 200,
    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#25D366",
    padding: 10,
    borderRadius: 20,
  },
});
