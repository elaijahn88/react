import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
  Alert,
  Animated,
} from "react-native";
import { db, auth } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  where,
  doc,
  getDoc 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  sellerEmail: string;
  sellerName: string;
  description: string;
  category: string;
  createdAt: any;
  condition: "new" | "used" | "refurbished";
  location: string;
};

type User = {
  email: string;
  name: string;
  phone?: string;
};

export default function EnhancedMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const [newProductModal, setNewProductModal] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [user, setUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const cartAnimation = useState(new Animated.Value(0))[0];

  // New Product Form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("electronics");
  const [condition, setCondition] = useState<"new" | "used" | "refurbished">("new");
  const [location, setLocation] = useState("");
  const [processing, setProcessing] = useState(false);

  // Payment form
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentMessage, setPaymentMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const categories = [
    "all", "electronics", "fashion", "home", "sports", "books", "vehicles", "other"
  ];

  const conditions = [
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
    { value: "refurbished", label: "Refurbished" }
  ];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.email!));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        }
      } else {
        setUser(null);
      }
    });

    const productsQuery = query(
      collection(db, "products"), 
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const allProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(allProducts);
      setFilteredProducts(allProducts);
      setLoading(false);
      setRefreshing(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const filterProducts = () => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  };

  const handleQuantityChange = (id: string, qty: number) => {
    if (qty < 0) return;
    
    setCart((prev) => {
      const updated = { ...prev, [id]: qty };
      if (qty === 0) delete updated[id];
      return updated;
    });

    // Animate cart icon
    if (qty > (cart[id] || 0)) {
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
    }
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = products.find((p) => p.id === id);
    return product ? sum + product.price * qty : sum;
  }, 0);

  const cartScale = cartAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3]
  });

  const handleSubmitNewProduct = () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to list products");
      return;
    }

    if (!name || !price || !image || !description) {
      Alert.alert("Missing Information", "Please fill all required fields");
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price");
      return;
    }

    setPaymentVisible(true);
  };

  const handlePayment = async () => {
    setPaymentMessage(null);

    // Basic validation
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setPaymentMessage({ type: "error", text: "Card number must be 16 digits" });
      return;
    }
    if (!cardName.trim()) {
      setPaymentMessage({ type: "error", text: "Cardholder name required" });
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add product to Firestore
      await addDoc(collection(db, "products"), {
        name: name.trim(),
        price: Number(price),
        image: image.trim(),
        description: description.trim(),
        category,
        condition,
        location: location.trim(),
        sellerEmail: user!.email,
        sellerName: user!.name,
        createdAt: new Date(),
        status: "active"
      });

      setPaymentMessage({ type: "success", text: "Product listed successfully!" });
      
      setTimeout(() => {
        resetForms();
        setNewProductModal(false);
        setPaymentVisible(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setPaymentMessage({ type: "error", text: "Failed to list product" });
    } finally {
      setProcessing(false);
    }
  };

  const resetForms = () => {
    setName("");
    setPrice("");
    setImage("");
    setDescription("");
    setCategory("electronics");
    setCondition("new");
    setLocation("");
    setCardNumber("");
    setCardName("");
    setExpiry("");
    setCvv("");
    setPaymentMessage(null);
  };

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to checkout");
      return;
    }

    if (totalItems === 0) {
      Alert.alert("Empty Cart", "Add items to cart before checkout");
      return;
    }

    setProcessing(true);
    
    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      Alert.alert(
        "Order Successful!", 
        `Your order of $${totalPrice.toFixed(2)} has been placed.`,
        [{ text: "OK", onPress: () => {
          setCart({});
          setCheckoutVisible(false);
        }}]
      );
    } catch (error) {
      Alert.alert("Checkout Failed", "Please try again");
    } finally {
      setProcessing(false);
    }
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <View style={[styles.card, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
      <TouchableOpacity onPress={() => setProductDetail(item)}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.image}
          defaultSource={require('../assets/placeholder-image.png')}
        />
        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.price, { color: isDark ? "#4CD964" : "#007AFF" }]}>
            ${item.price}
          </Text>
          <View style={styles.productMeta}>
            <Text style={[styles.metaText, { color: isDark ? "#ccc" : "#666" }]}>
              {item.condition} • {item.location}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.quantityRow}>
        <TouchableOpacity 
          style={[styles.qtyButton, { backgroundColor: "#FF3B30" }]} 
          onPress={() => handleQuantityChange(item.id, (cart[item.id] || 0) - 1)}
        >
          <Ionicons name="remove" size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.qtyText, { color: isDark ? "#fff" : "#000" }]}>
          {cart[item.id] || 0}
        </Text>
        <TouchableOpacity 
          style={[styles.qtyButton, { backgroundColor: "#4CD964" }]} 
          onPress={() => handleQuantityChange(item.id, (cart[item.id] || 0) + 1)}
        >
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? "#000" : "#f8f9fa" }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, { color: isDark ? "#fff" : "#666" }]}>
          Loading Marketplace...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#f8f9fa" }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: isDark ? "#fff" : "#000" }]}>
            Marketplace
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? "#ccc" : "#666" }]}>
            Discover amazing products
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => setCheckoutVisible(true)}
        >
          <Animated.View style={{ transform: [{ scale: cartScale }] }}>
            <Ionicons name="cart" size={24} color="#007AFF" />
          </Animated.View>
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={[styles.searchInput, { color: isDark ? "#fff" : "#000" }]}
          placeholder="Search products..."
          placeholderTextColor="#999"
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
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive,
              { backgroundColor: isDark ? "#1e1e1e" : "#fff" }
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat && styles.categoryTextActive,
              { color: isDark ? "#fff" : "#000" }
            ]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderProductCard}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={[styles.emptyText, { color: isDark ? "#ccc" : "#666" }]}>
              No products found
            </Text>
          </View>
        }
      />

      {/* Sell Button */}
      <TouchableOpacity
        style={styles.sellButton}
        onPress={() => user ? setNewProductModal(true) : Alert.alert("Sign In Required", "Please sign in to sell products")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Product Detail Modal */}
      <Modal visible={!!productDetail} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
            <ScrollView>
              <Image source={{ uri: productDetail?.image }} style={styles.detailImage} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailTitle, { color: isDark ? "#fff" : "#000" }]}>
                  {productDetail?.name}
                </Text>
                <Text style={[styles.detailPrice, { color: "#007AFF" }]}>
                  ${productDetail?.price}
                </Text>
                <View style={styles.detailMeta}>
                  <Text style={[styles.detailMetaText, { color: isDark ? "#ccc" : "#666" }]}>
                    Condition: {productDetail?.condition}
                  </Text>
                  <Text style={[styles.detailMetaText, { color: isDark ? "#ccc" : "#666" }]}>
                    Location: {productDetail?.location}
                  </Text>
                  <Text style={[styles.detailMetaText, { color: isDark ? "#ccc" : "#666" }]}>
                    Seller: {productDetail?.sellerName}
                  </Text>
                </View>
                <Text style={[styles.detailDescription, { color: isDark ? "#ccc" : "#666" }]}>
                  {productDetail?.description}
                </Text>
              </View>
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setProductDetail(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* New Product Modal */}
      <Modal visible={newProductModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, styles.largeModal, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}>
                List Your Product
              </Text>
              
              <TextInput
                placeholder="Product Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                style={[styles.input, { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7", color: isDark ? "#fff" : "#000" }]}
              />
              
              <TextInput
                placeholder="Price"
                placeholderTextColor="#999"
                value={price}
                onChangeText={setPrice}
                style={[styles.input, { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7", color: isDark ? "#fff" : "#000" }]}
                keyboardType="numeric"
              />
              
              <TextInput
                placeholder="Image URL"
                placeholderTextColor="#999"
                value={image}
                onChangeText={setImage}
                style={[styles.input, { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7", color: isDark ? "#fff" : "#000" }]}
              />
              
              <TextInput
                placeholder="Description"
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, styles.textArea, { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7", color: isDark ? "#fff" : "#000" }]}
                multiline
                numberOfLines={4}
              />
              
              <TextInput
                placeholder="Location"
                placeholderTextColor="#999"
                value={location}
                onChangeText={setLocation}
                style={[styles.input, { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7", color: isDark ? "#fff" : "#000" }]}
              />

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitNewProduct}
              >
                <Text style={styles.submitButtonText}>Continue to Payment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setNewProductModal(false);
                  resetForms();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={paymentVisible} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
            <ScrollView>
              <Text style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}>
                Payment Details
              </Text>
              
              <TextInput
                placeholder="Card Number"
                placeholderTextColor="#999"
                value={cardNumber}
                onChangeText={(text) => {
                  const digits = text.replace(/\D/g, "").slice(0, 16);
                  const spaced = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
                  setCardNumber(spaced);
                }}
                style={[styles.input, { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7", color: isDark ? "#fff" : "#000" }]}
                keyboardType="number-pad"
                maxLength={19}
              />
              
              <TextInput
                placeholder="Cardholder Name"
                placeholderTextColor="#999"
                value={cardName}
                onChangeText={setCardName}
                style={[styles.input, { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7", color: isDark ? "#fff" : "#000" }]}
              />

              {paymentMessage && (
                <Text style={[
                  styles.paymentMessage,
                  { color: paymentMessage.type === "error" ? "#FF3B30" : "#4CD964" }
                ]}>
                  {paymentMessage.text}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.submitButton, processing && styles.buttonDisabled]}
                onPress={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Pay ${5} Listing Fee
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setPaymentVisible(false);
                  setProcessing(false);
                  setPaymentMessage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Checkout Modal */}
      <Modal visible={checkoutVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
            <Text style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}>
              Checkout
            </Text>
            
            {Object.entries(cart).map(([productId, quantity]) => {
              const product = products.find(p => p.id === productId);
              if (!product) return null;
              
              return (
                <View key={productId} style={styles.cartItem}>
                  <Image source={{ uri: product.image }} style={styles.cartImage} />
                  <View style={styles.cartItemInfo}>
                    <Text style={[styles.cartItemName, { color: isDark ? "#fff" : "#000" }]}>
                      {product.name}
                    </Text>
                    <Text style={[styles.cartItemPrice, { color: "#007AFF" }]}>
                      ${product.price} x {quantity}
                    </Text>
                  </View>
                  <Text style={[styles.cartItemTotal, { color: isDark ? "#fff" : "#000" }]}>
                    ${(product.price * quantity).toFixed(2)}
                  </Text>
                </View>
              );
            })}
            
            <View style={styles.totalContainer}>
              <Text style={[styles.totalText, { color: isDark ? "#fff" : "#000" }]}>
                Total: ${totalPrice.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, processing && styles.buttonDisabled]}
              onPress={handleCheckout}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Complete Purchase
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCheckoutVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16 },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    marginBottom: 16 
  },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  cartButton: { padding: 8, position: "relative" },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  categoriesContainer: { paddingHorizontal: 20, marginBottom: 16 },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: { backgroundColor: "#007AFF" },
  categoryText: { fontSize: 14, fontWeight: "500" },
  categoryTextActive: { color: "#fff" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { 
    width: CARD_WIDTH, 
    borderRadius: 16, 
    padding: 12, 
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: { width: "100%", height: CARD_WIDTH - 24, borderRadius: 12 },
  cardContent: { marginTop: 8 },
  title: { fontWeight: "600", fontSize: 14, lineHeight: 18 },
  price: { fontWeight: "700", fontSize: 16, marginTop: 4 },
  productMeta: { marginTop: 4 },
  metaText: { fontSize: 12 },
  quantityRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 12 
  },
  qtyButton: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  qtyButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  qtyText: { marginHorizontal: 12, fontSize: 16, fontWeight: "600" },
  sellButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  modalContent: { 
    width: "90%", 
    borderRadius: 20, 
    padding: 20, 
    maxHeight: "80%" 
  },
  largeModal: { maxHeight: "90%" },
  modalTitle: { fontSize: 24, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  input: { 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    fontSize: 16, 
    marginBottom: 16 
  },
  textArea: { height: 100, textAlignVertical: "top" },
  submitButton: { 
    backgroundColor: "#007AFF", 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    marginBottom: 12 
  },
  submitButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  cancelButton: { 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#ddd" 
  },
  cancelButtonText: { color: "#666", fontWeight: "600", fontSize: 16 },
  buttonDisabled: { opacity: 0.6 },
  detailImage: { width: "100%", height: 300, borderRadius: 12 },
  detailContent: { marginTop: 16 },
  detailTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  detailPrice: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  detailMeta: { marginBottom: 16 },
  detailMetaText: { fontSize: 14, marginBottom: 4 },
  detailDescription: { fontSize: 16, lineHeight: 22 },
  closeButton: { 
    backgroundColor: "#007AFF", 
    paddingVertical: 12, 
    borderRadius: 12, 
    alignItems: "center", 
    marginTop: 16 
  },
  closeButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  paymentMessage: { 
    textAlign: "center", 
    fontWeight: "600", 
    marginBottom: 16 
  },
  emptyState: { 
    alignItems: "center", 
    paddingVertical: 60 
  },
  emptyText: { 
    fontSize: 16, 
    marginTop: 16 
  },
  cartItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 16 
  },
  cartImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 8, 
    marginRight: 12 
  },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  cartItemPrice: { fontSize: 14 },
  cartItemTotal: { fontSize: 16, fontWeight: "600" },
  totalContainer: { 
    borderTopWidth: 1, 
    borderTopColor: "#ddd", 
    paddingTop: 16, 
    marginBottom: 20 
  },
  totalText: { fontSize: 20, fontWeight: "700", textAlign: "center" },
});
