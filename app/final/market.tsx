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
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "./firebase"; // Firestore config
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  sellerEmail: string;
  description?: string;
};

export default function MyStore({ currentUserEmail }: { currentUserEmail: string }) {
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const q = query(collection(db, "products"), where("sellerEmail", "==", currentUserEmail));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyProducts(products as Product[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUserEmail]);

  const handleDelete = async (id: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "products", id));
        },
      },
    ]);
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setName(product.name);
    setPrice(product.price.toString());
    setImage(product.image);
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!productToEdit) return;
    const docRef = doc(db, "products", productToEdit.id);
    await updateDoc(docRef, {
      name,
      price: Number(price),
      image,
    });
    setEditModal(false);
    setProductToEdit(null);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, marginTop: 50 }} size="large" color="#25D366" />;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f2f2f2" }]}>
      <Text style={[styles.header, { color: isDark ? "#fff" : "#000" }]}>My Store</Text>

      <FlatList
        data={myProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: isDark ? "#1c1c1e" : "#fff" }]}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[styles.price, { color: isDark ? "#00ff7f" : "#00a650" }]}>${item.price}</Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.button, { flex: 1, marginRight: 4, paddingVertical: 6 }]}>
                <Text style={[styles.buttonText, { fontSize: 14 }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.button, { flex: 1, marginLeft: 4, backgroundColor: "#ff3b30", paddingVertical: 6 }]}>
                <Text style={[styles.buttonText, { fontSize: 14 }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Edit Modal */}
      {editModal && (
        <Modal visible={true} transparent animationType="slide">
          <ScrollView contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <View style={[styles.modalContent, { width: "90%" }]}>
              <Text style={styles.modalTitle}>Edit Product</Text>
              <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
              <TextInput placeholder="Price" value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />
              <TextInput placeholder="Image URL" value={image} onChangeText={setImage} style={styles.input} />

              <TouchableOpacity style={styles.button} onPress={saveEdit}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#aaa", marginTop: 12 }]} onPress={() => setEditModal(false)}>
                <Text style={[styles.buttonText, { color: "#333" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
      )}
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
  button: { marginTop: 8, backgroundColor: "#007aff", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  modalContent: { borderRadius: 16, padding: 20, backgroundColor: "#fff" },
  modalTitle: { fontSize: 28, fontWeight: "900", marginBottom: 20, textAlign: "center" },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 18, marginBottom: 16, backgroundColor: "#eee" },
});
