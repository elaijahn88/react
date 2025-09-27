import React, { useState } from "react";
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

const initialProducts: Product[] = [
  { id: "1", name: "Nike Sneakers", price: 120, image: "https://xlijah.com/pics/sneaker.jpg" },
  { id: "2", name: "Apple Watch", price: 250, image: "https://xlijah.com/pics/apple_watch.jpg" },
  { id: "3", name: "Bluetooth Headphones", price: 80, image: "https://xlijah.com/pics/bluetooth.webp" },
  { id: "4", name: "Leather Bag", price: 150, image: "https://xlijah.com/pics/bag.webp" },
  { id: "5", name: "Sunglasses", price: 50, image: "https://xlijah.com/pics/sunglasses.jpg" },
  { id: "6", name: "iPhone 12", price: 999, image: "https://xlijah.com/pics/iphone.jpg" },
];

const updatedProducts: Product[] = [
  { id: "7", name: "Range Rover", price: 70000, image: "https://xlijah.com/pics/range_rover.jpg" },
  { id: "8", name: "Samsung Galaxy S21", price: 850, image: "https://xlijah.com/pics/galaxy_s21.jpg" },
  { id: "9", name: "Sony Headphones", price: 150, image: "https://xlijah.com/pics/sony_headphones.jpg" },
  { id: "10", name: "MacBook Pro", price: 2400, image: "https://xlijah.com/pics/macbook_pro.jpg" },
  { id: "11", name: "Canon DSLR", price: 1200, image: "https://xlijah.com/pics/canon_dslr.jpg" },
  { id: "12", name: "Fitbit Charge", price: 130, image: "https://xlijah.com/pics/fitbit_charge.jpg" },
  { id: "13", name: "Google Pixel", price: 700, image: "https://xlijah.com/pics/google_pixel.jpg" },
  { id: "14", name: "Kindle Paperwhite", price: 140, image: "https://xlijah.com/pics/kindle_paperwhite.jpg" },
  { id: "15", name: "DJI Drone", price: 1200, image: "https://xlijah.com/pics/dji_drone.jpg" },
  { id: "16", name: "Xbox Series X", price: 500, image: "https://xlijah.com/pics/xbox_series_x.jpg" },
];

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;
const phoneNumber = "0746524088"; // Seller phone number

const callSeller = () => {
  Linking.openURL(`tel:${phoneNumber}`).catch(() =>
    console.error("Phone app not available")
  );
};

