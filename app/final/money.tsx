import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Image,
  StyleSheet,
} from "react-native";
import Video from "react-native-video";
import { db } from "../firebase";
import {
  doc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
} from "firebase/firestore";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Transaction = {
  id?: string;
  receiver?: string;
  amount: string | number;
  timestamp: string;
  proof?: string;
  title?: string;
  type?: "income" | "expense";
  date?: string;
};

const financeItems = {
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

export default function FinanceApp() {
  const [email, setEmail] = useState("");
  const [fetchedEmail, setFetchedEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userAccount, setUserAccount] = useState<number>(0);
  const [userAge, setUserAge] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [selectedFinanceCategory, setSelectedFinanceCategory] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [visibleSections, setVisibleSections] = useState({
    video: true,
    accountSummary: true,
    quickActions: true,
    transactions: true,
  });

  // 🔹 Fetch user and listen to transactions in real-time
  const fetchUserData = async (emailInput: string) => {
    if (!emailInput) return;
    setFetchedEmail(emailInput);
    const userRef = doc(db, "users", emailInput);

    // Listen to user document
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserName(data.name || "");
        setUserAccount(data.account || 0);
        setUserAge(data.age || 0);
      } else {
        setUserName("");
        setUserAccount(0);
        setUserAge(0);
      }
    });

    // Listen to transactions subcollection
    const txCol = collection(db, "users", emailInput, "transactions");
    const txQuery = query(txCol, orderBy("timestamp", "desc"));
    const unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
      const txList: Transaction[] = [];
      snapshot.forEach((doc) => txList.push(doc.data() as Transaction));
      setTransactions(txList);
    });

    return () => {
      unsubscribeUser();
      unsubscribeTx();
    };
  };

  // 🔹 Send money (auto syncs)
  const sendMoney = async () => {
    if (!receiver || !amount || !fetchedEmail) return;
    const newTx: Transaction = {
      receiver,
      amount,
      timestamp: new Date().toISOString(),
      proof: `Receipt#${Math.floor(Math.random() * 10000)}`,
    };
    try {
      const txCol = collection(db, "users", fetchedEmail, "transactions");
      await addDoc(txCol, newTx);
      setReceiver("");
      setAmount("");
    } catch (err) {
      console.error("Error sending money:", err);
    }
  };

  const toggleSection = (key: keyof typeof visibleSections) => {
    setVisibleSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onItemPress = (itemName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItem(expandedItem === itemName ? null : itemName);
  };

  const filteredFinanceItems = (category: string) => {
    if (!searchText.trim()) return financeItems[category];
    return financeItems[category].filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* 🔹 Email input */}
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
      <TouchableOpacity style={styles.goButton} onPress={() => fetchUserData(email)}>
        <Text style={styles.goButtonText}>Go</Text>
      </TouchableOpacity>

      {/* 🔹 User info & send money */}
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

          {/* 🔹 Real-time transaction history */}
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {transactions.length > 0 ? (
            transactions.map((tx, idx) => (
              <View key={idx} style={styles.txCard}>
                <Text style={styles.txText}>To: {tx.receiver || tx.title}</Text>
                <Text style={styles.txText}>Amount: {tx.amount}</Text>
                <Text style={styles.txText}>Time: {tx.timestamp || tx.date}</Text>
                <Text style={styles.txText}>Proof: {tx.proof || "-"}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noTx}>No transactions yet.</Text>
          )}
        </>
      ) : null}

      {/* 🔹 Finance Dashboard */}
      <View style={styles.topMenu}>
        <TouchableOpacity
          style={[styles.menuButton, selectedMenu === "Finance" && styles.menuButtonActive]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setSelectedMenu(selectedMenu === "Finance" ? null : "Finance");
            setSelectedFinanceCategory(null);
            setExpandedItem(null);
            setSearchText("");
          }}
        >
          <Text style={styles.menuButtonText}>Finance</Text>
        </TouchableOpacity>
      </View>

      {selectedMenu === "Finance" && (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Banks, Sacco, etc..."
            placeholderTextColor="#aaa"
            value={searchText}
            onChangeText={setSearchText}
          />
          <View style={styles.categories}>
            {Object.keys(financeItems).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedFinanceCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setSelectedFinanceCategory(selectedFinanceCategory === category ? null : category);
                  setExpandedItem(null);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedFinanceCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedFinanceCategory &&
            filteredFinanceItems(selectedFinanceCategory).map((item) => (
              <View key={item.name} style={styles.itemContainer}>
                <TouchableOpacity onPress={() => onItemPress(item.name)} style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemToggle}>{expandedItem === item.name ? "-" : "+"}</Text>
                </TouchableOpacity>
                {expandedItem === item.name && (
                  <View style={styles.itemDetailsContainer}>
                    <Text style={styles.itemDetails}>{item.details}</Text>
                  </View>
                )}
              </View>
            ))}
        </>
      )}

      {/* 🔹 Video Section */}
      {visibleSections.video && (
        <>
          <Text style={styles.sectionTitle}>Economy</Text>
          <Video
            source={{ uri: "https://xlijah.com/ai.mp4" }}
            style={styles.video}
            controls={false}
            paused={false}
            resizeMode="contain"
            repeat={true}
            ignoreSilentSwitch="ignore"
            onError={(e) => console.log("Video error:", e)}
          />
        </>
      )}
    </ScrollView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#000" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10, color: "#fff" },
  sectionSubtitle: { fontSize: 16, fontWeight: "500", color: "#ccc", marginBottom: 10 },
  input: { width: "100%", backgroundColor: "#2a2a2a", color: "#fff", borderRadius: 10, padding: 12, marginBottom: 12 },
  goButton: { backgroundColor: "#007bff", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, marginBottom: 15, alignItems: "center" },
  goButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  sendButton: { backgroundColor: "#25D366", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, marginTop: 5 },
  sendButtonText: { color: "#121212", fontWeight: "bold", fontSize: 16 },
  card: { backgroundColor: "#1f1f1f", borderRadius: 15, padding: 15, marginBottom: 20, alignItems: "center" },
  txCard: { backgroundColor: "#1f1f1f", borderRadius: 12, padding: 12, marginBottom: 12 },
  txText: { color: "#fff", fontSize: 14, marginBottom: 4 },
  noTx: { color: "#aaa", textAlign: "center", marginVertical: 10 },

  topMenu: { flexDirection: "row", marginBottom: 15 },
  menuButton: { backgroundColor: "#222", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, marginRight: 10 },
  menuButtonActive: { backgroundColor: "#0f0" },
  menuButtonText: { color: "#fff", fontWeight: "bold" },

  searchInput: { backgroundColor: "#222", color: "#fff", borderRadius: 10, paddingHorizontal: 15, paddingVertical: 8, fontSize: 16, marginBottom: 10 },
  categories: { flexDirection: "row", flexWrap: "wrap" },
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
  video: { width: width - 30, height: 200, marginBottom: 15, borderRadius: 12 },
});
