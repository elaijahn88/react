import React, { useState } from "react";
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  TouchableOpacity, 
  Text as RNText,
  Modal
} from "react-native";
import { Canvas, Circle, Text, useFont, Rect } from "@shopify/react-native-skia";

// Colors for element types
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

// Enhanced element data with more properties
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
  { number: 11, symbol: "Na", name: "Sodium", type: "alkali metal", atomicMass: "22.990", electronConfiguration: "[Ne] 3s1", discovered: "1807" },
  { number: 12, symbol: "Mg", name: "Magnesium", type: "alkaline earth metal", atomicMass: "24.305", electronConfiguration: "[Ne] 3s2", discovered: "1808" },
  { number: 13, symbol: "Al", name: "Aluminum", type: "metal", atomicMass: "26.982", electronConfiguration: "[Ne] 3s2 3p1", discovered: "1825" },
  { number: 14, symbol: "Si", name: "Silicon", type: "metalloid", atomicMass: "28.085", electronConfiguration: "[Ne] 3s2 3p2", discovered: "1824" },
  { number: 15, symbol: "P", name: "Phosphorus", type: "nonmetal", atomicMass: "30.974", electronConfiguration: "[Ne] 3s2 3p3", discovered: "1669" },
  { number: 16, symbol: "S", name: "Sulfur", type: "nonmetal", atomicMass: "32.06", electronConfiguration: "[Ne] 3s2 3p4", discovered: "Ancient" },
  { number: 17, symbol: "Cl", name: "Chlorine", type: "halogen", atomicMass: "35.45", electronConfiguration: "[Ne] 3s2 3p5", discovered: "1774" },
  { number: 18, symbol: "Ar", name: "Argon", type: "noble gas", atomicMass: "39.948", electronConfiguration: "[Ne] 3s2 3p6", discovered: "1894" },
  // Additional elements would continue here...
];

// Periodic table layout with proper positioning
const periodicTableLayout = [
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2 },
  [3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
  [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
  [55, 56, 57, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
  [87, 88, 89, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118],
  [0, 0, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
  [0, 0, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103],
];

// Grid settings
const ELEMENT_SIZE = 60;
const HORIZONTAL_PADDING = 2;
const VERTICAL_PADDING = 2;
const LANTHANIDE_OFFSET = 2;
const ACTINIDE_OFFSET = 2;

export default function PeriodicTableFull() {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const font = useFont(require("./assets/fonts/Roboto-Regular.ttf"), 10);

  const renderElement = (elementNumber: number, row: number, col: number) => {
    if (elementNumber === 0) return null;
    
    const element = elements.find(el => el.number === elementNumber);
    if (!element) return null;

    const x = col * (ELEMENT_SIZE + HORIZONTAL_PADDING) + ELEMENT_SIZE / 2;
    const y = row * (ELEMENT_SIZE + VERTICAL_PADDING) + ELEMENT_SIZE / 2;
    
    return (
      <TouchableOpacity
        key={element.number}
        onPress={() => setSelectedElement(element)}
        style={{
          position: "absolute",
          left: x - ELEMENT_SIZE / 2,
      top: y - ELEMENT_SIZE / 2,
      width: ELEMENT_SIZE,
      height: ELEMENT_SIZE,
        }}
      >
        <Circle 
          cx={ELEMENT_SIZE / 2} 
          cy={ELEMENT_SIZE / 2} 
          r={ELEMENT_SIZE / 2} 
          color={typeColors[element.type]} 
        />
        {font && (
          <>
            <Text 
              x={ELEMENT_SIZE / 2 - 5} 
              y={ELEMENT_SIZE / 2 - 5} 
              text={element.number.toString()} 
              font={font} 
              color="#000" 
            />
            <Text 
              x={ELEMENT_SIZE / 2 - 7} 
              y={ELEMENT_SIZE / 2 + 15} 
              text={element.symbol} 
              font={font} 
              color="#000" 
            />
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* Render periodic table background */}
        <Rect 
          x={0} 
          y={0} 
          width={Dimensions.get("window").width - 20}
          height={Dimensions.get("window").height - 20}
          color="#f5f5f5"}
        />
        
        {/* Render elements in periodic table layout */}
        {periodicTableLayout.map((row, rowIndex) =>
          row.map((elementNumber, colIndex) =>
            renderElement(elementNumber, rowIndex, colIndex)
          }
        />
      </Canvas>

      {/* Element Detail Modal */}
      <Modal
        visible={!!selectedElement}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedElement && (
              <>
                <RNText style={styles.modalTitle}>
                  {selectedElement.number}. {selectedElement.name} ({selectedElement.symbol})
          </RNText>
                
          {selectedElement && (
            <View style={styles.elementDetails}>
              <RNText style={styles.elementName}>
                {selectedElement.name}
              </RNText>
              <RNText style={styles.elementType}>
                  {selectedElement.type}
                </RNText>
                <RNText style={styles.elementProperty}>
                  Atomic Mass: {selectedElement.atomicMass}
              </RNText>
              <RNText style={styles.elementProperty}>
                  Electron Configuration: {selectedElement.electronConfiguration}
              </RNText>
              <RNText style={styles.elementProperty}>
                  Discovered: {selectedElement.discovered}
              </RNText>
            </View>
          )}
                
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedElement(null)}
          >
            <RNText style={styles.closeButtonText}>Close</RNText>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  canvas: {
    width: Dimensions.get("window").width - 20,
    height: Dimensions.get("window").height - 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  elementDetails: {
    marginBottom: 20,
  },
  elementName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 15,
  },
  elementType: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  elementProperty: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  closeButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
  },
});
