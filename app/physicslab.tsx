// LightAndElectrons.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { MotiView } from "moti";

const { width } = Dimensions.get("window");

export default function LightAndElectrons() {
  const [shine, setShine] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Light & Electrons Experiments</Text>

      {/* Experiment 1: Reflection */}
      <Text style={styles.title}>1. Reflection of Light</Text>
      <View style={styles.mirrorBox}>
        <MotiView
          from={{ translateX: 0, translateY: 0 }}
          animate={{ translateX: shine ? 100 : 0, translateY: shine ? 100 : 0 }}
          transition={{ type: "timing", duration: 2000 }}
          style={styles.lightRay}
        />
        <View style={styles.mirror} />
      </View>

      {/* Experiment 2: Photoelectric Effect */}
      <Text style={styles.title}>2. Photoelectric Effect</Text>
      <TouchableOpacity
        onPress={() => setShine(!shine)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {shine ? "Stop Light" : "Shine Light"}
        </Text>
      </TouchableOpacity>

      <View style={styles.experimentBox}>
        {/* Incoming photons */}
        {shine &&
          [...Array(3)].map((_, i) => (
            <MotiView
              key={i}
              from={{ translateX: 0 }}
              animate={{ translateX: 120 }}
              transition={{ type: "timing", duration: 2000, delay: i * 400 }}
              style={styles.photon}
            />
          ))}

        {/* Emitted electrons */}
        {shine &&
          [...Array(2)].map((_, i) => (
            <MotiView
              key={`e-${i}`}
              from={{ translateY: 0 }}
              animate={{ translateY: -80 }}
              transition={{ type: "timing", duration: 1500, delay: i * 700 }}
              style={styles.electron}
            />
          ))}

        <View style={styles.metalPlate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    color: "#0ff",
    marginVertical: 10,
  },
  mirrorBox: {
    width: width * 0.8,
    height: 150,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  mirror: {
    width: 4,
    height: 100,
    backgroundColor: "#0ff",
    position: "absolute",
    right: 50,
    top: 20,
  },
  lightRay: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "yellow",
  },
  experimentBox: {
    width: width * 0.8,
    height: 180,
    backgroundColor: "#222",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  photon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "yellow",
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  electron: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "cyan",
    position: "absolute",
    bottom: 20,
    right: 60,
  },
  metalPlate: {
    width: "100%",
    height: 20,
    backgroundColor: "#555",
    position: "absolute",
    bottom: 0,
  },
  button: {
    backgroundColor: "#0ff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#111",
  },
});
