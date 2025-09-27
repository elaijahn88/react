import React, { useState, useCallback, useEffect } from "react";
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
  Alert,
  ActivityIndicator,
  ScrollView,
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
  { id: "7", name: "Range Rover", price: 70000, image: "https://xlijah.com/pics/pics/lenovo.jpg" },
  { id: "8", name: "Samsung Galaxy S21", price: 850, image: "https://xlijah.com/pics/pics/macbook.jpg" },
  { id: "9", name: "Sony Headphones", price: 150, image: "https://xlijah.com/pics/pics/mac.jpeg" },
  { id: "10", name: "MacBook Pro", price: 2400, image: "https://xlijah.com/pics/pics/macbook_pro.jpg" },
  { id: "11", name: "Canon DSLR", price: 1200, image: "https://xlijah.com/pics/pics/notebook.jpeg" },
  { id: "12", name: "Fitbit Charge", price: 130, image: "https://xlijah.com/pics/pics/guns.jpeg" },
  { id: "13", name: "Google Pixel", price: 700, image: "https://xlijah.com/pics/pics/mac.jpeg" },
  { id: "14", name: "Kindle Paperwhite", price: 140, image: "https://xlijah.com/pics/pics/chemicals.jpeg" },
  { id: "15", name: "DJI Drone", price: 1200, image: "https://xlijah.com/pics/pics/macbook.jpg" },
  { id: "16", name: "Xbox Series X", price: 500, image: "https://xlijah.com/pics/pics/lenovo.jpg" },
];

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;
const phoneNumber = "0746524088"; // Seller phone number

const callSeller = () => {
  Linking.openURL(`tel:${phoneNumber}`).catch(() => {
    Alert.alert("Error", "Phone app not available");
  });
};

