import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  updateLink: string;
}

const initialProducts: Product[] = [
  { id: "1", name: "Nike Sneakers", price: 120, image: "https://xlijah.com/pics/sneaker.jpg", updateLink: "http://xlijah.com/pics/pics/mac.jpeg" },
  { id: "2", name: "Apple Watch", price: 250, image: "https://xlijah.com/pics/apple_watch.jpg", updateLink: "http://xlijah.com/pics/pics/lenovo.jpg" },
  { id: "3", name: "Bluetooth Headphones", price: 80, image: "https://xlijah.com/pics/bluetooth.webp", updateLink: "http://xlijah.com/pics/pics/chemicals.jpeg" },
  { id: "4", name: "Leather Bag", price: 150, image: "https://xlijah.com/pics/bag.webp", updateLink: "http://xlijah.com/pics/pics/guns.jpeg" },
  { id: "5", name: "Sunglasses", price: 50, image: "https://xlijah.com/pics/sunglasses.jpg", updateLink: "http://xlijah.com/pics/pics/macbook.jpg" },
  { id: "6", name: "iPhone 12", price: 999, image: "https://xlijah.com/pics/iphone.jpg", updateLink: "http://xlijah.com/pics/pics/notebook.jpeg" },
  { id: "7", name: "MacBook Pro", price: 2400, image: "https://xlijah.com/pics/pics/chemicals.jpeg", updateLink: "http://xlijah.com/pics/pics/mac.jpeg" },
  { id: "8", name: "lenovo", price: 1200, image: "https://xlijah.com/pics/pics/lenovo.jpg", updateLink: "http://xlijah.com/pics/pics/lenovo.jpg" },
  { id: "9", name: "pistol Charge", price: 130, image: "https://xlijah.com/pics/pics/guns.jpeg", updateLink: "http://xlijah.com/pics/pics/chemicals.jpeg" },
  { id: "10", name: "Applewatch", price: 700, image: "https://xlijah.com/pics/apple_watch.jpg", updateLink: "http://xlijah.com/pics/pics/guns.jpeg" },
];

interface Transaction {
  productId: string;
  timestamp: string;
  cardInfo: string;
}

export default function Products() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [cardInfo, setCardInfo] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savedCardInfo, setSavedCardInfo] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) {
        setProducts(initialProducts);
        setSavedCardInfo("");
        setTransactions([]);
        return;
      }

      setLoading(true);
      try {
        const userRef = doc(db, "users", userEmail);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProducts(initialProducts);

          // Load saved card info if exists
          if (userData.cardInfo) {
            setSavedCardInfo(userData.cardInfo);
            setCardInfo(userData.cardInfo);
          } else {
            setSavedCardInfo("");
            setCardInfo("");
          }

          // Load transactions if exist
          if (userData.transactions) {
            setTransactions(userData.transactions);
          } else {
            setTransactions([]);
          }
        } else {
          setProducts(initialProducts);
          setSavedCardInfo("");
          setTransactions([]);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setProducts(initialProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userEmail]);

  const handlePay = (productId: string) => {
    setActiveCardId(productId);
    setTimeout(() => setActiveCardId(null), 60000); // Hide after 1 min
  };

  const handleAddCard = async (productId: string) => {
    if (!userEmail || !cardInfo.trim()) {
      Alert.alert("Error", "Email or card info cannot be empty.");
      return;
    }

    try {
      const userRef = doc(db, "users", userEmail);
      const newTransaction: Transaction = {
        productId,
        timestamp: new Date().toISOString(),
        cardInfo,
      };

      await updateDoc(userRef, {
        cardInfo,
        transactions: arrayUnion(newTransaction),
      });

      setTransactions((prev) => [...prev, newTransaction]);
      setActiveCardId(null);
      setSavedCardInfo(cardInfo);
      Alert.alert("Success", "Payment info saved!");
    } catch (err) {
      console.error("Error updating card info:", err);
      Alert.alert("Error", "Failed to save card info to DB.");
    }
  };

  const getTransactionsForProduct = (productId: string) => {
    return transactions.filter((tx) => tx.productId === productId);
  };

  const renderItem = ({ item }: { item: Product }) => {
    const productTransactions = getTransactionsForProduct(item.id);

    return (
      <View style={styles.productCard}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>

        <TouchableOpacity style={styles.payButton} onPress={() => handlePay(item.id)}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Pay</Text>
        </TouchableOpacity>

        {activeCardId === item.id && (
          <View style={styles.addCard}>
            <TextInput
              style={styles.addInput}
              placeholder="Enter card info..."
              value={cardInfo}
              onChangeText={setCardInfo}
            />
            <TouchableOpacity style={styles.submitButton} onPress={() => handleAddCard(item.id)}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}

        {savedCardInfo ? (
          <Text style={{ color: "#ccc", marginTop: 6 }}>Saved Card Info: {savedCardInfo}</Text>
        ) : null}

        {productTransactions.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Previous Transactions:</Text>
            {productTransactions.map((tx, idx) => (
              <Text key={idx} style={{ color: "#ccc" }}>
                {tx.timestamp} | Card: ****{tx.cardInfo.slice(-4)}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        style={styles.emailInput}
        placeholder="Enter your email"
        value={userEmail}
        onChangeText={setUserEmail}
        autoCapitalize="none"
      />

      {loading && <ActivityIndicator size="large" color="#25D366" />}
      {!loading && (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emailInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  productCard: {
    backgroundColor: "#1f1f1f",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  productName: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  productPrice: { fontSize: 16, marginVertical: 6, color: "#ccc" },
  payButton: {
    backgroundColor: "#25D366",
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 6,
  },
  addCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#4a90e2",
  },
  addInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#25D366",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
});
