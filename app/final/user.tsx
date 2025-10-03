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
  { 
    id: "1", 
    name: "Nike Air Max", 
    price: 120, 
    image: "https://xlijah.com/pics/sneaker.jpg",
    description: "Comfortable running shoes with advanced cushioning",
    category: "Footwear"
  },
  { 
    id: "2", 
    name: "Apple Watch Series 9", 
    price: 250, 
    image: "https://xlijah.com/pics/apple_watch.jpg",
    description: "Smartwatch with health monitoring and fitness tracking",
    category: "Electronics"
  },
  { 
    id: "3", 
    name: "Sony WH-1000XM5", 
    price: 80, 
    image: "https://xlijah.com/pics/bluetooth.webp",
    description: "Noise-canceling wireless headphones",
    category: "Electronics"
  },
  { 
    id: "4", 
    name: "Leather Messenger Bag", 
    price: 150, 
    image: "https://xlijah.com/pics/bag.webp",
    description: "Genuine leather bag for professionals",
    category: "Accessories"
  },
  { 
    id: "5", 
    name: "Ray-Ban Aviator", 
    price: 50, 
    image: "https://xlijah.com/pics/sunglasses.jpg",
    description: "Classic aviator sunglasses with UV protection",
    category: "Accessories"
  },
  { 
    id: "6", 
    name: "MacBook Pro 14\"", 
    price: 1999, 
    image: "https://xlijah.com/pics/macbook.jpg",
    description: "Powerful laptop for professionals and creatives",
    category: "Electronics"
  },
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const cartAnimation = useState(new Animated.Value(0))[0];
  const categories = ["All", ...new Set(initialProducts.map(p => p.category))];

  // Fetch user from Firestore by email
  const fetchUser = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    if (!email.includes('@')) {
      setError("Please enter a valid email address.");
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
    } catch (err) {
      console.error(err);
    }
  };

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });

    // Animate cart icon
    Animated.sequence([
      Animated.timing(cartAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cartAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Alert.alert("Added to Cart", `${product.name} added to your cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user's purchase history
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

      Alert.alert(
        "Payment Successful!",
        `Thank you for your purchase of $${getTotalPrice().toLocaleString()}`,
        [{ text: "OK", onPress: () => {
          setCart([]);
          setShowPayment(false);
          setShowCart(false);
        }}]
      );
    } catch (error) {
      Alert.alert("Payment Failed", "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const cartScale = cartAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2]
  });

  // If user is logged in, show Marketplace
  if (userLoggedIn) {
    return (
      <View style={styles.marketContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => setShowCart(true)}
          >
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

        {/* Search Bar */}
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
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => {
                handleProductClick(item);
                setSelectedProduct(item);
              }}
            >
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>${item.price}</Text>
                  <TouchableOpacity 
                    style={styles.addToCartBtn}
                    onPress={() => addToCart(item)}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Cart Modal */}
        <Modal
          visible={showCart}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.cartModal}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Your Cart</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
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
                  keyExtractor={(item) => item.product.id}
                  renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                      <Image source={{ uri: item.product.image }} style={styles.cartItemImage} />
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{item.product.name}</Text>
                        <Text style={styles.cartItemPrice}>${item.product.price}</Text>
                      </View>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity 
                          style={styles.quantityBtn}
                          onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Ionicons name="remove" size={16} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity 
                          style={styles.quantityBtn}
                          onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Ionicons name="add" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
                <View style={styles.cartFooter}>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>Total: ${getTotalPrice().toLocaleString()}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.checkoutButton}
                    onPress={() => {
                      setShowCart(false);
                      setShowPayment(true);
                    }}
                  >
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Modal>

        {/* Payment Modal */}
        <Modal
          visible={showPayment}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.paymentModal}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentTitle}>Checkout</Text>
              <TouchableOpacity onPress={() => setShowPayment(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.paymentContent}>
              <Text style={styles.paymentSectionTitle}>Order Summary</Text>
              {cart.map(item => (
                <View key={item.product.id} style={styles.orderItem}>
                  <Text style={styles.orderItemName}>{item.product.name} x {item.quantity}</Text>
                  <Text style={styles.orderItemPrice}>${(item.product.price * item.quantity).toLocaleString()}</Text>
                </View>
              ))}
              
              <View style={styles.paymentTotal}>
                <Text style={styles.paymentTotalText}>Total: ${getTotalPrice().toLocaleString()}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.payButton, loading && styles.payButtonDisabled]}
                onPress={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={20} color="#fff" />
                    <Text style={styles.payButtonText}>Pay Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }

  // Login UI
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.loginCard}>
        <View style={styles.logoContainer}>
          <Ionicons name="storefront" size={48} color="#007AFF" />
          <Text style={styles.loginTitle}>Marketplace</Text>
        </View>
        
        <Text style={styles.loginSubtitle}>
          Sign in to discover personalized recommendations
        </Text>

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
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue with Email</Text>
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
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  loginCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 5,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 12,
  },
  loginSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#fafbfc",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  error: {
    color: "#ff3b30",
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
  },
  marketContainer: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  emailText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  cartButton: {
    padding: 8,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  categoryButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  categoryTextActive: {
    color: "#fff",
  },
  productsGrid: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007AFF",
  },
  addToCartBtn: {
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartModal: {
    flex: 1,
    backgroundColor: "#fff",
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityBtn: {
    backgroundColor: "#007AFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },
  cartFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e1e5e9",
  },
  totalContainer: {
    marginBottom: 16,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
  },
  checkoutButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  paymentModal: {
    flex: 1,
    backgroundColor: "#fff",
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  paymentTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  paymentContent: {
    flex: 1,
    padding: 20,
  },
  paymentSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderItemName: {
    fontSize: 16,
    color: "#666",
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  paymentTotal: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#e1e5e9",
  },
  paymentTotalText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
    textAlign: "center",
  },
  payButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
