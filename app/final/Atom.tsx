import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
  Alert,
  SafeAreaView,
  StatusBar,
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
import { db, auth } from "../firebase";

const { width } = Dimensions.get("window");

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
  const [cartModalVisible, setCartModalVisible] = useState(false);

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

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  // 🧱 UI
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* 🛍️ Header */}
        <Text style={styles.header}>Marketplace</Text>

        {/* 🔎 Search */}
        <TextInput
          style={styles.search}
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#888"
        />

        {/* 🏷️ Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.category,
                selectedCategory === cat && styles.categorySelected,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 📦 Product List */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => {
                setProductDetail(item);
                setModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri: item.image || "https://xlijah.com/pics/iphone.jpg",
                }}
                style={styles.image}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>${item.price}</Text>
                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={() => addToCart(item.id)}
                >
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* 🛒 Floating Cart */}
        <Animated.View
          style={[
            styles.cartButton,
            {
              transform: [
                {
                  scale: cartAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={() => setCartModalVisible(true)}>
            <Text style={styles.cartText}>🛒 {totalItems}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 12,
    color: "#333",
  },
  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  categories: {
    marginBottom: 10,
  },
  category: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  categorySelected: {
    backgroundColor: "#007BFF",
    borderColor: "#007BFF",
  },
  categoryText: {
    color: "#333",
    fontSize: 14,
  },
  categoryTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 6,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  image: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 8,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  productPrice: {
    fontSize: 15,
    color: "green",
    marginVertical: 4,
  },
  addToCartBtn: {
    backgroundColor: "#007BFF",
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
  },
  addToCartText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  cartButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 5,
  },
  cartText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EnhancedMarketplace;
