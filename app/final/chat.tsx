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
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";

type MessageStatus = "sent" | "delivered" | "viewed";

interface IMessage {
  id: string;
  body: string;
  receivedAt: string;
  status: MessageStatus;
  email: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("user@example.com");

  // Firestore listener
  useEffect(() => {
    const unsubscribe = firestore()
      .collection("messages")
      .where("email", "==", email)
      .orderBy("receivedAt", "desc")
      .onSnapshot(snapshot => {
        const msgs: IMessage[] = [];
        snapshot.forEach(doc => msgs.push(doc.data() as IMessage));
        setMessages(msgs);
      });

    return () => unsubscribe();
  }, [email]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg: IMessage = {
      id: firestore().collection("messages").doc().id,
      body: input,
      receivedAt: new Date().toISOString(),
      status: "sent",
      email,
    };

    try {
      await firestore().collection("messages").doc(newMsg.id).set(newMsg);
      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const markAllViewed = async () => {
    try {
      const batch = firestore().batch();
      messages.forEach(msg => {
        if (msg.status !== "viewed") {
          const ref = firestore().collection("messages").doc(msg.id);
          batch.update(ref, { status: "viewed" });
        }
      });
      await batch.commit();
    } catch (err) {
      console.error("Error marking viewed:", err);
    }
  };

  const getTickColor = (status: MessageStatus) => {
    switch (status) {
      case "sent":
        return "black";
      case "delivered":
        return "red";
      case "viewed":
        return "blue";
    }
  };

  const renderItem = ({ item }: { item: IMessage }) => (
    <View style={[styles.messageBubble, { backgroundColor: "#2a2a2a" }]}>
      <Text style={{ color: "#fff", fontWeight: "600" }}>{item.body}</Text>
      <Text style={{ color: getTickColor(item.status), fontSize: 16, marginTop: 4 }}>✔</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={90}
    >
      <StatusBar barStyle="light-content" />

      {/* Email input */}
      <View style={{ padding: 10, backgroundColor: "#1f1f1f" }}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={{
            backgroundColor: "#2a2a2a",
            color: "#fff",
            padding: 12,
            borderRadius: 10,
          }}
          placeholder="Enter email"
          placeholderTextColor="#888"
        />
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      />

      {loading && <ActivityIndicator size="large" color="#25D366" />}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#888"
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={markAllViewed}
          style={[styles.sendButton, { backgroundColor: "#007bff", marginLeft: 8 }]}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Mark Viewed</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  messageBubble: {
    padding: 14,
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: "80%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#333",
  },
  input: {
    flex: 1,
    backgroundColor: "#2a2a2a",
    color: "#fff",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#25D366",
    padding: 12,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
