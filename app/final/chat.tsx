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

interface IMessage {
  id: string;
  body: string;
  sender: string;
  receivedAt: FirebaseFirestoreTypes.Timestamp;
  status: { [userEmail: string]: "sent" | "delivered" | "viewed" };
}

interface ITypingStatus {
  isTyping: boolean;
  lastUpdated: FirebaseFirestoreTypes.Timestamp;
  userEmail: string;
}

interface Props {
  roomId: string;
  email: string;
}

export default function MultiUserChat({ roomId, email }: Props) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const flatListRef = useRef<FlatList<IMessage>>(null);
  let typingTimeout: NodeJS.Timeout | null = null;

  // Offline persistence
  useEffect(() => {
    firestore().settings({ persistence: true });
  }, []);

  // Network listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  // Listen to messages in the room
  useEffect(() => {
    setLoading(true);
    const unsubscribe = firestore()
      .collection("rooms")
      .doc(roomId)
      .collection("messages")
      .orderBy("receivedAt", "desc")
      .onSnapshot(snapshot => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        const msgs: IMessage[] = [];
        snapshot.forEach(doc => {
          const data = doc.data() as IMessage;
          msgs.push(data);
        });
        setMessages(msgs);
        setLoading(false);

        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      });

    return () => unsubscribe();
  }, [roomId]);

  // Listen to typing indicators
  useEffect(() => {
    const unsubscribe = firestore()
      .collection("rooms")
      .doc(roomId)
      .collection("typingStatus")
      .where("userEmail", "!=", email)
      .onSnapshot(snapshot => {
        let someoneTyping = false;
        snapshot.forEach(doc => {
          const data = doc.data() as ITypingStatus;
          const secondsSinceUpdate = (Date.now() - data.lastUpdated.toDate().getTime()) / 1000;
          if (data.isTyping && secondsSinceUpdate < 5) someoneTyping = true;
        });
        setOtherTyping(someoneTyping);
      });
    return () => unsubscribe();
  }, [roomId, email]);

  // Handle typing
  const handleTyping = (text: string) => {
    setInput(text);

    firestore()
      .collection("rooms")
      .doc(roomId)
      .collection("typingStatus")
      .doc(email)
      .set({
        isTyping: true,
        lastUpdated: firestore.Timestamp.now(),
        userEmail: email,
      });

    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      firestore()
        .collection("rooms")
        .doc(roomId)
        .collection("typingStatus")
        .doc(email)
        .set({
          isTyping: false,
          lastUpdated: firestore.Timestamp.now(),
          userEmail: email,
        });
    }, 3000);
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg: IMessage = {
      id: firestore().collection("rooms").doc().id,
      body: input,
      sender: email,
      receivedAt: firestore.Timestamp.fromDate(new Date()),
      status: { [email]: "sent" },
    };

    setMessages(prev => [newMsg, ...prev]);
    setInput("");

    if (!isConnected) return;

    try {
      const docRef = firestore()
        .collection("rooms")
        .doc(roomId)
        .collection("messages")
        .doc(newMsg.id);
      await docRef.set(newMsg);
    } catch (err) {
      console.error(err);
    }
  };

  // Mark message viewed
  const markMessageViewed = async (msgId: string) => {
    const ref = firestore().collection("rooms").doc(roomId).collection("messages").doc(msgId);
    await ref.update({ [`status.${email}`]: "viewed" });
  };

  const getTickColor = (status: "sent" | "delivered" | "viewed" | undefined) => {
    switch (status) {
      case "sent":
        return "black";
      case "delivered":
        return "red";
      case "viewed":
        return "blue";
      default:
        return "gray";
    }
  };

  const renderItem = ({ item }: { item: IMessage }) => {
    const userStatus = item.status[email];
    return (
      <View style={[styles.messageBubble, { backgroundColor: "#2a2a2a" }]}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>{item.body}</Text>
        <Text style={{ color: getTickColor(userStatus), fontSize: 16, marginTop: 4 }}>✔</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={90}
    >
      <StatusBar barStyle="light-content" />
      {!isConnected && (
        <View style={{ backgroundColor: "red", padding: 6 }}>
          <Text style={{ color: "#fff", textAlign: "center" }}>You are offline</Text>
        </View>
      )}

      {otherTyping && (
        <View style={{ padding: 6, paddingLeft: 12 }}>
          <Text style={{ color: "#aaa", fontStyle: "italic" }}>Someone is typing...</Text>
        </View>
      )}

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
    marginLeft: 8,
  },
});
