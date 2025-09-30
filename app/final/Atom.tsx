import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../firebase"; // Adjust path
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  updateLink: string;
}

interface Preferences {
  [productId: string]: number;
}

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

const USER_EMAIL = "elajahn8@gmail.com"; // default user document

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [preferences, setPreferences] = useState<Preferences>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Load user preferences from Firestore
  const loadPreferences = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", USER_EMAIL);
      const userSnap = await getDoc(userRef);

      let userPrefs: Preferences = {};
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.preferences) {
          userPrefs = data.preferences;
        }
      }
      setPreferences(userPrefs);

      // Compute recommendations
      const recommendedProducts = await getRecommendedProducts(userPrefs);
      setProducts(recommendedProducts);
    } catch (err) {
      console.error("Error loading preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users preferences for collaborative recommendation
  const getRecommendedProducts = async (userPrefs: Preferences) => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const allPrefs: { [productId: string]: number } = {};

      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.preferences) {
          for (const [pid, clicks] of Object.entries(data.preferences)) {
            allPrefs[pid] = (allPrefs[pid] || 0) + (clicks as number);
          }
        }
      });

      // Combine with current user preferences
      const combinedScores: { [id: string]: number } = {};
      initialProducts.forEach((p) => {
        combinedScores[p.id] = (userPrefs[p.id] || 0) + (allPrefs[p.id] || 0);
      });

      // Sort products by score descending
      return [...initialProducts].sort(
        (a, b) => (combinedScores[b.id] || 0) - (combinedScores[a.id] || 0)
      );
    } catch (err) {
      console.error(err);
      return initialProducts;
    }
  };

  // Handle product click
  const handleClick = async (product: Product) => {
    const newPrefs = { ...preferences };
    newPrefs[product.id] = (newPrefs[product.id] || 0) + 1;

    setPreferences(newPrefs);

    // Update Firestore
    try {
      const userRef = doc(db, "users", USER_EMAIL);
      await setDoc(userRef, { preferences: newPrefs }, { merge: true });
    } catch (err) {
      console.error("Error updating preferences:", err);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1, marginTop: 50 }} size="large" color="#25D366" />;

  return (
    <View style={{ flex: 1, padding: 15, backgroundColor: "#121212" }}>
      <Text style={{ fontSize: 20, color: "#fff", fontWeight: "bold", marginBottom: 15 }}>
        Recommended Products
      </Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ marginBottom: 15, backgroundColor: "#1f1f1f", borderRadius: 12, padding: 10 }}
            onPress={() => handleClick(item)}
          >
            <Image source={{ uri: item.image }} style={{ height: 120, borderRadius: 10 }} resizeMode="cover" />
            <Text style={{ color: "#fff", fontWeight: "bold", marginTop: 8 }}>{item.name}</Text>
            <Text style={{ color: "#ccc" }}>${item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
