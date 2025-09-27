import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Video from "react-native-video";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  // Only one video: ai.mp4
  const [paused, setPaused] = useState(false); // auto-play immediately
  const videoRef = useRef<Video>(null);

  // Financial state
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [transactions, setTransactions] = useState<
    { receiver: string; amount: string; timestamp: string; proof?: string }[]
  >([]);

  const onEnd = () => {
    setPaused(true); // stop after playing once
  };

  const sendMoney = () => {
    if (!receiver || !amount) return;
    const newTx = {
      receiver,
      amount,
      timestamp: new Date().toLocaleString(),
      proof: `Receipt#${Math.floor(Math.random() * 10000)}`,
    };
    setTransactions([newTx, ...transactions]);
    setReceiver("");
    setAmount("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>AI Video</Text>

      <View style={styles.card}>
        <Text style={styles.videoTitle}>AI</Text>
        <Video
          ref={videoRef}
          source={{ uri: "https://xlijah.com/ai.mp4" }}
          style={styles.video}
          resizeMode="contain"
          paused={paused}
          onEnd={onEnd}
          repeat={false} // ensure no looping
        />
      </View>

      <Text style={styles.sectionTitle}>Money</Text>
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
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>TRN_HSTRY</Text>
      {transactions.map((tx, idx) => (
        <View key={idx} style={styles.txCard}>
          <Text style={styles.txText}>
            To: {tx.receiver} | Amount: {tx.amount}
          </Text>
          <Text style={styles.txText}>Time: {tx.timestamp}</Text>
          <Text style={styles.txText}>Proof: {tx.proof}</Text>
        </View>
      ))}
      {transactions.length === 0 && (
        <Text style={styles.noTx}>NO_HSTRY.</Text>
      )}
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
  input: {
    width: "100%",
    backgroundColor: "#2a2a2a",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: "#25D366", // green color for send button
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
