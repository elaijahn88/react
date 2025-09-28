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
  Alert,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  updateLink: string;
};

type PaymentCardType = {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
};

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
  { id: "7", name: "MacBook Pro", price: 2400, image: "https://xlijah.com/pics/chemicals.jpg", updateLink: "http://xlijah.com/pics/pics/mac.jpeg" },
  { id: "8", name: "Canon DSLR", price: 1200, image: "https://xlijah.com/pics/pics/lenovo.jpg", updateLink: "http://xlijah.com/pics/pics/lenovo.jpg" },
  { id: "9", name: "Fitbit Charge", price: 130, image: "https://xlijah.com/pics/pics/guns.jpeg", updateLink: "http://xlijah.com/pics/pics/chemicals.jpeg" },
  { id: "10", name: "Google Pixel", price: 700, image: "https://xlijah.com/pics/apple_watch.jpg", updateLink: "http://xlijah.com/pics/pics/guns.jpeg" },
];

const fallbackImage = "https://xlijah.com/pics/pics/notebook.jpeg";

// --- AddCardModal component ---
import { Modal, TextInput, ActivityIndicator } from "react-native";

const AddCardModal = ({ visible, onClose, onAddCard, isDark }: { visible: boolean; onClose: () => void; onAddCard: (card: PaymentCardType) => void; isDark: boolean }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");

  const handleAdd = () => {
    if (!cardNumber || !cardHolder || !expiry) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (cardNumber.length < 16) {
      Alert.alert("Error", "Card number must be at least 16 digits");
      return;
    }
    const maskedNumber = "**** **** **** " + cardNumber.slice(-4);
    onAddCard({
      id: Math.random().toString(36).substring(7),
      cardNumber: maskedNumber,
      cardHolder,
      expiry,
    });
    setCardNumber("");
    setCardHolder("");
    setExpiry("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={[modalStyles.overlay, { backgroundColor: isDark ? "#000a" : "#0006" }]}>
        <View style={[modalStyles.container, { backgroundColor: isDark ? "#222" : "#fff" }]}>
          <Text style={[modalStyles.title, { color: isDark ? "#fff" : "#000" }]}>Add New Card</Text>
          <TextInput
            placeholder="Card Number"
            placeholderTextColor={isDark ? "#aaa" : "#888"}
            style={[modalStyles.input, { color: isDark ? "#fff" : "#000" }]}
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={setCardNumber}
            maxLength={16}
          />
          <TextInput
            placeholder="Card Holder Name"
            placeholderTextColor={isDark ? "#aaa" : "#888"}
            style={[modalStyles.input, { color: isDark ? "#fff" : "#000" }]}
            value={cardHolder}
            onChangeText={setCardHolder}
          />
          <TextInput
            placeholder="Expiry (MM/YY)"
            placeholderTextColor={isDark ? "#aaa" : "#888"}
            style={[modalStyles.input, { color: isDark ? "#fff" : "#000" }]}
            value={expiry}
            onChangeText={setExpiry}
            maxLength={5}
          />
          <View style={modalStyles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={[modalStyles.button, { backgroundColor: "#888" }]}>
              <Text style={modalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAdd} style={[modalStyles.button, { backgroundColor: "#007aff" }]}>
              <Text style={modalStyles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  container: {
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

// --- PaymentCardItem component ---
const PaymentCardItem = ({ card, isDark, onPay }: { card: PaymentCardType; isDark: boolean; onPay: (card: PaymentCardType) => void }) => {
  return (
    <TouchableOpacity
      style={[paymentCardStyles.card, { backgroundColor: isDark ? "#333" : "#fff", borderColor: isDark ? "#555" : "#ccc" }]}
      onPress={() => onPay(card)}
    >
      <Text style={[paymentCardStyles.cardNumber, { color: isDark ? "#fff" : "#000" }]}>{card.cardNumber}</Text>
      <Text style={[paymentCardStyles.cardHolder, { color: isDark ? "#ccc" : "#555" }]}>{card.cardHolder}</Text>
      <Text style={[paymentCardStyles.expiry, { color: isDark ? "#ccc" : "#555" }]}>{card.expiry}</Text>
    </TouchableOpacity>
  );
};

const paymentCardStyles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardHolder: {
    fontSize: 14,
    marginTop: 4,
  },
  expiry: {
    fontSize: 14,
    marginTop: 2,
  },
});

// --- ProductCard component ---
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
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
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
  const [paymentCards, setPaymentCards] = useState<PaymentCardType[]>([
    {
      id: "card1",
      cardNumber: "**** **** **** 4242",
      cardHolder: "John Doe",
      expiry: "12/25",
    },
  ]);
  const [addCardVisible, setAddCardVisible] = useState(false);
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

  const handleAddCard = (card: PaymentCardType) => {
    setPaymentCards((prev) => [...prev, card]);
  };

  const handlePay = (card: PaymentCardType) => {
    if (Object.keys(cart).length === 0) {
      Alert.alert("Cart is empty", "Add some products before paying.");
      return;
    }
    Alert.alert("Payment", `Paying with card ${card.cardNumber}`);
    // TODO: integrate real payment API here
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f2f2f2" }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onQuantityChange={handleQuantityChange}
            onUpdate={handleUpdate}
            isDark={isDark}
          />
        )}
      />

      {/* Payment Methods Section */}
      <View style={{ paddingHorizontal: 20, marginTop: 10, marginBottom: 30 }}>
        <Text style={[styles.subHeader, { color: isDark ? "#fff" : "#000" }]}>Payment Methods</Text>

        {paymentCards.length === 0 && (
          <Text style={{ color: isDark ? "#ccc" : "#555", marginVertical: 8 }}>No payment cards added yet.</Text>
        )}

        {paymentCards.map((card) => (
          <PaymentCardItem
            key={card.id}
            card={card}
            isDark={isDark}
            onPay={handlePay}
          />
        ))}

        <TouchableOpacity
          style={[styles.addCardButton, { backgroundColor: "#28a745", marginTop: 16 }]}
          onPress={() => setAddCardVisible(true)}
        >
          <Text style={styles.addCardButtonText}>+ Add New Card</Text>
        </TouchableOpacity>
      </View>

      <AddCardModal
        visible={addCardVisible}
        onClose={() => setAddCardVisible(false)}
        onAddCard={handleAddCard}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: CARD_WIDTH - 24,
    height: CARD_WIDTH - 24,
    borderRadius: 12,
  },
  title: {
    marginTop: 8,
    fontWeight: "700",
    fontSize: 16,
  },
  price: {
    marginTop: 4,
    fontWeight: "700",
  },
  quantityRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: "700",
    fontSize: 18,
  },
  qtyText: {
    fontWeight: "700",
    fontSize: 16,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#007aff",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  updateButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  addCardButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  addCardButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
