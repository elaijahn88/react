import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  FlatList,
} from "react-native";
import { collection, doc, onSnapshot, addDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Types
type Transaction = {
  id?: string;
  receiver: string;
  amount: number;
  timestamp: string;
  type: "income" | "expense";
  proof?: string;
};

type FinanceItem = {
  name: string;
  details: string;
};

const financeItems: Record<string, FinanceItem[]> = {
  Banks: [
    { name: "Bank of Africa", details: "Largest bank in the region. HQ: Nairobi, Kenya." },
    { name: "Equity Bank", details: "Leading retail bank with mobile banking services." },
  ],
  Sacco: [
    { name: "Sacco", details: "Savings and credit cooperative for teachers." },
    { name: "Healthcare Sacco", details: "Serving healthcare professionals." },
  ],
  Microfinance: [{ name: "MicroCred", details: "Micro loans and financial inclusion services." }],
  "Credit Societies": [{ name: "Community Credit Union", details: "Credit union serving local communities." }],
};

export default function FinanceDashboard() {
  const [email, setEmail] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");

  const [selectedFinanceCategory, setSelectedFinanceCategory] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const [accountBalance, setAccountBalance] = useState(0);

  // Map for animated flashes
  const animMap = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Fetch transactions in real-time
  useEffect(() => {
    if (!email) return;

    const txCol = collection(db, "users", email, "transactions");
    const unsubscribe = onSnapshot(txCol, (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Transaction;
        txs.push({ ...data, id: doc.id });
      });

      // Animate new transactions
      txs.forEach((tx) => {
        if (tx.id && !animMap[tx.id]) {
          animMap[tx.id] = new Animated.Value(1);
          Animated.sequence([
            Animated.timing(animMap[tx.id], { toValue: 0, duration: 1500, useNativeDriver: false }),
          ]).start();
        }
      });

      setTransactions(txs.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)));

      // Update balance
      const balance = txs.reduce((acc, t) => acc + t.amount, 0);
      setAccountBalance(balance);
    });

    return () => unsubscribe();
  }, [email]);

  const sendMoney = async () => {
    if (!receiver || !amount || !email) return;

    const newTx: Transaction = {
      receiver,
      amount: Number(amount),
      timestamp: new Date().toISOString(),
      type: Number(amount) >= 0 ? "income" : "expense",
      proof: `Receipt#${Math.floor(Math.random() * 10000)}`,
    };

    try {
      await addDoc(collection(db, "users", email, "transactions"), newTx);
      setReceiver("");
      setAmount("");
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };

  const toggleItem = (name: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItem(expandedItem === name ? null : name);
  };

  const filteredFinanceItems = (category: string) => {
    if (!searchText.trim()) return financeItems[category];
    return financeItems[category].filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const anim = animMap[item.id || ""] || new Animated.Value(0);
    const bgColor = anim.interpolate({
      inputRange: [0, 1],
      outputRange: ["#111", item.type === "income" ? "#0f0" : "#f00"],
    });

    return (
      <Animated.View style={[styles.txCard, { backgroundColor: bgColor }]}>
        <Text style={styles.txText}>To: {item.receiver} | Amount: {item.amount.toLocaleString()}</Text>
        <Text style={styles.txText}>Time: {new Date(item.timestamp).toLocaleString()}</Text>
        {item.proof && <Text style={styles.txText}>Proof: {item.proof}</Text>}
      </Animated.View>
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput
        style={styles.input}
        placeholder="User Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 5 }]}
          placeholder="Receiver"
          placeholderTextColor="#aaa"
          value={receiver}
          onChangeText={setReceiver}
        />
        <TextInput
          style={[styles.input, { flex: 1, marginLeft: 5 }]}
          placeholder="Amount"
          placeholderTextColor="#aaa"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.sendButton} onPress={sendMoney}>
        <Text style={styles.sendButtonText}>Send Money</Text>
      </TouchableOpacity>

      {/* Account Summary */}
      <View style={[styles.summaryCard, { backgroundColor: accountBalance >= 0 ? "#0a0" : "#a00" }]}>
        <Text style={styles.summaryLabel}>Balance</Text>
        <Text style={styles.summaryAmount}>{accountBalance.toLocaleString()} UGX</Text>
      </View>

      {/* Finance Categories */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Banks, Sacco, etc..."
        placeholderTextColor="#aaa"
        value={searchText}
        onChangeText={setSearchText}
      />

      <View style={styles.categories}>
        {Object.keys(financeItems).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedFinanceCategory === cat && styles.categoryButtonActive,
            ]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setSelectedFinanceCategory(selectedFinanceCategory === cat ? null : cat);
              setExpandedItem(null);
            }}
          >
            <Text
              style={[
                styles.categoryText,
                selectedFinanceCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedFinanceCategory && (
        <View style={{ marginTop: 10 }}>
          {filteredFinanceItems(selectedFinanceCategory).length === 0 ? (
            <Text style={styles.noResultsText}>No results found.</Text>
          ) : (
            filteredFinanceItems(selectedFinanceCategory).map((item) => (
              <View key={item.name} style={styles.itemContainer}>
                <TouchableOpacity onPress={() => toggleItem(item.name)} style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemToggle}>{expandedItem === item.name ? "-" : "+"}</Text>
                </TouchableOpacity>
                {expandedItem === item.name && (
                  <View style={styles.itemDetailsContainer}>
                    <Text style={styles.itemDetails}>{item.details}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      )}

      {/* Transaction History */}
      <Text style={styles.sectionTitle}>Transaction History</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#000" },
  input: { backgroundColor: "#222", color: "#fff", borderRadius: 10, padding: 12, marginBottom: 10 },
  sendButton: { backgroundColor: "#25D366", padding: 12, borderRadius: 25, alignItems: "center", marginBottom: 15 },
  sendButtonText: { color: "#121212", fontWeight: "bold", fontSize: 16 },
  summaryCard: { borderRadius: 12, padding: 20, alignItems: "center", marginBottom: 15 },
  summaryLabel: { color: "#fff", fontSize: 16 },
  summaryAmount: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 5 },
  searchInput: { backgroundColor: "#222", color: "#fff", borderRadius: 10, paddingHorizontal: 15, paddingVertical: 8, fontSize: 16, marginVertical: 10 },
  categories: { flexDirection: "row", flexWrap: "wrap", marginVertical: 5 },
  categoryButton: { backgroundColor: "#222", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginRight: 10, marginBottom: 10 },
  categoryButtonActive: { backgroundColor: "#0f0" },
  categoryText: { color: "#fff", fontWeight: "600" },
  categoryTextActive: { color: "#000" },
  itemContainer: { backgroundColor: "#111", borderRadius: 10, marginBottom: 10, overflow: "hidden" },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 15, paddingVertical: 12 },
  itemTitle: { fontSize: 16, color: "#fff", fontWeight: "600" },
  itemToggle: { fontSize: 20, color: "#0f0" },
  itemDetailsContainer: { backgroundColor: "#222", paddingHorizontal: 15, paddingVertical: 10 },
  itemDetails: { color: "#ccc", fontSize: 14 },
  noResultsText: { color: "#aaa", fontStyle: "italic", paddingHorizontal: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10, color: "#fff" },
  txCard: { borderRadius: 12, padding: 12, marginBottom: 12 },
  txText: { color: "#fff", fontSize: 14, marginBottom: 4 },
});
