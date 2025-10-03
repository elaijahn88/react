import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Alert,
  ActivityIndicator,
} from "react-native";
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  getDoc, 
  updateDoc,
  setDoc 
} from "firebase/firestore";
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

type UserInfo = {
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  profileImage?: string;
  joinedDate: string;
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
    { name: "Teachers Sacco", details: "Savings and credit cooperative for teachers." },
    { name: "Healthcare Sacco", details: "Serving healthcare professionals." },
  ],
  Microfinance: [{ name: "MicroCred", details: "Micro loans and financial inclusion services." }],
  "Credit Societies": [{ name: "Community Credit Union", details: "Credit union serving local communities." }],
};

export default function FinanceDashboard() {
  const [email, setEmail] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedFinanceCategory, setSelectedFinanceCategory] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [accountBalance, setAccountBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  const animMap = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Fetch user info from Firebase
  const fetchUserInfo = async (userEmail: string) => {
    if (!userEmail.trim()) return;
    
    setUserLoading(true);
    try {
      const userDocRef = doc(db, "users", userEmail);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserInfo;
        setUserInfo(data);
      } else {
        // Create default user profile if doesn't exist
        const defaultUserInfo: UserInfo = {
          name: userEmail.split('@')[0],
          email: userEmail,
          phone: "+256 XXX XXX XXX",
          accountNumber: `ACC${Math.random().toString().slice(2, 10)}`,
          joinedDate: new Date().toISOString(),
        };
        await setDoc(userDocRef, defaultUserInfo);
        setUserInfo(defaultUserInfo);
        Alert.alert("Welcome!", "New profile created for you.");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      Alert.alert("Error", "Failed to fetch user information");
    } finally {
      setUserLoading(false);
    }
  };

  // Update user info when email changes
  useEffect(() => {
    if (email.trim()) {
      fetchUserInfo(email);
    } else {
      setUserInfo(null);
      setTransactions([]);
      setAccountBalance(0);
    }
  }, [email]);

  // Fetch transactions in real-time
  useEffect(() => {
    if (!email.trim()) return;

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
            Animated.timing(animMap[tx.id], { 
              toValue: 0, 
              duration: 1500, 
              useNativeDriver: false 
            }),
          ]).start();
        }
      });

      setTransactions(
        txs.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
      );

      const balance = txs.reduce((acc, t) => acc + t.amount, 0);
      setAccountBalance(balance);
    });

    return () => {
      unsubscribe();
      Object.values(animMap).forEach(anim => anim.stopAnimation());
    };
  }, [email]);

  const updateUserProfile = async (field: keyof UserInfo, value: string) => {
    if (!email.trim() || !userInfo) return;
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", email);
      await updateDoc(userDocRef, { [field]: value });
      setUserInfo(prev => prev ? { ...prev, [field]: value } : null);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const sendMoney = async () => {
    if (!receiver?.trim() || !amount || !email?.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum === 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (amountNum < 0 && Math.abs(amountNum) > accountBalance) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }

    setLoading(true);
    const newTx: Transaction = {
      receiver: receiver.trim(),
      amount: amountNum,
      timestamp: new Date().toISOString(),
      type: amountNum >= 0 ? "income" : "expense",
      proof: `Receipt#${Math.floor(Math.random() * 10000)}`,
    };

    try {
      await addDoc(collection(db, "users", email, "transactions"), newTx);
      setReceiver("");
      setAmount("");
      Alert.alert("Success", "Transaction completed successfully");
    } catch (err) {
      console.error("Error adding transaction:", err);
      Alert.alert("Error", "Failed to complete transaction");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (name: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItem(expandedItem === name ? null : name);
  };

  const filteredFinanceItems = useMemo(() => {
    return (category: string) => {
      if (!searchText.trim()) return financeItems[category];
      return financeItems[category].filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    };
  }, [searchText]);

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const anim = animMap[item.id || ""] || new Animated.Value(0);
    
    const bgColor = anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        "#111", 
        item.type === "income" ? "#1a331a" : "#331a1a", 
        "#111"
      ],
    });

    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.02]
    });

    return (
      <Animated.View style={[
        styles.txCard, 
        { 
          backgroundColor: bgColor,
          transform: [{ scale }]
        }
      ]}>
        <Text style={styles.txText}>To: {item.receiver}</Text>
        <Text style={[
          styles.txAmount,
          item.type === "income" ? styles.incomeText : styles.expenseText
        ]}>
          {item.type === 'income' ? '+' : '-'} {Math.abs(item.amount).toLocaleString()} UGX
        </Text>
        <Text style={styles.txText}>
          {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
        {item.proof && <Text style={styles.txProof}>Proof: {item.proof}</Text>}
      </Animated.View>
    );
  };

  const FinanceItemComponent = React.memo(({ 
    item, 
    isExpanded, 
    onToggle 
  }: { 
    item: FinanceItem; 
    isExpanded: boolean; 
    onToggle: (name: string) => void;
  }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => onToggle(item.name)} style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemToggle}>{isExpanded ? "-" : "+"}</Text>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.itemDetailsContainer}>
          <Text style={styles.itemDetails}>{item.details}</Text>
        </View>
      )}
    </View>
  ));

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {userLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f0" />
          <Text style={styles.loadingText}>Loading user info...</Text>
        </View>
      ) : userInfo ? (
        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.profileCard}>
            <Text style={styles.profileLabel}>Name:</Text>
            <Text style={styles.profileValue}>{userInfo.name}</Text>
            <Text style={styles.profileLabel}>Phone:</Text>
            <Text style={styles.profileValue}>{userInfo.phone}</Text>
            <Text style={styles.profileLabel}>Account Number:</Text>
            <Text style={styles.profileValue}>{userInfo.accountNumber}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.sendMoneySection}>
        <Text style={styles.sectionTitle}>Send Money</Text>
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
            placeholder="Amount (negative for expense)"
            placeholderTextColor="#aaa"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity 
          style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
          onPress={sendMoney}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>
            {loading ? "Processing..." : "Send Money"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: accountBalance >= 0 ? "#0a0" : "#a00" }]}>
        <Text style={styles.summaryLabel}>Current Balance</Text>
        <Text style={styles.summaryAmount}>
          {accountBalance >= 0 ? '+' : ''}{accountBalance.toLocaleString()} UGX
        </Text>
      </View>

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
            style={[styles.categoryButton, selectedFinanceCategory === cat && styles.categoryButtonActive]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setSelectedFinanceCategory(selectedFinanceCategory === cat ? null : cat);
              setExpandedItem(null);
            }}
          >
            <Text style={[styles.categoryText, selectedFinanceCategory === cat && styles.categoryTextActive]}>
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
              <FinanceItemComponent
                key={item.name}
                item={item}
                isExpanded={expandedItem === item.name}
                onToggle={toggleItem}
              />
            ))
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>Transaction History ({transactions.length})</Text>
      {transactions.length === 0 ? (
        <Text style={styles.noTransactionsText}>
          No transactions yet. Send or receive money to see them here.
        </Text>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id || String(Math.random())}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#000" },
  input: { 
    backgroundColor: "#222", 
    color: "#fff", 
    borderRadius: 10, 
    padding: 12, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  sendButton: { 
    backgroundColor: "#25D366", 
    padding: 12, 
    borderRadius: 25, 
    alignItems: "center", 
    marginBottom: 15 
  },
  sendButtonDisabled: { backgroundColor: "#1a472a", opacity: 0.7 },
  sendButtonText: { color: "#121212", fontWeight: "bold", fontSize: 16 },
  summaryCard: { borderRadius: 12, padding: 20, alignItems: "center", marginBottom: 15,
    shadowColor: "#0f0", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5,
  },
  summaryLabel: { color: "#fff", fontSize: 16 },
  summaryAmount: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 5 },
  searchInput: { backgroundColor: "#222", color: "#fff", borderRadius: 10, paddingHorizontal: 15, paddingVertical: 8, fontSize: 16, marginVertical: 10, borderWidth: 1, borderColor: "#333" },
  categories: { flexDirection: "row", flexWrap: "wrap", marginVertical: 5 },
  categoryButton: { backgroundColor: "#222", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: "#333" },
  categoryButtonActive: { backgroundColor: "#0f0" },
  categoryText: { color: "#fff", fontWeight: "600" },
  categoryTextActive: { color: "#000" },
  itemContainer: { backgroundColor: "#111", borderRadius: 10, marginBottom: 10, overflow: "hidden", borderWidth: 1, borderColor: "#222" },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 15, paddingVertical: 12 },
  itemTitle: { fontSize: 16, color: "#fff", fontWeight: "600" },
  itemToggle: { fontSize: 20, color: "#0f0" },
  itemDetailsContainer: { backgroundColor: "#222", paddingHorizontal: 15, paddingVertical: 10 },
  itemDetails: { color: "#ccc", fontSize: 14 },
  noResultsText: { color: "#aaa", fontStyle: "italic", paddingHorizontal: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10, color: "#fff" },
  txCard: { borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#333" },
  txText: { color: "#fff", fontSize: 14, marginBottom: 4 },
  txAmount: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  incomeText: { color: "#0f0" },
  expenseText: { color: "#f00" },
  txProof: { color: "#aaa", fontSize: 12 },
  loadingContainer: { alignItems: "center", padding: 20, backgroundColor: "#111", borderRadius: 10, marginBottom: 15 },
  loadingText: { color: "#0f0", marginTop: 10 },
  noTransactionsText: { color: "#aaa", fontStyle: "italic", textAlign: "center", marginVertical: 20 },
  profileSection: { marginBottom: 15 },
  profileCard: { backgroundColor: "#111", borderRadius: 10, padding: 15, borderWidth: 1, borderColor: "#222" },
  profileLabel: { color: "#ccc", fontSize: 14 },
  profileValue: { color: "#fff", fontSize: 16, fontWeight: "600" },
  sendMoneySection: { marginBottom: 15 },
});
