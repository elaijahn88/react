import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface Preferences {
  [productId: string]: number;
}

const initialProducts: Product[] = [
  { id: "1", name: "Nike Sneakers", price: 120, image: "https://xlijah.com/pics/sneaker.jpg" },
  { id: "2", name: "Apple Watch", price: 250, image: "https://xlijah.com/pics/apple_watch.jpg" },
  { id: "3", name: "Bluetooth Headphones", price: 80, image: "https://xlijah.com/pics/bluetooth.webp" },
  { id: "4", name: "Leather Bag", price: 150, image: "https://xlijah.com/pics/bag.webp" },
  { id: "5", name: "Sunglasses", price: 50, image: "https://xlijah.com/pics/sunglasses.jpg" },
];

export default function EmailLoginMarketplace() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({});
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Fetch user from Firestore by email
  const fetchUser = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userRef = doc(db, "users", email);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const userPrefs = data.preferences || {};
        setPreferences(userPrefs);

        // Load recommendations
        const recommended = await getRecommendedProducts(userPrefs);
        setProducts(recommended);

        setUserLoggedIn(true);
      } else {
        // If user doesn't exist, create a new document
        await setDoc(doc(db, "users", email), { preferences: {} });
        setPreferences({});
        setProducts(initialProducts);
        setUserLoggedIn(true);
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching user document.");
    } finally {
      setLoading(false);
    }
  };

  // Collaborative recommendation
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

      const combinedScores: { [id: string]: number } = {};
      initialProducts.forEach((p) => {
        combinedScores[p.id] = (userPrefs[p.id] || 0) + (allPrefs[p.id] || 0);
      });

      return [...initialProducts].sort(
        (a, b) => (combinedScores[b.id] || 0) - (combinedScores[a.id] || 0)
      );
    } catch (err) {
      console.error(err);
      return initialProducts;
    }
  };

  // Handle product click (update preferences in Firestore)
  const handleProductClick = async (product: Product) => {
    const newPrefs = { ...preferences };
    newPrefs[product.id] = (newPrefs[product.id] || 0) + 1;
    setPreferences(newPrefs);

    try {
      await setDoc(doc(db, "users", email), { preferences: newPrefs }, { merge: true });
      Alert.alert("Added!", `You clicked on ${product.name}`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update preferences");
    }
  };

  // If user is logged in, show Marketplace
  if (userLoggedIn) {
    return (
      <View style={styles.marketContainer}>
        <Text style={styles.marketTitle}>Welcome, {email}</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleProductClick(item)}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>${item.price}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // Updated concise + intuitive Login UI
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.loginCard}>
        <Text style={styles.loginTitle}>Welcome 👋</Text>
        <Text style={styles.loginSubtitle}>
          Sign in with your email to continue
        </Text>

        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={fetchUser}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f9fafc",
    padding: 20,
  },
  loginCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
    textAlign: "center",
  },
  loginSubtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#007aff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  error: {
    color: "#dc3545",
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
  marketContainer: { flex: 1, backgroundColor: "#f0f3f7" },
  marketTitle: { fontSize: 24, fontWeight: "700", margin: 16 },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  image: { width: 120, height: 120, borderRadius: 8 },
  name: { marginTop: 8, fontWeight: "600", fontSize: 16, textAlign: "center" },
  price: { marginTop: 4, fontWeight: "700", fontSize: 16, color: "#007aff" },
});
