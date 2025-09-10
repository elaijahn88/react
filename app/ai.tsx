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
} from "react-native";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
      // TODO: Replace with real AI API call
      // Example: fetch AI response from OpenAI, local model, etc.
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate delay

      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        text: `AI Response to: "${userMessage.text}"`,
        sender: "ai",
      };
      setMessages((prev) => [aiMessage, ...prev]);
    } catch (err) {
      const errorMessage: Message = {
        id: Date.now().toString() + "-err",
        text: "Failed to get AI response. Try again.",
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
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ padding: 10 }}
      />

      {loading && <ActivityIndicator size="large" color="#007AFF" />}

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="Ask AI something..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  message: {
    marginVertical: 5,
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
  },
  messageText: { fontSize: 16 },
});
