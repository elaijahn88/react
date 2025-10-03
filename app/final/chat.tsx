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
  Image,
  Alert,
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
  status: { [userEmail: string]: "local" | "sent" | "delivered" | "viewed" };
  reactions?: { [userEmail: string]: string };
  mentions?: string[];
}

interface IUser {
  displayName: string;
  avatarUrl: string;
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
  const [users, setUsers] = useState<{ [email: string]: IUser }>({});
  const flatListRef = useRef<FlatList<IMessage>>(null);
  let typingTimeout: NodeJS.Timeout | null = null;

  // Offline persistence
  useEffect(() => {
    firestore().setPersistenceEnabled(true);
  }, []);

  // Network listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  // Fetch room users
  useEffect(() => {
    const unsubscribe = firestore()
      .collection("rooms")
      .doc(roomId)
      .collection("users")
      .onSnapshot(snapshot => {
        const u: { [email: string]: IUser } = {};
        snapshot.forEach(doc => (u[doc.id] = doc.data() as IUser));
        setUsers(u);
      });
    return () => unsubscribe();
  }, [roomId]);

  // Listen to messages
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
        snapshot.forEach(doc => msgs.push(doc.data() as IMessage));
        setMessages(msgs);
        setLoading(false);

        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      });
    return () => unsubscribe();
  }, [roomId]);

  // Typing indicator listener
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
          const seconds = (Date.now() - data.lastUpdated.toDate().getTime()) / 1000;
          if (data.isTyping && seconds < 5) someoneTyping = true;
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
        lastUpdated: firestore.FieldValue.serverTimestamp(),
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
          lastUpdated: firestore.FieldValue.serverTimestamp(),
          userEmail: email,
        });
    }, 3000);
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const mentions = parseMentions(input);
    const tempId = `local-${Date.now()}`;
    const newMsg: IMessage = {
      id: tempId,
      body: input,
      sender: email,
      receivedAt: FirebaseFirestoreTypes.Timestamp.fromDate(new Date()),
      status: { [email]: isConnected ? "sent" : "local" },
      mentions,
    };

    // Optimistic UI
    setMessages(prev => [newMsg, ...prev]);
    setInput("");

    if (!isConnected) return;

    try {
      const docRef = firestore()
        .collection("rooms")
        .doc(roomId)
        .collection("messages")
        .doc(tempId);
      await docRef.set(newMsg);
    } catch (err) {
      console.error(err);
    }
  };

  // Parse mentions
  const parseMentions = (text: string) => {
    const regex = /@([\w]+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) mentions.push(match[1]);
    return mentions;
  };

  // Handle reaction
  const handleReaction = (msgId: string, emoji: string) => {
    const ref = firestore().collection("rooms").doc(roomId).collection("messages").doc(msgId);
    ref.update({ [`reactions.${email}`]: emoji });
  };

  const getTickColor = (status: "local" | "sent" | "delivered" | "viewed" | undefined) => {
    switch (status) {
      case "local":
        return "gray";
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
    const senderUser = users[item.sender];
    return (
      <View style={styles.messageRow}>
        {senderUser && item.sender !== email && (
          <Image source={{ uri: senderUser.avatarUrl }} style={styles.avatar} />
        )}
        <TouchableOpacity
          style={[styles.messageBubble, { backgroundColor: "#2a2a2a" }]}
          onLongPress={() => showReactionPicker(item.id)}
          onPress={() => markMessageViewed(item.id)}
        >
          <Text>
            {item.body.split(/(@[\w]+)/g).map((part, idx) =>
              part.startsWith("@") ? (
                <Text key={idx} style={{ color: "#1e90ff", fontWeight: "bold" }}>
                  {part}
                </Text>
              ) : (
                <Text key={idx}>{part}</Text>
              )
            )}
          </Text>
          <Text style={{ color: getTickColor(userStatus), fontSize: 16, marginTop: 4 }}>✔</Text>

          {item.reactions && (
            <View style={{ flexDirection: "row", marginTop: 4 }}>
              {Object.values(item.reactions).map((emoji, idx) => (
                <Text key={idx} style={{ fontSize: 16, marginRight: 4 }}>
                  {emoji}
                </Text>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const showReactionPicker = (msgId: string) => {
    Alert.alert(
      "React to message",
      "Choose an emoji",
      [
        { text: "👍", onPress: () => handleReaction(msgId, "👍") },
        { text: "❤️", onPress: () => handleReaction(msgId, "❤️") },
        { text: "😂", onPress: () => handleReaction(msgId, "😂") },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const markMessageViewed = (msgId: string) => {
    const ref = firestore().collection("rooms").doc(roomId).collection("messages").doc(msgId);
    ref.update({ [`status.${email}`]: "viewed" });
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
  messageRow: { flexDirection: "row", alignItems: "flex-end", marginVertical: 4 },
  avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 6 },
  messageBubble: {
    padding: 14,
    borderRadius: 12,
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