const ProductCard = ({
  item,
  onQuantityChange,
  isDark,
}: {
  item: Product;
  onQuantityChange: (id: string, qty: number) => void;
  isDark: boolean;
}) => {
  const [quantity, setQuantity] = useState(0);

  const updateQuantity = (newQty: number) => {
    const safeQty = Math.max(newQty, 0);
    setQuantity(safeQty);
    onQuantityChange(item.id, safeQty);
  };

  return (
    <View style={[styles.card, { backgroundColor: isDark ? "#1c1c1e" : "#fff" }]}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={[styles.price, { color: isDark ? "#00ff7f" : "#00a650" }]}>
        ${item.price.toFixed(2)}
      </Text>

      {/* Quantity Selector */}
      <View style={styles.quantityRow}>
        <TouchableOpacity
          style={[styles.qtyButton, { backgroundColor: "#007aff" }]}
          onPress={() => updateQuantity(quantity - 1)}
        >
          <Text style={styles.qtyButtonText}>-</Text>
        </TouchableOpacity>

        <Text style={[styles.qtyText, { color: isDark ? "#fff" : "#000" }]}>{quantity}</Text>

        <TouchableOpacity
          style={[styles.qtyButton, { backgroundColor: "#007aff" }]}
          onPress={() => updateQuantity(quantity + 1)}
        >
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Call Seller */}
      <TouchableOpacity
        style={[
          styles.button,
          quantity === 0 && { backgroundColor: "#555" },
        ]}
        onPress={callSeller}
        disabled={quantity === 0}
      >
        <Text style={styles.buttonText}>+Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Payment modal states
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentMessage, setPaymentMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

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

  // Format card number as #### #### #### ####
  const formatCardNumber = (num: string) => {
    return num.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim();
  };

  const handleCardNumberChange = (text: string) => {
    // Allow only numbers and spaces
    const cleaned = text.replace(/[^\d]/g, "");
    setCardNumber(formatCardNumber(cleaned));
  };

  const handlePay = () => {
    // Reset previous messages
    setPaymentMessage(null);

    if (cardNumber.length !== 19) {
      setPaymentMessage({ type: "error", text: "Card number must be 16 digits." });
      return;
    }
    if (cardName.trim() === "") {
      setPaymentMessage({ type: "error", text: "Cardholder name is required." });
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setPaymentMessage({ type: "error", text: "Expiry date must be in MM/YY format." });
      return;
    }
    if (cvv.length !== 3) {
      setPaymentMessage({ type: "error", text: "CVV must be 3 digits." });
      return;
    }

    // Mock payment success
    setPaymentMessage({ type: "success", text: `Payment of $${totalPrice.toFixed(2)} successful!` });

    // Clear cart and payment inputs after a short delay
    setTimeout(() => {
      setPaymentVisible(false);
      setCart({});
      setCardNumber("");
      setCardName("");
      setExpiry("");
      setCvv("");
      setPaymentMessage(null);
    }, 2000);
  };

  const updateProductList = () => {
    setProducts(updatedProducts);
    setCart({});
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f2f2f2" }]}>
      <Text style={[styles.header, { color: isDark ? "#fff" : "#000" }]}>Market</Text>

      {/* Update Products Button */}
      <TouchableOpacity
        style={[styles.updateButton, { backgroundColor: isDark ? "#555" : "#007aff" }]}
        onPress={updateProductList}
        accessibilityLabel="Update product list"
      >
        <Text style={[styles.updateButtonText, { color: "#fff" }]}>Update Products</Text>
      </TouchableOpacity>

      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard item={item} onQuantityChange={handleQuantityChange} isDark={isDark} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Cart Icon */}
      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.cartIcon}
          onPress={() => setPaymentVisible(true)}
          accessibilityLabel="Open payment modal"
        >
          <Ionicons name="cart" size={28} color="#fff" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Payment Modal */}
      <Modal
        visible={paymentVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: isDark ? "#222" : "#fff" }]}>
            <Text style={[styles.modalHeader, { color: isDark ? "#fff" : "#000" }]}>Payment Details</Text>

            {/* Mastercard Logo */}
            <Image
              source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/120px-Mastercard-logo.svg.png" }}
              style={styles.mastercardLogo}
              resizeMode="contain"
              accessible
              accessibilityLabel="Mastercard Logo"
            />

            {/* Card Number */}
            <TextInput
              style={[styles.input, { borderColor: paymentMessage?.type === "error" && paymentMessage.text.includes("Card number") ? "red" : "#ccc", color: isDark ? "#fff" : "#000" }]}
              placeholder="Card Number (#### #### #### ####)"
              placeholderTextColor={isDark ? "#888" : "#aaa"}
              keyboardType="numeric"
              maxLength={19}
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              accessibilityLabel="Card Number Input"
            />

            {/* Cardholder Name */}
            <TextInput
              style={[styles.input, { borderColor: paymentMessage?.type === "error" && paymentMessage.text.includes("Cardholder") ? "red" : "#ccc", color: isDark ? "#fff" : "#000" }]}
              placeholder="Cardholder Name"
              placeholderTextColor={isDark ? "#888" : "#aaa"}
              value={cardName}
              onChangeText={setCardName}
              accessibilityLabel="Cardholder Name Input"
            />

            <View style={styles.row}>
              {/* Expiry Date */}
              <TextInput
                style={[
                  styles.inputHalf,
                  { marginRight: 10, borderColor: paymentMessage?.type === "error" && paymentMessage.text.includes("Expiry") ? "red" : "#ccc", color: isDark ? "#fff" : "#000" },
                ]}
                placeholder="Expiry (MM/YY)"
                placeholderTextColor={isDark ? "#888" : "#aaa"}
                maxLength={5}
                value={expiry}
                onChangeText={(text) => {
                  // Format MM/YY while typing
                  let cleaned = text.replace(/[^\d]/g, "");
                  if (cleaned.length > 2) cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
                  setExpiry(cleaned);
                }}
                keyboardType="numeric"
                accessibilityLabel="Expiry Date Input"
              />

              {/* CVV */}
              <TextInput
                style={[
                  styles.inputHalf,
                  { borderColor: paymentMessage?.type === "error" && paymentMessage.text.includes("CVV") ? "red" : "#ccc", color: isDark ? "#fff" : "#000" },
                ]}
                placeholder="CVV"
                placeholderTextColor={isDark ? "#888" : "#aaa"}
                keyboardType="numeric"
                maxLength={3}
                value={cvv}
                onChangeText={(text) => setCvv(text.replace(/[^\d]/g, ""))}
                secureTextEntry
                accessibilityLabel="CVV Input"
              />
            </View>

            {/* Validation/Error Message */}
            {paymentMessage && (
              <Text
                style={{
                  color: paymentMessage.type === "error" ? "red" : "green",
                  marginTop: 10,
                  fontWeight: "600",
                  textAlign: "center",
                }}
                accessibilityLiveRegion="polite"
              >
                {paymentMessage.text}
              </Text>
            )}

            {/* Pay Button */}
            <TouchableOpacity style={styles.payButton} onPress={handlePay} accessibilityLabel="Pay button">
              <Text style={styles.payButtonText}>Pay ${totalPrice.toFixed(2)}</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity onPress={() => setPaymentVisible(false)} style={styles.closeButton} accessibilityLabel="Cancel payment">
              <Text style={[styles.closeButtonText, { color: isDark ? "#aaa" : "#444" }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: { fontSize: 26, fontWeight: "bold", paddingHorizontal: 16, paddingBottom: 10 },
  list: { paddingHorizontal: 10, paddingBottom: 20 },
  card: {
    borderRadius: 12,
    margin: 10,
    width: CARD_WIDTH,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  image: { width: CARD_WIDTH - 24, height: CARD_WIDTH - 24, borderRadius: 12 },
  title: { fontSize: 16, marginTop: 10, fontWeight: "600", textAlign: "center" },
  price: { fontSize: 16, fontWeight: "bold", marginTop: 6 },
  button: { marginTop: 10, backgroundColor: "#007aff", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20 },
  buttonText: { color: "#fff", fontWeight: "600" },
  quantityRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyButton: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  qtyButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  qtyText: { marginHorizontal: 12, fontSize: 16, fontWeight: "600" },
  cartIcon: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007aff",
    borderRadius: 30,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cartBadge: { position: "absolute", top: 5, right: 5, backgroundColor: "red", borderRadius: 10, paddingHorizontal: 5, paddingVertical: 2 },
  cartBadgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  // Update Products Button
  updateButton: {
    marginHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  updateButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },

  // Payment modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  mastercardLogo: {
    width: 120,
    height: 40,
    alignSelf: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputHalf: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  payButton: {
    marginTop: 15,
    backgroundColor: "#eb001b", // Mastercard red
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  closeButton: {
    marginTop: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
  },
});
