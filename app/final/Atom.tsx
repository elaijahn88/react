import React, { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  updateLink: string;
}

const initialProducts: Product[] = [
  { id: "1", name: "Nike Sneakers", price: 120, image: "https://xlijah.com/pics/sneaker.jpg", updateLink: "http://xlijah.com/pics/pics/mac.jpeg" },
  { id: "2", name: "Apple Watch", price: 250, image: "https://xlijah.com/pics/apple_watch.jpg", updateLink: "http://xlijah.com/pics/pics/lenovo.jpg" },
  { id: "3", name: "Bluetooth Headphones", price: 80, image: "https://xlijah.com/pics/bluetooth.webp", updateLink: "http://xlijah.com/pics/pics/chemicals.jpeg" },
  { id: "4", name: "Leather Bag", price: 150, image: "https://xlijah.com/pics/bag.webp", updateLink: "http://xlijah.com/pics/pics/guns.jpeg" },
  { id: "5", name: "Sunglasses", price: 50, image: "https://xlijah.com/pics/sunglasses.jpg", updateLink: "http://xlijah.com/pics/pics/macbook.jpg" },
  { id: "6", name: "iPhone 12", price: 999, image: "https://xlijah.com/pics/iphone.jpg", updateLink: "http://xlijah.com/pics/pics/notebook.jpeg" },
  { id: "7", name: "MacBook Pro", price: 2400, image: "https://xlijah.com/pics/pics/chemicals.jpeg", updateLink: "http://xlijah.com/pics/pics/mac.jpeg" },
  { id: "8", name: "Canon DSLR", price: 1200, image: "https://xlijah.com/pics/pics/lenovo.jpg", updateLink: "http://xlijah.com/pics/pics/lenovo.jpg" },
  { id: "9", name: "Fitbit Charge", price: 130, image: "https://xlijah.com/pics/pics/guns.jpeg", updateLink: "http://xlijah.com/pics/pics/chemicals.jpeg" },
  { id: "10", name: "Google Pixel", price: 700, image: "https://xlijah.com/pics/apple_watch.jpg", updateLink: "http://xlijah.com/pics/pics/guns.jpeg" },
];

export default function Products() {
  const [userEmail, setUserEmail] = useState<string>(""); // empty initially
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) return; // skip if no email

      setLoading(true);
      try {
        const userRef = doc(db, "users", userEmail);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // If user has transactions or products, replace initialProducts
          if (userData?.transactions && userData.transactions.length > 0) {
            setProducts(userData.transactions); // or map to Product[]
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userEmail]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {loading && <ActivityIndicator size="large" color="#25D366" />}
      {!loading && (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ marginVertical: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.name}</Text>
              <Text>${item.price}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
