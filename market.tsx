import React from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

const products: Product[] = [
  {
    id: '1',
    name: 'Nike Sneakers',
    price: 120,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    name: 'Apple Watch',
    price: 250,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '3',
    name: 'Bluetooth Headphones',
    price: 80,
    image: 'https://via.placeholder.com/150',
  },
];

const ProductCard = ({ item }: { item: Product }) => (
  <TouchableOpacity style={styles.card}>
    <Image source={{ uri: item.image }} style={styles.image} />
    <Text style={styles.title}>{item.name}</Text>
    <Text style={styles.price}>${item.price}</Text>
  </TouchableOpacity>
);

export default function Marketplace() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Marketplace</Text>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { fontSize: 24, fontWeight: 'bold', padding: 16 },
  list: { paddingHorizontal: 10 },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    margin: 10,
    width: '45%',
    alignItems: 'center',
  },
  image: { width: 100, height: 100, borderRadius: 8 },
  title: { fontSize: 16, marginTop: 8, fontWeight: '600' },
  price: { fontSize: 14, marginTop: 4, color: 'green' },
});
