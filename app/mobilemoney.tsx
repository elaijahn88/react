import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Alert, FlatList, Text, StyleSheet } from "react-native";
import { db, auth } from "./firebase"; // Your firebase.ts
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

interface Transaction {
  id: string;
  recipient: string;
  amount: number;
  createdAt: Timestamp;
  senderEmail: string;
  proof?: string;
}

interface UserBalance {
  uid: string;
  email: string;
  balance: number;
}

export default function MoneySharingWithProof() {
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [history, setHistory] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);

  const user = auth.currentUser;
  const userEmail = user?.email || "unknown";
  const uid = user?.uid;

  // Fetch balance & transaction history
  useEffect(() => {
    if (uid) {
      fetchBalance();
      fetchHistory();
    }
  }, [uid]);

  const fetchBalance = async () => {
    try {
      const userRef = doc(db, "users", uid!);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserBalance;
        setBalance(data.balance || 0);
      } else {
        // Create user with initial balance
        await updateDoc(userRef, { balance: 100000 }); // Default balance UGX 100,000
        setBalance(100000);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch balance.");
    }
  };

  const fetchHistory = async () => {
    try {
      const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          recipient: data.recipient,
          amount: data.amount,
          createdAt: data.createdAt,
          senderEmail: data.senderEmail,
          proof: data.proof,
        });
      });
      setHistory(transactions);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch transaction history.");
    }
  };

  const sendMoney = async () => {
    if (!recipient || !amount) {
      Alert.alert("Error", "Please enter recipient and amount.");
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Error", "Enter a valid amount.");
      return;
    }

    if (amt > balance) {
      Alert.alert("Error", "Insufficient balance!");
      return;
    }

    try {
      // Generate proof of work (unique receipt ID)
      const proof = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Record transaction in Firestore
      await addDoc(collection(db, "transactions"), {
        recipient,
        amount: amt,
        createdAt: Timestamp.now(),
        senderEmail: userEmail,
        proof,
      });

      // Deduct balance
      const userRef = doc(db, "users", uid!);
      await updateDoc(userRef, { balance: balance - amt });
      setBalance(balance - amt);

      Alert.alert("Success", `Sent UGX ${amt} to ${recipient}\nReceipt: ${proof}`);
      setRecipient("");
      setAmount("");
      fetchHistory();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to send money.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.balance}>Your Balance: UGX {balance}</Text>
      <TextInput
        style={styles.input}
        placeholder="Recipient Mobile Number"
        value={recipient}
        onChangeText={setRecipient}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Amount (UGX)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title="Send Money" onPress={sendMoney} />

      <Text style={styles.historyTitle}>Transaction History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text>Recipient: {item.recipient}</Text>
            <Text>Amount: UGX {item.amount}</Text>
            <Text>Sent by: {item.senderEmail}</Text>
            <Text>Date: {item.createdAt.toDate().toLocaleString()}</Text>
            <Text>Receipt: {item.proof}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  balance: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  historyTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 15 },
  transactionItem: {
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
});
