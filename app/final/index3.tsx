import React, { useState } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Modal,
  ScrollView,
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

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;

const ProductCard = ({
  item,
  onQuantityChange,
  onChangeProduct,
}: {
  item: Product;
  onQuantityChange: (id: string, qty: number) => void;
  onChangeProduct: (id: string) => void;
}) => {
  const [quantity, setQuantity] = useState(0);

  const updateQuantity = (newQty: number) => {
    const safeQty = Math.max(newQty, 0);
    setQuantity(safeQty);
    onQuantityChange(item.id, safeQty);
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.price}>${item.price.toFixed(2)}</Text>

      {/* Quantity Selector */}
      <View style={styles.quantityRow}>
        <TouchableOpacity
          style={styles.qtyButton}
          onPress={() => updateQuantity(quantity - 1)}
        >
          <Text style={styles.qtyButtonText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.qtyText}>{quantity}</Text>

        <TouchableOpacity
          style={styles.qtyButton}
          onPress={() => updateQuantity(quantity + 1)}
        >
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Add to Cart */}
      <TouchableOpacity
        style={[styles.button, quantity === 0 && { backgroundColor: "#ccc" }]}
        onPress={() => onQuantityChange(item.id, quantity)} // Just keep quantity update here
        disabled={quantity === 0}
      >
        <Text style={styles.buttonText}>+Cart</Text>
      </TouchableOpacity>

      {/* Change Product */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ff9500", marginTop: 8 }]}
        onPress={() => onChangeProduct(item.id)}
      >
        <Text style={styles.buttonText}>Change</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function Marketplace() {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [productList, setProductList] = useState<Product[]>(initialProducts);

  // Payment Modal State
  const [paymentVisible, setPaymentVisible] = useState(false);

  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleQuantityChange = (id: string, qty: number) => {
    setCart((prev) => {
      const updated = { ...prev, [id]: qty };
      if (qty === 0) delete updated[id];
      return updated;
    });
  };

  const handleChangeProduct = (id: string) => {
    setProductList((prevList) =>
      prevList.map((product) =>
        product.id === id
          ? {
              ...product,
              name: "RANGE_ROVER",
              price: 2000,
              image: "https://xlijah.com/pics/range_rover.jpg",
            }
          : product
      )
    );
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // Payment submit handler (just fake here)
  const handlePaymentSubmit = () => {
    if (cardNumber.length < 16 || expiry.length < 4 || cvv.length < 3) {
      alert("Please enter valid payment details.");
      return;
    }
    alert("Payment successful! Thank you for your purchase.");
    setPaymentVisible(false);

    // Clear payment form
    setCardNumber("");
    setExpiry("");
    setCvv("");

    // Clear cart after payment
    setCart({});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Market</Text>

      <FlatList
        data={productList}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onQuantityChange={handleQuantityChange}
            onChangeProduct={handleChangeProduct}
          />
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
        animationType="slide"
        transparent
        onRequestClose={() => setPaymentVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Payment Details</Text>

            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                keyboardType="number-pad"
                maxLength={16}
                value={cardNumber}
                onChangeText={setCardNumber}
              />
              <TextInput
                style={styles.input}
                placeholder="Expiry MM/YY"
                maxLength={5}
                value={expiry}
                onChangeText={setExpiry}
              />
              <TextInput
                style={styles.input}
                placeholder="CVV"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                value={cvv}
                onChangeText={setCvv}
              />

              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={handlePaymentSubmit}
              >
                <Text style={styles.buttonText}>Pay Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#888", marginTop: 12 }]}
                onPress={() => setPaymentVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2", paddingTop: 50 },
  header: { fontSize: 26, fontWeight: "bold", paddingHorizontal: 16, paddingBottom: 10 },
  list: { paddingHorizontal: 10, paddingBottom: 20 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 10,
    width: CARD_WIDTH,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  image: { width: CARD_WIDTH - 24, height: CARD_WIDTH - 24, borderRadius: 12 },
  title: { fontSize: 16, marginTop: 10, fontWeight: "600", textAlign: "center" },
  price: { fontSize: 16, color: "#00a650", fontWeight: "bold", marginTop: 6 },

  button: {
    backgroundColor: "#007aff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  buttonText: { color: "#fff", fontWeight: "600", textAlign: "center" },

  quantityRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyButton: {
    backgroundColor: "#007aff",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  qtyText: { marginHorizontal: 12, fontSize: 16, fontWeight: "600" },

  // Floating cart icon
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
  cartBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  cartBadgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
});
