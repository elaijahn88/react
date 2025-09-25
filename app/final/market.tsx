import React from 'react';
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';

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
    image: 'https://xlijah.com/pics/sneaker.jpg',
  },
  {
    id: '2',
    name: 'Apple Watch',
    price: 250,
    image: 'https://xlijah.com/pics/apple_watch.jpg',
  },
  {
    id: '3',
    name: 'Bluetooth Headphones',
    price: 80,
    image: 'https://xlijah.com/pics/bluetooth.webp',
  },
  {
    id: '4',
    name: 'Leather Bag',
    price: 150,
    image: 'https://xlijah.com/pics/bag.webp',
  },
  {
    id: '5',
    name: 'Sunglasses',
    price: 50,
    image: 'https://xlijah.com/pics/sunglasses.jpg',
  },
  {
    id: '6',
    name: 'iPhone 12',
    price: 999,
    image: 'https://xlijah.com/pics/iphone.jpg',
  },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2;

const phoneNumber = '256746524088'; // Uganda (+256) international format

// Function to open WhatsApp
const sendWhatsAppMessage = (item: Product) => {
  const message = `Hello, I'm interested in buying *${item.name}* for $${item.price}`;
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device.');
      }
    })
    .catch((err) => console.error('An error occurred', err));
};

const ProductCard = ({ item }: { item: Product }) => (
  <View style={styles.card}>
    <Image source={{ uri: item.image }} style={styles.image} />
    <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
    <Text style={styles.price}>${item.price.toFixed(2)}</Text>
    <TouchableOpacity
      style={styles.button}
      onPress={() => sendWhatsAppMessage(item)}
    >
      <Text style={styles.buttonText}>+Cart</Text>
    </TouchableOpacity>
  </View>
);

export default function Marketplace() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Market</Text>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingTop: 50,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    width: CARD_WIDTH,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // for Android shadow
  },
  image: {
    width: CARD_WIDTH - 24,
    height: CARD_WIDTH - 24,
    borderRadius: 12,
  },
  title: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  price: {
    fontSize: 16,
    color: '#00a650',
    fontWeight: 'bold',
    marginTop: 6,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
