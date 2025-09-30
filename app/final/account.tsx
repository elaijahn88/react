import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { doc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase"; // adjust path

export default function App() {
  const [email, setEmail] = useState(""); 
  const [fetchedEmail, setFetchedEmail] = useState(""); 
  const [userName, setUserName] = useState<string>("");
  const [userAccount, setUserAccount] = useState<number>(0);
  const [userAge, setUserAge] = useState<number>(0);

  const [transactions, setTransactions] = useState<{ receiver: string; amount: string; timestamp: string; proof?: string }[]>([]);
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");

  const fetchUserData = async () => {
    if (!email) return;

    try {
      const userRef = doc(db, "users", email);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setFetchedEmail(email);
        setUserName(data.name || "");
        setUserAccount(data.account || 0);
        setUserAge(data.age || 0);

        const txCol = collection(db, "users", email, "transactions");
        const txSnap = await getDocs(txCol);
        const txList: typeof transactions = [];
        txSnap.forEach((doc) => txList.push(doc.data() as any));
        setTransactions(txList.reverse());
      } else {
        setFetchedEmail("");
        setUserName("");
        setUserAccount(0);
        setUserAge(0);
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const sendMoney = () => {
    if (!receiver || !amount || !fetchedEmail) return;

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

  const syncTransactions = async () => {
    if (!fetchedEmail || transactions.length === 0) return;

    try {
      const txCol = collection(db, "users", fetchedEmail, "transactions");
      for (const tx of transactions) {
        await addDoc(txCol, tx);
      }
      alert("Transactions synced to Firestore!");
    } catch (err) {
      console.error("Error syncing transactions:", err);
      alert("Error syncing transactions");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Enter User Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.goButton} onPress={fetchUserData}>
        <Text style={styles.goButtonText}>Go</Text>
      </TouchableOpacity>

      {userName ? (
        <>
          <Text style={styles.sectionTitle}>Welcome, {userName}</Text>
          <Text style={styles.sectionSubtitle}>Account: {userAccount} | Age: {userAge}</Text>

          <Text style={styles.sectionTitle}>Send Money</Text>
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

          <TouchableOpacity style={[styles.goButton, { backgroundColor: "#FF9800" }]} onPress={syncTransactions}>
            <Text style={styles.goButtonText}>Sync Transactions</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Transaction History</Text>
          {transactions.length > 0 ? (
            transactions.map((tx, idx) => (
              <View key={idx} style={styles.txCard}>
                <Text style={styles.txText}>To: {tx.receiver} | Amount: {tx.amount}</Text>
                <Text style={styles.txText}>Time: {tx.timestamp}</Text>
                <Text style={styles.txText}>Proof: {tx.proof}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noTx}>No transactions yet.</Text>
          )}
        </>
      ) : (
        fetchedEmail ? <Text style={styles.noTx}>No user found with this email.</Text> : null
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#121212", flexGrow: 1 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginVertical: 15, color: "#fff" },
  sectionSubtitle: { fontSize: 16, fontWeight: "500", color: "#ccc", marginBottom: 10 },
  card: { backgroundColor: "#1f1f1f", borderRadius: 15, padding: 15, marginBottom: 20, alignItems: "center" },
  input: { width: "100%", backgroundColor: "#2a2a2a", color: "#fff", borderRadius: 10, padding: 12, marginBottom: 12 },
  goButton: { backgroundColor: "#007bff", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, marginBottom: 15, alignItems: "center" },
  goButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  sendButton: { backgroundColor: "#25D366", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
  sendButtonText: { color: "#121212", fontWeight: "bold", fontSize: 16 },
  txCard: { backgroundColor: "#1f1f1f", borderRadius: 12, padding: 12, marginBottom: 12 },
  txText: { color: "#fff", fontSize: 14, marginBottom: 4 },
  noTx: { color: "#aaa", textAlign: "center", marginVertical: 10 },
});
