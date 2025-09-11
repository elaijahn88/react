// App.tsx
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  View,
  Text,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

type RootStackParamList = {
  Marketplace: undefined;
  ProductDetail: { product: Product };
};

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Dummy product data
const dummyProducts: Product[] = [
  {
    id: "1",
    title: "iPhone 14 Pro",
    price: 999,
    image: "https://via.placeholder.com/200",
    description: "Brand new iPhone 14 Pro in excellent condition.",
  },
  {
    id: "2",
    title: "Gaming Laptop",
    price: 1200,
    image: "https://via.placeholder.com/200",
    description: "High performance gaming laptop.",
  },
];

// Home (Buy Products)
function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <FlatList
        data={dummyProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ProductDetail", { product: item })}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>${item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Product details
function ProductDetailScreen({ route }: any) {
  const { product } = route.params;
  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.bigImage} />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.price}>${product.price}</Text>
      <Text style={styles.desc}>{product.description}</Text>
      <Button
        title="Buy Now"
        onPress={() => alert("Purchase feature coming soon!")}
      />
    </View>
  );
}

// Sell product page
function SellScreen() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");

  const handleAdd = () => {
    alert(`Product Added: ${title}, $${price}`);
    setTitle("");
    setPrice("");
    setDesc("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Product Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
        style={styles.input}
      />
      <Button title="Add Product" onPress={handleAdd} />
    </View>
  );
}

// Profile page
function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Button title="Logout" onPress={() => alert("Logout feature coming soon!")} />
    </View>
  );
}

// Bottom Tabs
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sell" component={SellScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Marketplace" component={MainTabs} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  image: { width: "100%", height: 150, borderRadius: 10 },
  bigImage: { width: "100%", height: 250, borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginTop: 5 },
  price: { fontSize: 16, color: "green", marginVertical: 5 },
  desc: { fontSize: 14, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