const ProductCard = React.memo(
  ({
    item,
    onQuantityChange,
    isDark,
  }: {
    item: Product;
    onQuantityChange: (id: string, qty: number) => void;
    isDark: boolean;
  }) => {
    const [quantity, setQuantity] = useState(0);
    const [imageLoading, setImageLoading] = useState(true);

    const updateQuantity = (newQty: number) => {
      const safeQty = Math.max(newQty, 0);
      setQuantity(safeQty);
      onQuantityChange(item.id, safeQty);
    };

    return (
      <View style={[styles.card, { backgroundColor: isDark ? "#1c1c1e" : "#fff" }]}>
        <View
          style={{
            width: CARD_WIDTH - 24,
            height: CARD_WIDTH - 24,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#ccc",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {imageLoading && <ActivityIndicator size="small" color={isDark ? "#fff" : "#000"} />}
          <Image
            source={{ uri: item.image }}
            style={[styles.image, imageLoading ? { display: "none" } : {}]}
            onLoadEnd={() => setImageLoading(false)}
            accessibilityLabel={`${item.name} image`}
          />
        </View>
        <Text
          style={[styles.title, { color: isDark ? "#fff" : "#000" }]}
          numberOfLines={2}
          accessibilityRole="header"
        >
          {item.name}
        </Text>
        <Text style={[styles.price, { color: isDark ? "#00ff7f" : "#00a650" }]}>${item.price.toFixed(2)}</Text>

        {/* Quantity Selector */}
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={[styles.qtyButton, { backgroundColor: "#007aff" }]}
            onPress={() => updateQuantity(quantity - 1)}
            accessibilityLabel={`Decrease quantity of ${item.name}`}
            accessibilityHint="Decreases quantity by 1"
          >
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>

          <Text
            style={[styles.qtyText, { color: isDark ? "#fff" : "#000" }]}
            accessibilityLabel={`Quantity for ${item.name}`}
          >
            {quantity}
          </Text>

          <TouchableOpacity
            style={[styles.qtyButton, { backgroundColor: "#007aff" }]}
            onPress={() => updateQuantity(quantity + 1)}
            accessibilityLabel={`Increase quantity of ${item.name}`}
            accessibilityHint="Increases quantity by 1"
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Call Seller */}
        <TouchableOpacity
          style={[styles.button, quantity === 0 && { backgroundColor: "#555" }]}
          onPress={callSeller}
          disabled={quantity === 0}
          accessibilityLabel={`Add ${item.name} to cart and call seller`}
          accessibilityHint={quantity === 0 ? "Disabled when quantity is zero" : "Calls seller"}
        >
          <Text style={styles.buttonText}>+Cart</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

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
  const [processingPayment, setProcessingPayment] = useState(false);

  // Cart review modal
  const [cartReviewVisible, setCartReviewVisible] = useState(false);

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
    const cleaned = text.replace(/[^\d]/g, "");
    setCardNumber(formatCardNumber(cleaned));
  };

  // Auto-format expiry date MM/YY with slash
  const handleExpiryChange = (text: string) => {
    // Remove non-digit and slash
    let cleaned = text.replace(/[^\d]/g, "");
    if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);
    if (cleaned.length > 2) cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    setExpiry(cleaned);
  };

  const handlePay = async () => {
    setPaymentMessage(null);

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setPaymentMessage({ type: "error", text: "Card number must be 16 digits." });
      return;
    }
    if (cardName.trim() === "") {
      setPaymentMessage({ type: "error", text: "Cardholder name is required." });
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setPaymentMessage({ type: "error", text: "Expiry date must be in MM/YY format." });
      return;
    }
    if (cvv.length !== 3) {
      setPaymentMessage({ type: "error", text: "CVV must be 3 digits." });
      return;
    }

    setProcessingPayment(true);

    // Simulate async payment processing delay
    setTimeout(() => {
      setPaymentMessage({ type: "success", text: `Payment of $${totalPrice.toFixed(2)} successful!` });
      setProcessingPayment(false);

      // Clear cart and payment inputs after delay
      setTimeout(() => {
        setPaymentVisible(false);
        setCart({});
        setCardNumber("");
        setCardName("");
        setExpiry("");
        setCvv("");
        setPaymentMessage(null);
      }, 2000);
    }, 2000);
  };

  // Preserve cart on update product list
  const updateProductList = () => {
    setProducts(updatedProducts);
    // Remove items not in new list
    setCart((prev) => {
      const newCart: { [key: string]: number } = {};
      Object.entries(prev).forEach(([id, qty]) => {
        if (updatedProducts.find((p) => p.id === id)) {
          newCart[id] = qty;
        }
      });
      return newCart;
    });
  };

  // Cart Review Items
  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const product = products.find((p) => p.id === id);
      if (!product) return null;
      return { ...product, quantity: qty };
    })
    .filter(Boolean) as (Product & { quantity: number })[];

  // CVV visibility toggle
  const [showCvv, setShowCvv] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f2f2f2" }]}>
      <Text style={[styles.header, { color: isDark ? "#fff" : "#000" }]}>Market</Text>

      {/* Update Products Button */}
      <TouchableOpacity
        style={[styles.updateButton, { backgroundColor: isDark ? "#555" : "#007aff" }]}
        onPress={updateProductList}
        accessibilityLabel="Update product list"
        accessibilityHint="Replaces products with new list, preserving matching cart items"
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
          onPress={() => setCartReviewVisible(true)}
          accessibilityLabel="Open cart review"
          accessibilityHint="View items in cart and proceed to payment"
        >
          <Ionicons name="cart" size={28} color="#fff" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Cart Review Modal */}
      <Modal visible={cartReviewVisible} transparent animationType="slide" onRequestClose={() => setCartReviewVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? "#222" : "#fff", maxHeight: "80%" }]}>
            <Text style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}>Your Cart</Text>
            {cartItems.length === 0 ? (
              <Text style={{ color: isDark ? "#fff" : "#000", padding: 16 }}>Your cart is empty.</Text>
            ) : (
              <ScrollView>
                {cartItems.map(({ id, name, price, quantity }) => (
                  <View key={id} style={styles.cartItem}>
                    <Text style={{ color: isDark ? "#fff" : "#000", flex: 1 }}>
                      {name} x {quantity}
                    </Text>
                    <Text style={{ color: isDark ? "#0f0" : "#080" }}>${(price * quantity).toFixed(2)}</Text>
                  </View>
                ))}
                <View style={styles.cartTotal}>
                  <Text style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}>Total:</Text>
                  <Text style={[styles.modalTitle, { color: isDark ? "#0f0" : "#080" }]}>${totalPrice.toFixed(2)}</Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginRight: 8 }]}
                onPress={() => setCartReviewVisible(false)}
                accessibilityLabel="Close cart review"
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { flex: 1, backgroundColor: cartItems.length === 0 ? "#555" : "#28a745" }]}
                onPress={() => {
                  setCartReviewVisible(false);
                  setPaymentVisible(true);
                }}
                disabled={cartItems.length === 0}
                accessibilityLabel="Proceed to payment"
                accessibilityHint={cartItems.length === 0 ? "Disabled when cart is empty" : "Proceed to payment screen"}
              >
                <Text style={styles.buttonText}>Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={paymentVisible} transparent animationType="slide" onRequestClose={() => !processingPayment && setPaymentVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: isDark ? "#222" : "#fff", maxHeight: "90%" }]}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}>Payment Details</Text>

              <TextInput
                style={[styles.input, { backgroundColor: isDark ? "#333" : "#eee", color: isDark ? "#fff" : "#000" }]}
                placeholder="Card Number"
                placeholderTextColor={isDark ? "#888" : "#666"}
                keyboardType="number-pad"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                maxLength={19}
                accessibilityLabel="Card Number"
              />

              <TextInput
                style={[styles.input, { backgroundColor: isDark ? "#333" : "#eee", color: isDark ? "#fff" : "#000" }]}
                placeholder="Cardholder Name"
                placeholderTextColor={isDark ? "#888" : "#666"}
                value={cardName}
                onChangeText={setCardName}
                accessibilityLabel="Cardholder Name"
                autoCapitalize="words"
              />

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#333" : "#eee", color: isDark ? "#fff" : "#000", flex: 1, marginRight: 8 }]}
                  placeholder="Expiry (MM/YY)"
                  placeholderTextColor={isDark ? "#888" : "#666"}
                  keyboardType="number-pad"
                  value={expiry}
                  onChangeText={handleExpiryChange}
                  maxLength={5}
                  accessibilityLabel="Expiry date"
                />

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextInput
                      style={[styles.input, { backgroundColor: isDark ? "#333" : "#eee", color: isDark ? "#fff" : "#000", flex: 1 }]}
                      placeholder="CVV"
                      placeholderTextColor={isDark ? "#888" : "#666"}
                      keyboardType="number-pad"
                      value={cvv}
                      onChangeText={(text) => setCvv(text.replace(/[^\d]/g, "").slice(0, 3))}
                      maxLength={3}
                      secureTextEntry={!showCvv}
                      accessibilityLabel="CVV"
                    />
                    <TouchableOpacity
                      onPress={() => setShowCvv(!showCvv)}
                      style={{ position: "absolute", right: 10 }}
                      accessibilityLabel={showCvv ? "Hide CVV" : "Show CVV"}
                    >
                      <Ionicons name={showCvv ? "eye" : "eye-off"} size={24} color={isDark ? "#fff" : "#000"} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {paymentMessage && (
                <Text
                  style={{
                    marginTop: 10,
                    color: paymentMessage.type === "error" ? "red" : "green",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                  accessibilityLiveRegion="polite"
                >
                  {paymentMessage.text}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.button, processingPayment ? { backgroundColor: "#555" } : { marginTop: 20 }]}
                onPress={handlePay}
                disabled={processingPayment}
                accessibilityLabel="Confirm payment"
                accessibilityHint={processingPayment ? "Processing payment" : "Submits payment details"}
              >
                {processingPayment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Pay ${totalPrice.toFixed(2)}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#aaa", marginTop: 12 }]}
                onPress={() => !processingPayment && setPaymentVisible(false)}
                accessibilityLabel="Cancel payment"
              >
                <Text style={[styles.buttonText, { color: "#333" }]}>Cancel</Text>
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
  header: { fontSize: 36, fontWeight: "900", marginLeft: 20, marginBottom: 10 },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
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
    elevation: 3,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  title: {
    marginTop: 12,
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  price: {
    marginTop: 4,
    fontWeight: "700",
    fontSize: 16,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },
  qtyText: {
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: "700",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#007aff",
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  cartIcon: {
    position: "absolute",
    bottom: 40,
    right: 30,
    backgroundColor: "#007aff",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#ff3b30",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  cartBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 20,
    textAlign: "center",
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cartTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 12,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    marginBottom: 16,
  },
  updateButton: {
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
