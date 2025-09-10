import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";

type FashionItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

const fashionItems: FashionItem[] = [
  { id: "1", name: "Summer Dress", price: 49.99, image: "https://picsum.photos/200/300?random=1" },
  { id: "2", name: "Leather Jacket", price: 129.99, image: "https://picsum.photos/200/300?random=2" },
  { id: "3", name: "Sneakers", price: 89.99, image: "https://picsum.photos/200/300?random=3" },
  { id: "4", name: "Casual Shirt", price: 39.99, image: "https://picsum.photos/200/300?random=4" },
  { id: "5", name: "Denim Jeans", price: 69.99, image: "https://picsum.photos/200/300?random=5" },
];

export default function FashionPage() {
  const renderItem = ({ item }: { item: FashionItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.buyText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trending Fashion</Text>
      <FlatList
        data={fashionItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    width: 180,
    marginRight: 15,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    elevation: 2,
  },
  image: { width: "100%", height: 220 },
  name: { fontSize: 16, fontWeight: "600", margin: 10 },
  price: { fontSize: 14, color: "#555", marginHorizontal: 10 },
  buyButton: {
    backgroundColor: "#007AFF",
    margin: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  buyText: { color: "#fff", fontWeight: "600" },
});
