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

  // ... your existing states (messages, input, loading, isActive)...

  // Handler for video end event
  const handleVideoEnd = () => {
    setVideoPaused(true);
  };

  // Rest of your existing code (sendMessage, renderItem, etc.)

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
            <Text style={styles.statusText}>{isActive ? "Active" : "Inactive"}</Text>
          </View>
        </View>
      </View>

      {/* Global video player */}
      <Video
        ref={videoRef}
        source={{ uri: "https://xlijah.com/ai.mp4" }}
        style={styles.video}
        paused={videoPaused}
        resizeMode="contain"
        onEnd={handleVideoEnd}
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
  // ...existing styles...
  video: { width: width * 0.9, height: 200, alignSelf: "center", marginBottom: 10, borderRadius: 10 },
  // ...rest of styles...
});
