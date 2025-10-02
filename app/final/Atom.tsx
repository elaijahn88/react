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
} from "react-native";
import { db } from "../firebase"; // Firestore config
import { collection, onSnapshot, addDoc } from "firebase/firestore";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  sellerEmail?: string;
  description?: string;
};

export default function MarketplaceApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const [newProductModal, setNewProductModal] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // New Product Form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [processing, setProcessing] = useState(false);

  // Payment form
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [paymentMessage, setPaymentMessage] = useState<
    { type: "error" | "success"; text: string } | null
  >(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const allProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(allProducts as Product[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleQuantityChange = (id: string, qty: number) => {
    setCart((prev) => {
      const updated = { ...prev, [id]: qty };
      if (qty <= 0) delete updated[id];
      return updated;
    });
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = products.find((p) => p.id === id);
    return product ? sum + product.price * qty : sum;
  }, 0);

  const handleSubmitNewProduct = () => {
    if (!name || !price || !image) return alert("All fields required");
    // don't set `processing` here — only open payment modal
    setPaymentVisible(true);
  };

  const handlePayment = () => {
    setPaymentMessage(null);

    // basic validations: card number (16 digits) and cardholder name
    if (cardNumber.replace(/\s/g, "").length !== 16)
      return setPaymentMessage({ type: "error", text: "Card number must be 16 digits." });
    if (!cardName) return setPaymentMessage({ type: "error", text: "Cardholder name required." });

    setProcessing(true);

    setTimeout(async () => {
      setPaymentMessage({ type: "success", text: "Listing payment successful!" });
      try {
        await addDoc(collection(db, "products"), {
          name,
          price: Number(price),
          image,
          sellerEmail: "currentUser@example.com",
          description: "User listed product",
          createdAt: new Date(),
        });
        // reset form
        setName("");
        setPrice("");
        setImage("");
        setCardNumber("");
        setCardName("");
        setNewProductModal(false);
        setPaymentVisible(false);
      } catch (err) {
        console.error(err);
        setPaymentMessage({ type: "error", text: "Failed to list product. Try again." });
      } finally {
        setProcessing(false);
      }
    }, 2000);
  };

  if (loading)
    return <ActivityIndicator style={{ flex: 1, marginTop: 50 }} size="large" color="#25D366" />;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f2f2f2" }]}>
      <Text style={[styles.header, { color: isDark ? "#fff" : "#000" }]}>Marketplace</Text>

      {/* Sell Button */}
      <TouchableOpacity
        style={[styles.button, { marginHorizontal: 20, marginBottom: 10 }]}
        onPress={() => setNewProductModal(true)}
      >
        <Text style={styles.buttonText}>Sell Your Product</Text>
      </TouchableOpacity>

      {/* Products Grid */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: isDark ? "#1c1c1e" : "#fff" }]}>
            <TouchableOpacity onPress={() => setProductDetail(item)}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.price, { color: isDark ? "#00ff7f" : "#00a650" }]}>${item.price}</Text>
            </TouchableOpacity>

            <View style={styles.quantityRow}>
              <TouchableOpacity style={[styles.qtyButton, { backgroundColor: "#007aff" }]} onPress={() => handleQuantityChange(item.id, (cart[item.id] || 0) - 1)}>
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: isDark ? "#fff" : "#000" }]}>{cart[item.id] || 0}</Text>
              <TouchableOpacity style={[styles.qtyButton, { backgroundColor: "#007aff" }]} onPress={() => handleQuantityChange(item.id, (cart[item.id] || 0) + 1)}>
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Product Detail Modal */}
      {productDetail && (
        <Modal visible={!!productDetail} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image source={{ uri: productDetail.image }} style={{ width: 200, height: 200, borderRadius: 12 }} />
              <Text style={styles.modalTitle}>{productDetail.name}</Text>
              <Text style={{ fontWeight: "700", fontSize: 18 }}>${productDetail.price}</Text>
              <Text style={{ marginVertical: 10 }}>{productDetail.description || "No description"}</Text>
              <TouchableOpacity style={styles.button} onPress={() => setProductDetail(null)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* New Product Modal */}
      {newProductModal && (
        <Modal visible={true} transparent animationType="slide">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View style={[styles.modalContent, { maxHeight: "90%" }]}>
                <Text style={styles.modalTitle}>Sell Your Product</Text>
                <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
                <TextInput placeholder="Price" value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />
                <TextInput placeholder="Image URL" value={image} onChangeText={setImage} style={styles.input} />

                <TouchableOpacity style={styles.button} onPress={handleSubmitNewProduct}>
                  <Text style={styles.buttonText}>Submit & Pay</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#aaa", marginTop: 12 }]}
                  onPress={() => {
                    setNewProductModal(false);
                    setPaymentMessage(null);
                    setProcessing(false);
                  }}
                >
                  <Text style={[styles.buttonText, { color: "#333" }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* Payment Modal */}
      <Modal visible={paymentVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <ScrollView>
              <Text style={styles.modalTitle}>Payment</Text>
              <TextInput
                placeholder="Card Number"
                value={cardNumber}
                onChangeText={(t) => {
                  // allow spaces every 4 digits for readability
                  const digits = t.replace(/\D/g, "").slice(0, 16);
                  const spaced = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
                  setCardNumber(spaced);
                }}
                keyboardType="number-pad"
                style={styles.input}
                maxLength={19}
              />
              <TextInput placeholder="Cardholder Name" value={cardName} onChangeText={setCardName} style={styles.input} />

              {paymentMessage && (
                <Text style={{ marginTop: 10, color: paymentMessage.type === "error" ? "red" : "green", fontWeight: "bold", textAlign: "center" }}>
                  {paymentMessage.text}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={handlePayment}
                disabled={processing}
              >
                {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Pay Listing Fee</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#aaa", marginTop: 12 }]}
                onPress={() => {
                  setPaymentVisible(false);
                  setProcessing(false);
                  setPaymentMessage(null);
                }}
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
  header: { fontSize: 32, fontWeight: "900", marginLeft: 20, marginBottom: 10 },
  list: { paddingHorizontal: 12, paddingBottom: 100 },
  card: { width: CARD_WIDTH, borderRadius: 12, padding: 12, margin: 8, alignItems: "center" },
  image: { width: "100%", height: CARD_WIDTH - 24, borderRadius: 12 },
  title: { marginTop: 8, fontWeight: "700", fontSize: 16, textAlign: "center" },
  price: { marginTop: 4, fontWeight: "700", fontSize: 16 },
  quantityRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyButton: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  qtyButtonText: { color: "#fff", fontSize: 22, fontWeight: "600" },
  qtyText: { marginHorizontal: 12, fontSize: 18, fontWeight: "700" },
  button: { marginTop: 16, backgroundColor: "#007aff", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", borderRadius: 16, padding: 20, backgroundColor: "#fff" },
  modalTitle: { fontSize: 28, fontWeight: "900", marginBottom: 20, textAlign: "center" },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 18, marginBottom: 16, backgroundColor: "#eee" },
});
