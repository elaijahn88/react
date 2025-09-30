import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen({ route }) {
  const { profile } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {profile.name} 👋</Text>
      <Text>Email: {profile.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});
