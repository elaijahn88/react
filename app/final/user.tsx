import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Marketplace() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<any[]>([]);

  // Example categories + products
  const categories = ["All", "Electronics", "Fashion", "Home", "Sports"];
  const products = [
    { id: "1", name: "Smartphone", price: 599, category: "Electronics", image: "https://via.placeholder.com/150" },
    { id: "2", name: "Sneakers", price: 120, category: "Fashion", image: "https://via.placeholder.com/150" },
    { id: "3", name: "Sofa", price: 800, category: "Home", image: "https://via.placeholder.com/150" },
    { id: "4", name: "Football", price: 25, category: "Sports", image: "https://via.placeholder.com/150" },
  ];

  const addToCart = (item: any) => setCart([...cart, item]);
  const getTotalItems = () => cart.length;

  const fetchUser = () => {
    setLoading(true);
    setTimeout(() => {
      if (email.includes("@")) {
        setUserLoggedIn(true);
        setError("");
      } else {
        setError("Invalid email address");
      }
      setLoading(false);
    }, 1000);
  };

  // --- Scroll animations ---
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [70, 50], // shrink height
    extrapolate: "clamp",
  });

  const headerFontSize = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [18, 15], // shrink welcome text
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const barScale = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.92],
    extrapolate: "clamp",
  });

  const barOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.85],
    extrapolate: "clamp",
  });

  // --- LOGIN SCREEN ---
  if (!userLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.loginCard}>
            <Ionicons name="storefront" size={48} color="#007AFF" style={{ alignSelf: "center" }} />
            <Text style={styles.loginTitle}>Marketplace</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={fetchUser}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
            </TouchableOpacity>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // --- MARKETPLACE SCREEN ---
  return (
    <SafeAreaView style={styles.marketContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Animated Sticky Header */}
      <Animated.View
        style={[
          styles.header,
          { height: headerHeight, opacity: headerOpacity },
        ]}
      >
        <View>
          <Animated.Text style={[styles.welcomeText, { fontSize: headerFontSize }]}>
            Welcome back!
          </Animated.Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={() => setShowCart(true)}>
          <Ionicons name="cart" size={24} color="#007AFF" />
          {getTotalItems() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Animated Sticky Categories Bar */}
      <Animated.View
        style={[
          styles.categoriesBar,
          {
            transform: [{ scale: barScale }],
            opacity: barOpacity,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Scrollable Products */}
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false } // height/fontSize need layout updates
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.products}>
          {products
            .filter((item) => selectedCategory === "All" || item.category === selectedCategory)
            .map((item) => (
              <View key={item.id} style={styles.productCard}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>${item.price}</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loginCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginTitle: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginVertical: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 15 },
  button: { backgroundColor: "#007AFF", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  error: { marginTop: 8, color: "red", textAlign: "center" },

  marketContainer: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 20,
  },
  welcomeText: { fontWeight: "600", color: "#111" },
  emailText: { fontSize: 14, color: "#555" },
  cartButton: { position: "relative", padding: 6 },
  cartBadge: {
    position: "absolute",
    right: 0,
    top: -2,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cartBadgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  categoriesBar: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 15,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f1f5f9",
  },
  categoryButtonActive: { backgroundColor: "#007AFF" },
  categoryText: { fontSize: 14, color: "#333" },
  categoryTextActive: { color: "#fff", fontWeight: "600" },

  products: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", padding: 10 },
  productCard: {
    width: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: { width: "100%", height: 120, borderRadius: 8, marginBottom: 10 },
  productName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  productPrice: { fontSize: 14, color: "#007AFF", marginBottom: 8 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 6,
  },
  addButtonText: { color: "#fff", marginLeft: 4, fontSize: 14, fontWeight: "600" },
};
