import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";  // ✅ Your firebase file

// Types
type User = { email: string; name: string; uid: string };
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  sellerEmail: string;
  sellerName: string;
  createdAt: any;
  status: "active" | "sold" | "archived";
};
type Cart = { [productId: string]: number };

// Categories
const categories = ["All", "Electronics", "Furniture", "Clothing", "Books", "Other"];

const EnhancedMarketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [address, setAddress] = useState("");
  const [cartModalVisible, setCartModalVisible] = useState(false);

  // Product creation states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [condition, setCondition] = useState("New");
  const [location, setLocation] = useState("");

  const cartAnimation = useRef(new Animated.Value(0)).current;

  // Fetch user
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const fetchUserProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUser({ ...(userDoc.data() as User), uid: currentUser.uid });
          } else {
            setUser({
              email: currentUser.email!,
              name: currentUser.displayName || "Anonymous",
              uid: currentUser.uid,
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };
      fetchUserProfile();
    }
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const allProducts: Product[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, "id">),
        }));
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Search + filter
  useEffect(() => {
    let filtered = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    setFilteredProducts(filtered);
  }, [search, selectedCategory, products]);

  // Add product
  const addProduct = async () => {
    if (!name.trim() || !price.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    try {
      await addDoc(collection(db, "products"), {
        name: name.trim(),
        price: Number(price),
        image: image.trim(),
        description: description.trim(),
        category,
        condition,
        location: location.trim(),
        sellerEmail: user?.email,
        sellerName: user?.name,
        createdAt: serverTimestamp(),
        status: "active",
      });
      Alert.alert("Success", "Product added!");
      setName("");
      setPrice("");
      setImage("");
      setDescription("");
      setLocation("");
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Error", "Failed to add product");
    }
  };

  // Cart
  const addToCart = (productId: string) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    Animated.sequence([
      Animated.timing(cartAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(cartAnimation, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[productId] > 1) updated[productId]--;
      else delete updated[productId];
      return updated;
    });
  };

  // Checkout
  const checkout = () => {
    if (!cardNumber || !address) {
      Alert.alert("Error", "Enter payment and shipping details");
      return;
    }
    Alert.alert("Success", "Order placed!");
    setCart({});
    setPaymentModalVisible(false);
    setCartModalVisible(false);
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Marketplace</Text>

      {/* 🔎 Search */}
      <TextInput
        style={styles.search}
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
      />

      {/* 🏷️ Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.category, selectedCategory === cat && styles.categorySelected]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={styles.categoryText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 📦 Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.product}
            onPress={() => {
              setProductDetail(item);
              setModalVisible(true);
            }}
          >
            <Image
              source={{ uri: item.image || "https://xlijah.com/pics/iphone.jpg" }}
              style={styles.image}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* 🛒 Floating Cart */}
      <Animated.View
        style={[
          styles.cart,
          { transform: [{ scale: cartAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }] },
        ]}
      >
        <TouchableOpacity onPress={() => setCartModalVisible(true)}>
          <Text style={styles.cartText}>🛒 {totalItems}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginVertical: 10, textAlign: "center" },
  search: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 10 },
  categories: { flexDirection: "row", marginBottom: 10 },
  category: { padding: 8, borderWidth: 1, borderColor: "#ccc", borderRadius: 20, marginRight: 8 },
  categorySelected: { backgroundColor: "#007BFF" },
  categoryText: { color: "#000" },
  product: { flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderColor: "#eee" },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: "bold" },
  productPrice: { fontSize: 14, color: "green" },
  cart: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#007BFF", padding: 10, borderRadius: 30 },
  cartText: { color: "#fff", fontWeight: "bold" },
});

export default EnhancedMarketplace;
