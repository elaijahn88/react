import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useColorScheme,
  Linking,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebase"; // adjust path
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;
const USER_EMAIL = "elajahn8@gmail.com";
const phoneNumber = "0746524088";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type Preferences = { [productId: string]: number };

const initialProducts: Product[] = [
  { id: "1", name: "Nike Sneakers", price: 120, image: "https://xlijah.com/pics/sneaker.jpg" },
  { id: "2", name: "Apple Watch", price: 250, image: "https://xlijah.com/pics/apple_watch.jpg" },
  { id: "3", name: "Bluetooth Headphones", price: 80, image: "https://xlijah.com/pics/bluetooth.webp" },
  { id: "4", name: "Leather Bag", price: 150, image: "https://xlijah.com/pics/bag.webp" },
  { id: "5", name: "Sunglasses", price: 50, image: "https://xlijah.com/pics/sunglasses.jpg" },
  { id: "6", name: "iPhone 12", price: 999, image: "https://xlijah.com/pics/iphone.jpg" },
];

const updatedProducts: Product[] = [
  { id: "7", name: "lenovo", price: 70000, image: "https://xlijah.com/pics/pics/lenovo.jpg" },
  { id: "8", name: "macbook", price: 850, image: "https://xlijah.com/pics/pics/macbook.jpg" },
  { id: "9", name: "mac", price: 150, image: "https://xlijah.com/pics/pics/mac.jpeg" },
  { id: "10", name: "MacBook Pro", price: 2400, image: "https://xlijah.com/pics/pics/macbook.jpg" },
  { id: "11", name: "notebook", price: 1200, image: "https://xlijah.com/pics/pics/notebook.jpeg" },
  { id: "12", name: "Arms", price: 130, image: "https://xlijah.com/pics/pics/guns.jpeg" },
];

const callSeller = () => {
  Linking.openURL(`tel:${phoneNumber}`).catch(() => Alert.alert("Error", "Phone app not available"));
};

