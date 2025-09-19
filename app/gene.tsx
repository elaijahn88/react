import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Dimensions,
  ScrollView
} from "react-native";

const { width } = Dimensions.get("window");

type Experiment = {
  id: string;
  title: string;
  description: string;
  status: "completed" | "running" | "planned";
};

const experiments: Experiment[] = [
  {
    id: "1",
    title: "Gene Expression Study",
    description: "Analysis of gene expression under microgravity.",
    status: "completed",
  },
  {
    id: "2",
    title: "Protein Structure Mapping",
    description: "Examining protein folding in space environment.",
    status: "running",
  },
  {
    id: "3",
    title: "DNA Repair Mechanisms",
    description: "Testing DNA repair under radiation exposure.",
    status: "planned",
  },
];

export default function GeneLabScreen() {
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧬 GeneLab Experiments</Text>

      {!selectedExperiment ? (
        <FlatList
          data={experiments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedExperiment(item)}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={[styles.status, styles[item.status]]}>
                {item.status.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <ScrollView style={styles.detailContainer}>
          <Text style={styles.detailTitle}>{selectedExperiment.title}</Text>
          <Text style={styles.detailDesc}>{selectedExperiment.description}</Text>
          <Text style={[styles.status, styles[selectedExperiment.status]]}>
            {selectedExperiment.status.toUpperCase()}
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedExperiment(null)}
          >
            <Text style={styles.backButtonText}>← Back to Experiments</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0c10", // deep black
    padding: 15,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#66fcf1", // teal neon
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1f2833",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    color: "#c5c6c7",
    marginBottom: 10,
  },
  status: {
    fontSize: 13,
    fontWeight: "bold",
    padding: 5,
    borderRadius: 6,
    textAlign: "center",
    overflow: "hidden",
    width: 100,
  },
  completed: {
    backgroundColor: "#45a29e",
    color: "#fff",
  },
  running: {
    backgroundColor: "#f39c12",
    color: "#fff",
  },
  planned: {
    backgroundColor: "#e74c3c",
    color: "#fff",
  },
  detailContainer: {
    flex: 1,
    padding: 10,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  detailDesc: {
    fontSize: 16,
    marginBottom: 15,
    color: "#c5c6c7",
  },
  backButton: {
    backgroundColor: "#45a29e",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
