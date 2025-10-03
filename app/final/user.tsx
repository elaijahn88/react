import React, { useState } from "react";
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
  Modal,
  ScrollView,
  Animated,
} from "react-native";
import { doc, getDoc, setDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Preferences {
  [productId: string]: number;
}

const initialProducts: Product[] = [
  { id: "1", name: "Nike Air Max", price: 120, image: "https://xlijah.com/pics/sneaker.jpg", description: "Comfortable running shoes with advanced cushioning", category: "Footwear" },
  { id: "2", name: "Apple Watch Series 9", price: 250, image: "https://xlijah.com/pics/apple_watch.jpg", description: "Smartwatch with health monitoring and fitness tracking", category: "Electronics" },
  { id: "3", name: "Sony WH-1000XM5", price: 80, image: "https://xlijah.com/pics/bluetooth.webp", description: "Noise-canceling wireless headphones", category: "Electronics" },
  { id: "4", name: "Leather Messenger Bag", price: 150, image: "https://xlijah.com/pics/bag.webp", description: "Genuine leather bag for professionals", category: "Accessories" },
  { id: "5", name: "Ray-Ban Aviator", price: 50, image: "https://xlijah.com/pics/sunglasses.jpg", description: "Classic aviator sunglasses with UV protection", category: "Accessories" },
  { id: "6", name: "MacBook Pro 14\"", price: 1999, image: "https://xlijah.com/pics/macbook.jpg", description: "Powerful laptop for professionals and creatives", category: "Electronics" },
];

export default function EnhancedMarketplace() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({});
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const cartAnimation = useState(new Animated.Value(0))[0];
  const categories = ["All", ...Array.from(new Set(initialProducts.map(p => p.category)))];

  // --- Firestore: fetch user ---
  const fetchUser = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email.");
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
        const recommended = await getRecommendedProducts(userPrefs);
        setProducts(recommended);
        setUserLoggedIn(true);
      } else {
        await setDoc(doc(db, "users", email), {
          preferences: {},
          createdAt: new Date().toISOString(),
          email: email
        });
        setPreferences({});
        setProducts(initialProducts);
        setUserLoggedIn(true);
      }
    } catch (err) {
      console.error(err);
      setError("Error accessing your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Recommendation system ---
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

      return [...initialProducts].sort((a, b) => (combinedScores[b.id] || 0) - (combinedScores[a.id] || 0));
    } catch (err) {
      console.error(err);
      return initialProducts;
    }
  };

  const handleProductClick = async (product: Product) => {
    const newPrefs = { ...preferences, [product.id]: (preferences[product.id] || 0) + 1 };
    setPreferences(newPrefs);

    try {
      await setDoc(doc(db, "users", email), { preferences: newPrefs }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  // --- Cart management ---
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) return prevCart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prevCart, { product, quantity: 1 }];
    });

    Animated.sequence([
      Animated.timing(cartAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(cartAnimation, { toValue: 0, duration: 200, useNativeDriver: true })
    ]).start();

    Alert.alert("Added to Cart", `${product.name} added!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const getTotalPrice = () => cart.reduce((t, item) => t + item.product.price * item.quantity, 0);
  const getTotalItems = () => cart.reduce((t, item) => t + item.quantity, 0);

  const filteredProducts = products.filter(p => {
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory === "All" || p.category === selectedCategory;
    return searchMatch && categoryMatch;
  });

  const handlePayment = async () => {
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 2000));
      const userRef = doc(db, "users", email);
      await updateDoc(userRef, {
        purchases: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          purchasedAt: new Date().toISOString()
        }))
      });
      Alert.alert("Payment Successful", `Total: $${getTotalPrice().toLocaleString()}`, [
        { text: "OK", onPress: () => { setCart([]); setShowPayment(false); setShowCart(false); } }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Payment Failed", "Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const cartScale = cartAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });

  // --- UI ---
  if (userLoggedIn) {
    return (
      <View style={styles.marketContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>
          <TouchableOpacity style={styles.cartButton} onPress={() => setShowCart(true)}>
            <Animated.View style={{ transform: [{ scale: cartScale }] }}>
              <Ionicons name="cart" size={24} color="#007AFF" />
            </Animated.View>
            {getTotalItems() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products */}
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productCard} onPress={() => handleProductClick(item)}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>${item.price}</Text>
                <TouchableOpacity style={styles.addToCartBtn} onPress={() => addToCart(item)}>
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Cart Modal */}
        <Modal visible={showCart} animationType="slide">
          <View style={styles.cartModal}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Your Cart</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}><Ionicons name="close" size={24} color="#000" /></TouchableOpacity>
            </View>
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <Ionicons name="cart-outline" size={64} color="#ccc" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={cart}
                  keyExtractor={item => item.product.id}
                  renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                      <Image source={{ uri: item.product.image }} style={styles.cartItemImage} />
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{item.product.name}</Text>
                        <Text style={styles.cartItemPrice}>${item.product.price}</Text>
                      </View>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity style={styles.quantityBtn} onPress={() => updateQuantity(item.product.id, item.quantity - 1)}>
                          <Ionicons name="remove" size={16} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.quantityBtn} onPress={() => updateQuantity(item.product.id, item.quantity + 1)}>
                          <Ionicons name="add" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
                <View style={styles.cartFooter}>
                  <Text style={styles.totalText}>Total: ${getTotalPrice().toLocaleString()}</Text>
                  <TouchableOpacity style={styles.checkoutButton} onPress={() => { setShowCart(false); setShowPayment(true); }}>
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Modal>

        {/* Payment Modal */}
        <Modal visible={showPayment} animationType="slide">
          <View style={styles.paymentModal}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentTitle}>Checkout</Text>
              <TouchableOpacity onPress={() => setShowPayment(false)}><Ionicons name="close" size={24} color="#000" /></TouchableOpacity>
            </View>
            <ScrollView style={styles.paymentContent}>
              {cart.map(item => (
                <View key={item.product.id} style={styles.orderItem}>
                  <Text style={styles.orderItemName}>{item.product.name} x {item.quantity}</Text>
                  <Text style={styles.orderItemPrice}>${(item.product.price * item.quantity).toLocaleString()}</Text>
                </View>
              ))}
              <Text style={styles.paymentTotalText}>Total: ${getTotalPrice().toLocaleString()}</Text>
              <TouchableOpacity style={[styles.payButton, loading && styles.payButtonDisabled]} onPress={handlePayment} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payButtonText}>Pay Now</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }

  // --- Login Screen ---
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
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
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={fetchUser} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: "#f8fafc", padding: 20 },
  loginCard: { backgroundColor: "#fff", borderRadius: 20, padding: 32, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 10 }, shadowRadius: 20, elevation: 5 },
  loginTitle: { fontSize: 28, fontWeight: "700", color: "#1a1a1a", textAlign: "center", marginVertical: 12 },
  input: { borderWidth: 1, borderColor: "#e1e5e9", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 20, backgroundColor: "#fafbfc" },
  button: { backgroundColor: "#007AFF", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  error: { color: "#ff3b30", marginTop: 16, fontSize: 14, textAlign: "center" },
  marketContainer: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: "#fff" },
  welcomeText: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  emailText: { fontSize: 14, color: "#666", marginTop: 4 },
  cartButton: { padding: 8, position: "relative" },
  cartBadge: { position: "absolute", top: -4, right: -4, backgroundColor: "#ff3b30", borderRadius: 8, paddingHorizontal: 4, paddingVertical: 2 },
  cartBadgeText: { color: "#fff", fontSize: 12 },
  searchContainer: { flexDirection: "row", alignItems: "center", margin: 20, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  categoriesContainer: { flexDirection: "row", paddingHorizontal: 12 },
  categoryButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#fff", borderRadius: 20, marginRight: 10 },
  categoryButtonActive: { backgroundColor: "#007AFF" },
  categoryText: { color: "#333" },
  categoryTextActive: { color: "#fff" },
  productsGrid: { paddingHorizontal: 12, paddingBottom: 100 },
  productCard: { backgroundColor: "#fff", flex: 1, margin: 8, borderRadius: 16, padding: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  productImage: { width: "100%", height: 120, borderRadius: 12, marginBottom: 8 },
  productName: { fontWeight: "600", fontSize: 16, marginBottom: 4 },
  productDescription: { fontSize: 12, color: "#666" },
  productFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  productPrice: { fontWeight: "600", fontSize: 14 },
  addToCartBtn: { backgroundColor: "#007AFF", padding: 6, borderRadius: 8 },
  cartModal: { flex: 1, backgroundColor: "#f8fafc", paddingTop: 60, paddingHorizontal: 20 },
  cartHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  cartTitle: { fontSize: 24, fontWeight: "700" },
  emptyCart: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyCartText: { fontSize: 16, color: "#666", marginTop: 12 },
  cartItem: { flexDirection: "row", alignItems: "center", marginBottom: 16, backgroundColor: "#fff", borderRadius: 12, padding: 12 },
  cartItemImage: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontWeight: "600", fontSize: 16 },
  cartItemPrice: { fontSize: 14, color: "#666", marginTop: 4 },
  quantityControls: { flexDirection: "row", alignItems: "center" },
  quantityBtn: { backgroundColor: "#007AFF", padding: 6, borderRadius: 8 },
  quantityText: { marginHorizontal: 8, fontSize: 16 },
  cartFooter: { paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#e5e7eb", alignItems: "center" },
  totalText: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  checkoutButton: { backgroundColor: "#007AFF", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  checkoutButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  paymentModal: { flex: 1, backgroundColor: "#f8fafc", paddingTop: 60, paddingHorizontal: 20 },
  paymentHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  paymentTitle: { fontSize: 24, fontWeight: "700" },
  paymentContent: {},
  orderItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  orderItemName: { fontSize: 16 },
  orderItemPrice: { fontSize: 16, fontWeight: "600" },
  paymentTotalText: { fontSize: 18, fontWeight: "700", marginVertical: 20, textAlign: "center" },
  payButton: { backgroundColor: "#007AFF", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 40 },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
