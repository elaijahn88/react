import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";

// --------- Types ---------
type Post = {
  id: string;
  title: string;
  description: string;
};

// --------- Mock Data ---------
const posts: Post[] = [
  { id: "1", title: "Scientific Discovery", description: "New insights into quantum physics." },
  { id: "2", title: "Royal Society Event", description: "Annual Science Symposium 2025." },
  { id: "3", title: "Research Paper", description: "AI in climate modeling." },
];

// --------- Screens ---------
const HomeScreen = () => {
  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Royal Society Feed</Text>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const EventsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.header}>Upcoming Events</Text>
    <Text>- Science Lecture: Genetics & Society</Text>
    <Text>- AI & Ethics Roundtable</Text>
    <Text>- Astronomy Night 2025</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.container}>
    <Text style={styles.header}>My Profile</Text>
    <Text>Name: Dr. Jane Doe</Text>
    <Text>Membership: Fellow of the Royal Society</Text>
    <Text>Interests: Physics, AI, Climate Science</Text>
  </View>
);

// --------- Navigation ---------
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: true }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Events" component={EventsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// --------- Styles ---------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardDesc: { fontSize: 14, color: "#555" },
});
