// ChemistryExperiment.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ChemistryExperiment() {
  const [solutionColor, setSolutionColor] = useState("purple");

  const addAcid = () => setSolutionColor("red");
  const addBase = () => setSolutionColor("blue");
  const reset = () => setSolutionColor("purple");

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chemistry Experiments</Text>

      <View style={[styles.beaker, { backgroundColor: solutionColor }]} />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={addAcid}>
          <Text style={styles.buttonText}>Add Acid</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={addBase}>
          <Text style={styles.buttonText}>Add Base</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={reset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.text}>
        Current solution color: {solutionColor.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    paddingTop: 50,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  beaker: {
    width: 150,
    height: 200,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0ff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#111",
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
});
