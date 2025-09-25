import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import Video from "react-native-video";
import { db, auth } from "../firebase"; // adjust path
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

const { width } = Dimensions.get("window");

// Sample videos
const videos = [
  { title: "Music", uri: "https://xlijah.com/soso.mp4" },
  { title: "AI", uri: "https://xlijah.com/ai.mp4" },
];

export default function DashboardScreen() {
  // Video state
  const [pausedStates, setPausedStates] = useState(videos.map(() => true));
  const videoRefs = videos.map(() => useRef<Video>(null));

  // Financial state
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [transactions, setTransactions] = useState<
    { receiver: string; amount: string; timestamp: string; proof?: string }[]
  >([]);
  const [accountBalance, setAccountBalance] = useState<number>(0);

  // Toggle play/pause
  const togglePause = (index: number) => {
    setPausedStates((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  const onEnd = (index: number) => {
    setPausedStates((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  // Fetch user data and transactions on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setTransactions(data.transactions || []);
        setAccountBalance(data.accountBalance || 0);
      } else {
        // If no document, create default user
        await setDoc(userRef, {
          name: "New User",
          email: user.email,
          phone: "0746524088",
          age: 25,
          accountBalance: 100000,
          transactions: [],
          createdAt: new Date(),
        });
        setAccountBalance(100000);
        setTransactions([]);
      }
    };

    fetchUserData();
  }, []);

  // Send money
  const sendMoney = async () => {
    if (!receiver || !amount) return Alert.alert("Error", "Enter receiver and amount.");

    const amtNum = parseFloat(amount);
    if (amtNum > accountBalance) return Alert.alert("Error", "Insufficient balance.");

    const newTx = {
      receiver,
      amount,
      timestamp: new Date().toLocaleString(),
      proof: `Receipt#${Math.floor(Math.random() * 10000)}`,
    };

    // Update local state
    setTransactions([newTx, ...transactions]);
    setAccountBalance(accountBalance - amtNum);
    setReceiver("");
    setAmount("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      const userRef = doc(db, "users", user.uid);

      // Update transactions array
      await updateDoc(userRef, {
        transactions: arrayUnion(newTx),
        accountBalance: accountBalance - amtNum,
      });
    } catch (err: any) {
      console.error("Error updating database:", err.message);
      Alert.alert("Error", err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Videos</Text>

      {videos.map((video, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Video
            ref={videoRefs[idx]}
            source={{ uri: video.uri }}
            style={styles.video}
            resizeMode="contain"
            controls={false}
            paused={pausedStates[idx]}
            onEnd={() => onEnd(idx)}
          />
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => togglePause(idx)}
          >
            <Text style={styles.playButtonText}>
              {pausedStates[idx] ? "▶" : "⏸"}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Account Balance: ${accountBalance.toFixed(2)}</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Receiver"
          placeholderTextColor="#aaa"
          value={receiver}
          onChangeText={setReceiver}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#aaa"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMoney}>
          <Text style={styles.sendButtonText}>Send Money</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Transaction History</Text>

      {transactions.map((tx, idx) => (
        <View key={idx} style={styles.txCard}>
          <Text style={styles.txText}>
            To: {tx.receiver} | Amount: {tx.amount}
          </Text>
          <Text style={styles.txText}>Time: {tx.timestamp}</Text>
          <Text style={styles.txText}>Proof: {tx.proof}</Text>
        </View>
      ))}

      {transactions.length === 0 && <Text style={styles.noTx}>No transactions yet.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#121212" },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#fff",
  },
  card: {
    backgroundColor: "#1f1f1f",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  videoTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#fff" },
  video: { width: "100%", height: 220, borderRadius: 12, backgroundColor: "#000" },
  playButton: {
    backgroundColor: "#bb86fc",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 12,
  },
  playButtonText: { color: "#121212", fontWeight: "bold", fontSize: 16 },
  input: {
    width: "100%",
    backgroundColor: "#2a2a2a",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: "#03dac6",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  sendButtonText: { color: "#121212", fontWeight: "bold", fontSize: 16 },
  txCard: {
    backgroundColor: "#1f1f1f",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  txText: { color: "#fff", fontSize: 14, marginBottom: 4 },
  noTx: { color: "#aaa", textAlign: "center", marginVertical: 10 },
});
