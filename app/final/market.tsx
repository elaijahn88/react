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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

const products: Product[] = [
  { id: "1", name: "Nike Sneakers", price: 120, image: "https://xlijah.com/pics/sneaker.jpg" },
  { id: "2", name: "Apple Watch", price: 250, image: "https://xlijah.com/pics/apple_watch.jpg" },
  { id: "3", name: "Bluetooth Headphones", price: 80, image: "https://xlijah.com/pics/bluetooth.webp" },
  { id: "4", name: "Leather Bag", price: 150, image: "https://xlijah.com/pics/bag.webp" },
  { id: "5", name: "Sunglasses", price: 50, image: "https://xlijah.com/pics/sunglasses.jpg" },
  { id: "6", name: "iPhone 12", price: 999, image: "https://xlijah.com/pics/iphone.jpg" },
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
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleQuantityChange = (id: string, qty: number) => {
    setCart((prev) => {
      const updated = { ...prev, [id]: qty };
      if (qty === 0) delete updated[id];
      return updated;
    });
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f2f2f2" }]}>
      <Text style={[styles.header, { color: isDark ? "#fff" : "#000" }]}>Market</Text>

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
        <TouchableOpacity style={styles.cartIcon} onPress={callSeller}>
          <Ionicons name="cart" size={28} color="#fff" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
        </TouchableOpacity>
      )}
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
});
