import React, { useState, useEffect, useRef } from "react";
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
  LayoutAnimation,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import NetInfo from "@react-native-community/netinfo";

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type MessageStatus = "local" | "sent" | "delivered" | "viewed";

interface IMessage {
  id: string;
  body: string;
  receivedAt: FirebaseFirestoreTypes.Timestamp;
  status: MessageStatus;
  email: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("user@example.com");
  const [isConnected, setIsConnected] = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const flatListRef = useRef<FlatList<IMessage>>(null);
  let typingTimeout: NodeJS.Timeout | null = null;

  // Enable offline persistence
  useEffect(() => {
    firestore().settings({ persistence: true });
  }, []);

  // Network connectivity listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore listener for messages
  useEffect(() => {
    setLoading(true);
    const unsubscribe = firestore()
      .collection("messages")
      .where("email", "==", email)
      .orderBy("receivedAt", "desc")
      .onSnapshot(snapshot => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        const msgs: IMessage[] = [];
        snapshot.forEach(doc => {
          const data = doc.data() as Omit<IMessage, "id">;

          // Replace local message with Firestore message
          const isLocal = data.status === "local";
          msgs.push({
            id: data.id,
            body: data.body,
            receivedAt: data.receivedAt,
            email: data.email,
            status: isLocal ? "delivered" : data.status, // mark delivered if it was local
          });
        });

        setMessages(msgs);
        setLoading(false);

        // Auto-scroll
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      });

    return () => unsubscribe();
  }, [email]);

  // Firestore listener for typing indicator
  useEffect(() => {
    const unsubscribe = firestore()
      .collection("typingStatus")
      .where("email", "!=", email)
      .onSnapshot(snapshot => {
        let someoneTyping = false;
        snapshot.forEach(doc => {
          const data = doc.data() as { isTyping: boolean; lastUpdated: FirebaseFirestoreTypes.Timestamp };
          const secondsSinceUpdate = (Date.now() - data.lastUpdated.toDate().getTime()) / 1000;
          if (data.isTyping && secondsSinceUpdate < 5) {
            someoneTyping = true;
          }
        });
        setOtherTyping(someoneTyping);
      });

    return () => unsubscribe();
  }, [email]);

  // Update typing status
  const handleTyping = (text: string) => {
    setInput(text);

    firestore().collection("typingStatus").doc(email).set({
      email,
      isTyping: true,
      lastUpdated: firestore.Timestamp.now(),
    });

    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      firestore().collection("typingStatus").doc(email).set({
        email,
        isTyping: false,
        lastUpdated: firestore.Timestamp.now(),
      });
    }, 3000);
  };

  // Send message (handles offline pending)
  const sendMessage = async () => {
    if (!input.trim()) return;

    const tempId = `local-${Date.now()}`;
    const newMsg: IMessage = {
      id: tempId,
      body: input,
      receivedAt: firestore.Timestamp.fromDate(new Date()),
      status: isConnected ? "sent" : "local",
      email,
    };

    // Optimistic UI
    setMessages(prev => [newMsg, ...prev]);
    setInput("");

    if (!isConnected) return;

    try {
      const docRef = firestore().collection("messages").doc();
      await docRef.set({ id: docRef.id, ...newMsg, status: "sent" });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Mark all messages as viewed
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

  // Tick color
  const getTickColor = (status: MessageStatus) => {
    switch (status) {
      case "local":
        return "gray";
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

      {/* Offline banner */}
      {!isConnected && (
        <View style={{ backgroundColor: "red", padding: 6 }}>
          <Text style={{ color: "#fff", textAlign: "center" }}>You are offline</Text>
        </View>
      )}

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

      {/* Typing indicator */}
      {otherTyping && (
        <View style={{ padding: 6, paddingLeft: 12 }}>
          <Text style={{ color: "#aaa", fontStyle: "italic" }}>Someone is typing...</Text>
        </View>
      )}

      {/* Messages */}
      {loading ? (
        <ActivityIndicator size="large" color="#25D366" style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          inverted
          contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={handleTyping}
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#888"
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          editable={isConnected}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={[styles.sendButton, { opacity: isConnected ? 1 : 0.5 }]}
          disabled={!isConnected}
        >
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
