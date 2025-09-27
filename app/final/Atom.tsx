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
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  updateLink: string;
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;

const phoneNumber = "0746524088";
const callSeller = () => {
  Alert.alert("Call Seller", `Calling ${phoneNumber}`);
};

const initialProducts: Product[] = [
  { id: "1", name: "Nike Sneakers", price: 120, image: "https://xlijah.com/pics/sneaker.jpg", updateLink: "http://xlijah.com/pics/pics/mac.jpeg" },
  { id: "2", name: "Apple Watch", price: 250, image: "https://xlijah.com/pics/apple_watch.jpg", updateLink: "http://xlijah.com/pics/pics/lenovo.jpg" },
  { id: "3", name: "Bluetooth Headphones", price: 80, image: "https://xlijah.com/pics/bluetooth.webp", updateLink: "http://xlijah.com/pics/pics/chemicals.jpeg" },
  { id: "4", name: "Leather Bag", price: 150, image: "https://xlijah.com/pics/bag.webp", updateLink: "http://xlijah.com/pics/pics/guns.jpeg" },
  { id: "5", name: "Sunglasses", price: 50, image: "https://xlijah.com/pics/sunglasses.jpg", updateLink: "http://xlijah.com/pics/pics/macbook.jpg" },
  { id: "6", name: "iPhone 12", price: 999, image: "https://xlijah.com/pics/iphone.jpg", updateLink: "http://xlijah.com/pics/pics/notebook.jpeg" },
  { id: "7", name: "MacBook Pro", price: 2400, image: "https://xlijah.com/pics/macbook_pro.jpg", updateLink: "http://xlijah.com/pics/pics/mac.jpeg" },
  { id: "8", name: "Canon DSLR", price: 1200, image: "https://xlijah.com/pics/canon_dslr.jpg", updateLink: "http://xlijah.com/pics/pics/lenovo.jpg" },
  { id: "9", name: "Fitbit Charge", price: 130, image: "https://xlijah.com/pics/fitbit_charge.jpg", updateLink: "http://xlijah.com/pics/pics/chemicals.jpeg" },
  { id: "10", name: "Google Pixel", price: 700, image: "https://xlijah.com/pics/google_pixel.jpg", updateLink: "http://xlijah.com/pics/pics/guns.jpeg" },
];

const fallbackImage = "https://xlijah.com/pics/pics/notebook.jpeg";

const ProductCard = ({
  item,
  onQuantityChange,
  onUpdate,
  isDark,
}: {
  item: Product;
  onQuantityChange: (id: string, qty: number) => void;
  onUpdate: (id: string) => void;
  isDark: boolean;
}) => {
  const [quantity, setQuantity] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

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
          source={{ uri: imageError ? fallbackImage : item.image }}
          style={[styles.image, imageLoading ? { display: "none" } : {}]}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      </View>

      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={[styles.price, { color: isDark ? "#00ff7f" : "#00a650" }]}>
        ${item.price.toFixed(2)}
      </Text>

      <View style={styles.quantityRow}>
        <TouchableOpacity style={[styles.qtyButton, { backgroundColor: "#007aff" }]} onPress={() => updateQuantity(quantity - 1)}>
          <Text style={styles.qtyButtonText}>-</Text>
        </TouchableOpacity>

        <Text style={[styles.qtyText, { color: isDark ? "#fff" : "#000" }]}>{quantity}</Text>

        <TouchableOpacity style={[styles.qtyButton, { backgroundColor: "#007aff" }]} onPress={() => updateQuantity(quantity + 1)}>
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, quantity === 0 && { backgroundColor: "#555" }]} onPress={callSeller} disabled={quantity === 0}>
        <Text style={styles.buttonText}>+Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.updateButton, { backgroundColor: "#ff9500", marginTop: 8 }]} onPress={() => onUpdate(item.id)}>
        <Text style={styles.updateButtonText}>Update Product</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
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

  const handleUpdate = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, image: p.updateLink } : p
      )
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f2f2f2" }]}>
      <Text style={[styles.header, { color: isDark ? "#fff" : "#000" }]}>Market</Text>

      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onQuantityChange={handleQuantityChange}
            onUpdate={handleUpdate}
            isDark={isDark}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: { fontSize: 36, fontWeight: "900", marginLeft: 20, marginBottom: 10 },
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
    elevation: 3,
  },
  image: { width: "100%", height: "100%", borderRadius: 12 },
  title: { marginTop: 12, fontWeight: "700", fontSize: 16, textAlign: "center" },
  price: { marginTop: 4, fontWeight: "700", fontSize: 16 },
  quantityRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  qtyButton: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  qtyButtonText: { color: "#fff", fontSize: 22, fontWeight: "600" },
  qtyText: { marginHorizontal: 12, fontSize: 18, fontWeight: "700" },
  button: { marginTop: 16, backgroundColor: "#007aff", paddingVertical: 12, borderRadius: 12, width: "100%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  updateButton: { width: "100%", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  updateButtonText: { color: "#fff", fontWeight: "700" },
});
