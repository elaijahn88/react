import React, { useState } from "react";
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  TouchableOpacity, 
  Text as RNText,
  Modal,
  ScrollView
} from "react-native";
import { Canvas, Circle, Text, Rect } from "@shopify/react-native-skia";

const ELEMENT_SIZE = 60;
const HORIZONTAL_PADDING = 2;
const VERTICAL_PADDING = 2;

const typeColors: { [key: string]: string } = {
  "nonmetal": "#f44336",
  "noble gas": "#9c27b0",
  "alkali metal": "#ff9800",
  "alkaline earth metal": "#ffeb3b",
  "metalloid": "#8bc34a",
  "halogen": "#00bcd4",
  "metal": "#2196f3",
  "transition metal": "#3f51b5",
  "lanthanide": "#ffc107",
  "actinide": "#795548"
};

interface Element {
  number: number;
  symbol: string;
  name: string;
  type: string;
  atomicMass: string;
  electronConfiguration: string;
  discovered: string;
}

const elements: Element[] = [
  { number: 1, symbol: "H", name: "Hydrogen", type: "nonmetal", atomicMass: "1.008", electronConfiguration: "1s1", discovered: "1766" },
  { number: 2, symbol: "He", name: "Helium", type: "noble gas", atomicMass: "4.0026", electronConfiguration: "1s2", discovered: "1895" },
  { number: 3, symbol: "Li", name: "Lithium", type: "alkali metal", atomicMass: "6.94", electronConfiguration: "[He] 2s1", discovered: "1817" },
  { number: 4, symbol: "Be", name: "Beryllium", type: "alkaline earth metal", atomicMass: "9.0122", electronConfiguration: "[He] 2s2", discovered: "1798" },
  { number: 5, symbol: "B", name: "Boron", type: "metalloid", atomicMass: "10.81", electronConfiguration: "[He] 2s2 2p1", discovered: "1808" },
  { number: 6, symbol: "C", name: "Carbon", type: "nonmetal", atomicMass: "12.011", electronConfiguration: "[He] 2s2 2p2", discovered: "Ancient" },
  { number: 7, symbol: "N", name: "Nitrogen", type: "nonmetal", atomicMass: "14.007", electronConfiguration: "[He] 2s2 2p3", discovered: "1772" },
  { number: 8, symbol: "O", name: "Oxygen", type: "nonmetal", atomicMass: "15.999", electronConfiguration: "[He] 2s2 2p4", discovered: "1774" },
  { number: 9, symbol: "F", name: "Fluorine", type: "halogen", atomicMass: "18.998", electronConfiguration: "[He] 2s2 2p5", discovered: "1810" },
  { number: 10, symbol: "Ne", name: "Neon", type: "noble gas", atomicMass: "20.180", electronConfiguration: "[He] 2s2 2p6", discovered: "1898" },
];

const periodicTableLayout = [
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [3,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,11,12],
  [5,6,7,8,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

export default function PeriodicTableFull() {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const windowWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <Canvas style={{ width: windowWidth, height: 400 }}>
        <Rect x={0} y={0} width={windowWidth} height={400} color="#f5f5f5" />
        {periodicTableLayout.map((row, rowIndex) =>
          row.map((num, colIndex) => {
            if (num === 0) return null;
            const element = elements.find(e => e.number === num);
            if (!element) return null;
            const x = colIndex * (ELEMENT_SIZE + HORIZONTAL_PADDING) + ELEMENT_SIZE/2;
            const y = rowIndex * (ELEMENT_SIZE + VERTICAL_PADDING) + ELEMENT_SIZE/2;
            return (
              <Circle
                key={element.number}
                cx={x}
                cy={y}
                r={ELEMENT_SIZE/2}
                color={typeColors[element.type]}
              />
            );
          })
        )}
        {periodicTableLayout.map((row, rowIndex) =>
          row.map((num, colIndex) => {
            if (num === 0) return null;
            const element = elements.find(e => e.number === num);
            if (!element) return null;
            const x = colIndex * (ELEMENT_SIZE + HORIZONTAL_PADDING) + ELEMENT_SIZE/2;
            const y = rowIndex * (ELEMENT_SIZE + VERTICAL_PADDING) + ELEMENT_SIZE/2;
            return (
              <Text
                key={"text"+element.number}
                x={x-10}
                y={y-5}
                text={element.symbol}
                color="#000"
                size={12}
              />
            );
          })
        )}
      </Canvas>

      <View style={[StyleSheet.absoluteFillObject, { top: 0, left: 0 }]}>
        {periodicTableLayout.map((row, rowIndex) =>
          row.map((num, colIndex) => {
            if (num === 0) return null;
            const element = elements.find(e => e.number === num);
            if (!element) return null;
            const x = colIndex * (ELEMENT_SIZE + HORIZONTAL_PADDING);
            const y = rowIndex * (ELEMENT_SIZE + VERTICAL_PADDING);
            return (
              <TouchableOpacity
                key={"touch"+element.number}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: ELEMENT_SIZE,
                  height: ELEMENT_SIZE,
                }}
                onPress={() => setSelectedElement(element)}
              />
            );
          })
        )}
      </View>

      <Modal visible={!!selectedElement} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedElement && (
              <ScrollView>
                <RNText style={styles.modalTitle}>
                  {selectedElement.number}. {selectedElement.name} ({selectedElement.symbol})
                </RNText>
                <RNText style={styles.elementType}>{selectedElement.type}</RNText>
                <RNText style={styles.elementProperty}>
                  Atomic Mass: {selectedElement.atomicMass}
                </RNText>
                <RNText style={styles.elementProperty}>
                  Electron Configuration: {selectedElement.electronConfiguration}
                </RNText>
                <RNText style={styles.elementProperty}>
                  Discovered: {selectedElement.discovered}
                </RNText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedElement(null)}
                >
                  <RNText style={styles.closeButtonText}>Close</RNText>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  elementType: { fontSize: 16, color: "#666", marginBottom: 10 },
  elementProperty: { fontSize: 14, color: "#333", marginBottom: 8 },
  closeButton: { backgroundColor: "#f44336", padding: 12, borderRadius: 10, alignItems: "center", marginTop: 10 },
  closeButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
