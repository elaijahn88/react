import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  updateLink: string;
}

// Initial products if user email not set
const initialProducts: Product[] = [
  { id: "1", name: "Nike Sneakers", price: 120, image: "https://xlijah.com/pics/sneaker.jpg", updateLink: "http://xlijah.com/pics/pics/mac.jpeg" },
  { id: "2", name: "Apple Watch", price: 250, image: "https://xlijah.com/pics/apple_watch.jpg", updateLink: "http://xlijah.com/pics/pics/lenovo.jpg" },
  { id: "3", name: "Bluetooth Headphones", price: 80, image: "https://xlijah.com/pics/bluetooth.webp", updateLink: "http://xlijah.com/pics/pics/chemicals.jpeg" },
  { id: "4", name: "Leather Bag", price: 150, image: "https://xlijah.com/pics/bag.webp", updateLink: "http://xlijah.com/pics/pics/guns.jpeg" },
  { id: "5", name: "Sunglasses", price: 50, image: "https://xlijah.com/pics/sunglasses.jpg", updateLink: "http://xlijah.com/pics/pics/macbook.jpg" },
  { id: "6", name: "iPhone 12", price: 999, image: "https://xlijah.com/pics/iphone.jpg", updateLink: "http://xlijah.com/pics/pics/notebook.jpeg" },
  { id: "7", name: "MacBook Pro", price: 2400, image: "https://xlijah.com/pics/pics/chemicals.jpeg", updateLink: "http://xlijah.com/pics/pics/mac.jpeg" },
  { id: "8", name: "Canon DSLR", price: 1200, image: "https://xlijah.com/pics/pics/lenovo.jpg", updateLink: "http://xlijah.com/pics/pics/lenovo.jpg" },
  { id: "9", name: "Fitbit Charge", price: 130, image: "https://xlijah.com/pics/pics/guns.jpeg", updateLink: "http://xlijah.com/pics/pics/chemicals.jpeg" },
  { id: "10", name: "Google Pixel", price: 700, image: "https://xlijah.com/pics/apple_watch.jpg", updateLink: "http://xlijah.com/pics/pics/guns.jpeg" },
];

export default function ShopScreen() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [preferences, setPreferences] = useState<{ [key: string]: number }>({});
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");

  const [personalStoreNIN, setPersonalStoreNIN] = useState("");

  // Fetch user info from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) return;
      try {
        const userRef = doc(db, "users", userEmail);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserInfo(data);
          if (data.preferences) setPreferences(data.preferences);
          if (data.cardNumber) setCardNumber(data.cardNumber);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    fetchUserData();
  }, [userEmail]);

  // Load preferences from AsyncStorage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem("user_preferences");
        if (stored) setPreferences(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to load preferences:", err);
      }
    };
    loadPreferences();
  }, []);

  const handleProductClick = async (productId: string) => {
    const updatedPrefs = { ...preferences, [productId]: (preferences[productId] || 0) + 1 };
    setPreferences(updatedPrefs);
    await AsyncStorage.setItem("user_preferences", JSON.stringify(updatedPrefs));

    if (userEmail) {
      try {
        const userRef = doc(db, "users", userEmail);
        await setDoc(userRef, { preferences: updatedPrefs }, { merge: true });
      } catch (err) {
        console.error("Failed to update Firestore preferences:", err);
      }
    }
    Alert.alert("Product Clicked", `You clicked product ${productId}`);
  };

  const handlePay = () => {
    setShowAddCard(true);
    setTimeout(() => setShowAddCard(false), 60000); // hide after 1 min
  };

  const saveCard = async () => {
    if (!cardNumber) return;
    if (!userEmail) return Alert.alert("Set user email first!");
    try {
      const userRef = doc(db, "users", userEmail);
      await setDoc(userRef, { cardNumber }, { merge: true });
      Alert.alert("Card saved!");
      setShowAddCard(false);
    } catch (err) {
      console.error(err);
    }
  };

  const applyForPersonalStore = async () => {
    if (!userEmail || !personalStoreNIN) return Alert.alert("Set email & NIN first!");
    try {
      const userRef = doc(db, "personalStores", userEmail);
      await setDoc(userRef, {
        nin: personalStoreNIN,
        status: "pending",
        requestedAt: new Date().toISOString(),
      });
      Alert.alert("Application submitted!");
    } catch (err) {
      console.error(err);
    }
  };

  // Sort products by preference clicks
  const sortedProducts = [...products].sort((a, b) => (preferences[b.id] || 0) - (preferences[a.id] || 0));

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>User Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={userEmail}
        onChangeText={setUserEmail}
      />

      <Text style={{ fontSize: 22, fontWeight: "bold", marginVertical: 12 }}>Products</Text>

      <FlatList
        data={sortedProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard} onPress={() => handleProductClick(item.id)}>
            <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
            <Text>Price: ${item.price}</Text>
            {preferences[item.id] && <Text>Clicks: {preferences[item.id]}</Text>}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.payButton} onPress={handlePay}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Pay</Text>
      </TouchableOpacity>

      {showAddCard && (
        <View style={styles.addCard}>
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            value={cardNumber}
            onChangeText={setCardNumber}
          />
          <TouchableOpacity style={styles.payButton} onPress={saveCard}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Save Card</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Open Personal Store</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter National ID (NIN)"
          value={personalStoreNIN}
          onChangeText={setPersonalStoreNIN}
        />
        <TouchableOpacity style={styles.payButton} onPress={applyForPersonalStore}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
  },
  productCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    marginBottom: 10,
  },
  payButton: {
    backgroundColor: "#25D366",
    padding: 14,
    borderRadius: 25,
    marginTop: 12,
    alignItems: "center",
  },
  addCard: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#25D366",
    borderRadius: 12,
  },
});