const ProductCard = ({
  item,
  onQuantityChange,
  isDark,
  qtyInCart,
}: {
  item: Product;
  onQuantityChange: (id: string, qty: number) => void;
  isDark: boolean;
  qtyInCart: number;
}) => {
  const [quantity, setQuantity] = useState(qtyInCart || 0);
  const [imageLoading, setImageLoading] = useState(true);

  const updateQuantity = (newQty: number) => {
    const safeQty = Math.max(newQty, 0);
    setQuantity(safeQty);
    onQuantityChange(item.id, safeQty);
  };

  return (
    <View style={[styles.card, { backgroundColor: isDark ? "#1c1c1e" : "#fff" }]}>
      <View style={styles.imageContainer}>
        {imageLoading && <ActivityIndicator size="small" color={isDark ? "#fff" : "#000"} />}
        <Image
          source={{ uri: item.image }}
          style={[styles.image, imageLoading ? { display: "none" } : {}]}
          onLoadEnd={() => setImageLoading(false)}
        />
      </View>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={[styles.price, { color: isDark ? "#00ff7f" : "#00a650" }]}>${item.price.toFixed(2)}</Text>

      <View style={styles.quantityRow}>
        <TouchableOpacity
          style={styles.qtyButton}
          onPress={() => updateQuantity(quantity - 1)}
        >
          <Text style={styles.qtyButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.qtyText, { color: isDark ? "#fff" : "#000" }]}>{quantity}</Text>
        <TouchableOpacity
          style={styles.qtyButton}
          onPress={() => updateQuantity(quantity + 1)}
        >
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.addButton, quantity === 0 && { backgroundColor: "#555" }]}
        onPress={callSeller}
        disabled={quantity === 0}
      >
        <Text style={styles.addButtonText}>+Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([...initialProducts, ...updatedProducts]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [preferences, setPreferences] = useState<Preferences>({});
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [cartReviewVisible, setCartReviewVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);

  // Payment fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", USER_EMAIL);
      const userSnap = await getDoc(userRef);
      let userPrefs: Preferences = {};
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.preferences) userPrefs = data.preferences;
      }
      setPreferences(userPrefs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const handleQuantityChange = (id: string, qty: number) => {
    setCart((prev) => {
      const updated = { ...prev, [id]: qty };
      if (qty === 0) delete updated[id];
      return updated;
    });
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = products.find((p) => p.id === id);
    return product ? sum + product.price * qty : sum;
  }, 0);

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const product = products.find((p) => p.id === id);
      if (!product) return null;
      return { ...product, quantity: qty };
    })
    .filter(Boolean) as (Product & { quantity: number })[];

  const handlePay = () => {
    // Simulate payment success
    setProcessingPayment(true);
    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentMessage({ type: "success", text: `Paid $${totalPrice.toFixed(2)}!` });
      setCart({});
      setTimeout(() => {
        setPaymentVisible(false);
        setPaymentMessage(null);
        setCardNumber(""); setCardName(""); setExpiry(""); setCvv("");
      }, 1500);
    }, 2000);
  };

  if (loading)
    return <ActivityIndicator style={{ flex: 1, marginTop: 50 }} size="large" color="#25D366" />;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f2f2f2" }]}>
      <Text style={[styles.header, { color: isDark ? "#fff" : "#000" }]}>Jumia Market</Text>

      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onQuantityChange={handleQuantityChange}
            isDark={isDark}
            qtyInCart={cart[item.id] || 0}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.cartIcon}
          onPress={() => setCartReviewVisible(true)}
        >
          <Ionicons name="cart" size={28} color="#fff" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Cart Review Modal */}
      <Modal visible={cartReviewVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: isDark ? "#1c1c1e" : "#fff" }]}>
            <Text style={[styles.modalHeader, { color: isDark ? "#fff" : "#000" }]}>Cart</Text>
            <ScrollView>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <Text style={{ color: isDark ? "#fff" : "#000" }}>
                    {item.name} x {item.quantity}
                  </Text>
                  <Text style={{ color: isDark ? "#00ff7f" : "#00a650" }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <Text style={{ marginTop: 10, fontWeight: "700", fontSize: 16, color: isDark ? "#fff" : "#000" }}>
              Total: ${totalPrice.toFixed(2)}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 15 }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#aaa" }]}
                onPress={() => setCartReviewVisible(false)}
              >
                <Text style={{ color: "#fff" }}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ff6600" }]}
                onPress={() => { setPaymentVisible(true); setCartReviewVisible(false); }}
              >
                <Text style={{ color: "#fff" }}>Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={paymentVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackground}
        >
          <View style={[styles.modalContainer, { backgroundColor: isDark ? "#1c1c1e" : "#fff" }]}>
            <Text style={[styles.modalHeader, { color: isDark ? "#fff" : "#000" }]}>Payment</Text>
            <ScrollView>
              <TextInput
                placeholder="Card Number"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: isDark ? "#333" : "#eee", color: isDark ? "#fff" : "#000" }]}
              />
              <TextInput
                placeholder="Card Holder Name"
                value={cardName}
                onChangeText={setCardName}
                style={[styles.input, { backgroundColor: isDark ? "#333" : "#eee", color: isDark ? "#fff" : "#000" }]}
              />
              <TextInput
                placeholder="Expiry MM/YY"
                value={expiry}
                onChangeText={setExpiry}
                style={[styles.input, { backgroundColor: isDark ? "#333" : "#eee", color: isDark ? "#fff" : "#000" }]}
              />
              <TextInput
                placeholder="CVV"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: isDark ? "#333" : "#eee", color: isDark ? "#fff" : "#000" }]}
              />
              {paymentMessage && (
                <Text style={{ color: paymentMessage.type === "success" ? "green" : "red", marginVertical: 10 }}>
                  {paymentMessage.text}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ff6600", marginTop: 10 }]}
                onPress={handlePay}
                disabled={processingPayment}
              >
                <Text style={{ color: "#fff" }}>{processingPayment ? "Processing..." : "Pay"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#aaa", marginTop: 10 }]}
                onPress={() => setPaymentVisible(false)}
              >
                <Text style={{ color: "#fff" }}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: { fontSize: 28, fontWeight: "900", marginLeft: 20, marginBottom: 10 },
  list: { paddingHorizontal: 12, paddingBottom: 100 },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    padding: 12,
    margin: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 4,
  },
  imageContainer: { width: CARD_WIDTH - 24, height: CARD_WIDTH - 24, borderRadius: 12, overflow: "hidden", justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0" },
  image: { width: "100%", height: "100%", borderRadius: 12 },
  title: { marginTop: 8, fontWeight: "700", fontSize: 14, textAlign: "center" },
  price: { marginTop: 4, fontWeight: "700", fontSize: 16 },
  addButton: { marginTop: 12, backgroundColor: "#ff6600", paddingVertical: 10, borderRadius: 8, width: "100%", alignItems: "center" },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  quantityRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyButton: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: "#ddd", borderRadius: 4 },
  qtyButtonText: { fontWeight: "700" },
  qtyText: { marginHorizontal: 8, fontWeight: "700", fontSize: 16 },
  cartIcon: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#ff6600", padding: 14, borderRadius: 30 },
  cartBadge: { position: "absolute", top: -5, right: -5, backgroundColor: "red", width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  cartBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", maxHeight: "80%", borderRadius: 12, padding: 20 },
  modalHeader: { fontSize: 22, fontWeight: "700", marginBottom: 15 },
  cartItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  modalButton: { paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  input: { borderRadius: 8, padding: 12, marginBottom: 10 },
});
