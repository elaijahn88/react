import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Canvas, Circle, Text, useFont } from "@shopify/react-native-skia";

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

// All 118 elements
const elements = [
  { number: 1, symbol: "H", type: "nonmetal" }, { number: 2, symbol: "He", type: "noble gas" },
  { number: 3, symbol: "Li", type: "alkali metal" }, { number: 4, symbol: "Be", type: "alkaline earth metal" },
  { number: 5, symbol: "B", type: "metalloid" }, { number: 6, symbol: "C", type: "nonmetal" },
  { number: 7, symbol: "N", type: "nonmetal" }, { number: 8, symbol: "O", type: "nonmetal" },
  { number: 9, symbol: "F", type: "halogen" }, { number: 10, symbol: "Ne", type: "noble gas" },
  { number: 11, symbol: "Na", type: "alkali metal" }, { number: 12, symbol: "Mg", type: "alkaline earth metal" },
  { number: 13, symbol: "Al", type: "metal" }, { number: 14, symbol: "Si", type: "metalloid" },
  { number: 15, symbol: "P", type: "nonmetal" }, { number: 16, symbol: "S", type: "nonmetal" },
  { number: 17, symbol: "Cl", type: "halogen" }, { number: 18, symbol: "Ar", type: "noble gas" },
  { number: 19, symbol: "K", type: "alkali metal" }, { number: 20, symbol: "Ca", type: "alkaline earth metal" },
  { number: 21, symbol: "Sc", type: "transition metal" }, { number: 22, symbol: "Ti", type: "transition metal" },
  { number: 23, symbol: "V", type: "transition metal" }, { number: 24, symbol: "Cr", type: "transition metal" },
  { number: 25, symbol: "Mn", type: "transition metal" }, { number: 26, symbol: "Fe", type: "transition metal" },
  { number: 27, symbol: "Co", type: "transition metal" }, { number: 28, symbol: "Ni", type: "transition metal" },
  { number: 29, symbol: "Cu", type: "transition metal" }, { number: 30, symbol: "Zn", type: "transition metal" },
  { number: 31, symbol: "Ga", type: "metal" }, { number: 32, symbol: "Ge", type: "metalloid" },
  { number: 33, symbol: "As", type: "metalloid" }, { number: 34, symbol: "Se", type: "nonmetal" },
  { number: 35, symbol: "Br", type: "halogen" }, { number: 36, symbol: "Kr", type: "noble gas" },
  { number: 37, symbol: "Rb", type: "alkali metal" }, { number: 38, symbol: "Sr", type: "alkaline earth metal" },
  { number: 39, symbol: "Y", type: "transition metal" }, { number: 40, symbol: "Zr", type: "transition metal" },
  { number: 41, symbol: "Nb", type: "transition metal" }, { number: 42, symbol: "Mo", type: "transition metal" },
  { number: 43, symbol: "Tc", type: "transition metal" }, { number: 44, symbol: "Ru", type: "transition metal" },
  { number: 45, symbol: "Rh", type: "transition metal" }, { number: 46, symbol: "Pd", type: "transition metal" },
  { number: 47, symbol: "Ag", type: "transition metal" }, { number: 48, symbol: "Cd", type: "transition metal" },
  { number: 49, symbol: "In", type: "metal" }, { number: 50, symbol: "Sn", type: "metal" },
  { number: 51, symbol: "Sb", type: "metalloid" }, { number: 52, symbol: "Te", type: "metalloid" },
  { number: 53, symbol: "I", type: "halogen" }, { number: 54, symbol: "Xe", type: "noble gas" },
  { number: 55, symbol: "Cs", type: "alkali metal" }, { number: 56, symbol: "Ba", type: "alkaline earth metal" },
  { number: 57, symbol: "La", type: "lanthanide" }, { number: 58, symbol: "Ce", type: "lanthanide" },
  { number: 59, symbol: "Pr", type: "lanthanide" }, { number: 60, symbol: "Nd", type: "lanthanide" },
  { number: 61, symbol: "Pm", type: "lanthanide" }, { number: 62, symbol: "Sm", type: "lanthanide" },
  { number: 63, symbol: "Eu", type: "lanthanide" }, { number: 64, symbol: "Gd", type: "lanthanide" },
  { number: 65, symbol: "Tb", type: "lanthanide" }, { number: 66, symbol: "Dy", type: "lanthanide" },
  { number: 67, symbol: "Ho", type: "lanthanide" }, { number: 68, symbol: "Er", type: "lanthanide" },
  { number: 69, symbol: "Tm", type: "lanthanide" }, { number: 70, symbol: "Yb", type: "lanthanide" },
  { number: 71, symbol: "Lu", type: "lanthanide" }, { number: 72, symbol: "Hf", type: "transition metal" },
  { number: 73, symbol: "Ta", type: "transition metal" }, { number: 74, symbol: "W", type: "transition metal" },
  { number: 75, symbol: "Re", type: "transition metal" }, { number: 76, symbol: "Os", type: "transition metal" },
  { number: 77, symbol: "Ir", type: "transition metal" }, { number: 78, symbol: "Pt", type: "transition metal" },
  { number: 79, symbol: "Au", type: "transition metal" }, { number: 80, symbol: "Hg", type: "transition metal" },
  { number: 81, symbol: "Tl", type: "metal" }, { number: 82, symbol: "Pb", type: "metal" },
  { number: 83, symbol: "Bi", type: "metal" }, { number: 84, symbol: "Po", type: "metalloid" },
  { number: 85, symbol: "At", type: "halogen" }, { number: 86, symbol: "Rn", type: "noble gas" },
  { number: 87, symbol: "Fr", type: "alkali metal" }, { number: 88, symbol: "Ra", type: "alkaline earth metal" },
  { number: 89, symbol: "Ac", type: "actinide" }, { number: 90, symbol: "Th", type: "actinide" },
  { number: 91, symbol: "Pa", type: "actinide" }, { number: 92, symbol: "U", type: "actinide" },
  { number: 93, symbol: "Np", type: "actinide" }, { number: 94, symbol: "Pu", type: "actinide" },
  { number: 95, symbol: "Am", type: "actinide" }, { number: 96, symbol: "Cm", type: "actinide" },
  { number: 97, symbol: "Bk", type: "actinide" }, { number: 98, symbol: "Cf", type: "actinide" },
  { number: 99, symbol: "Es", type: "actinide" }, { number: 100, symbol: "Fm", type: "actinide" },
  { number: 101, symbol: "Md", type: "actinide" }, { number: 102, symbol: "No", type: "actinide" },
  { number: 103, symbol: "Lr", type: "actinide" }, { number: 104, symbol: "Rf", type: "transition metal" },
  { number: 105, symbol: "Db", type: "transition metal" }, { number: 106, symbol: "Sg", type: "transition metal" },
  { number: 107, symbol: "Bh", type: "transition metal" }, { number: 108, symbol: "Hs", type: "transition metal" },
  { number: 109, symbol: "Mt", type: "transition metal" }, { number: 110, symbol: "Ds", type: "transition metal" },
  { number: 111, symbol: "Rg", type: "transition metal" }, { number: 112, symbol: "Cn", type: "transition metal" },
  { number: 113, symbol: "Nh", type: "metal" }, { number: 114, symbol: "Fl", type: "metal" },
  { number: 115, symbol: "Mc", type: "metal" }, { number: 116, symbol: "Lv", type: "metal" },
  { number: 117, symbol: "Ts", type: "halogen" }, { number: 118, symbol: "Og", type: "noble gas" },
];

// Common compounds with positions
const compounds = [
  { formula: "H2O", color: "#2196f3", x: 50, y: 700 },
  { formula: "CO2", color: "#9e9e9e", x: 130, y: 700 },
  { formula: "CH4", color: "#ff9800", x: 210, y: 700 },
  { formula: "NaCl", color: "#4caf50", x: 290, y: 700 },
];

// Grid settings
const ELEMENT_SIZE = 40;
const PADDING = 5;
const COLUMNS = 18;

export default function PeriodicTableFull() {
  const font = useFont(require("./assets/fonts/Roboto-Regular.ttf"), 12); // Make sure to add a Roboto font in assets

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {elements.map((el, index) => {
          const col = index % COLUMNS;
          const row = Math.floor(index / COLUMNS);
          const cx = col * (ELEMENT_SIZE + PADDING) + ELEMENT_SIZE / 2 + 5;
          const cy = row * (ELEMENT_SIZE + PADDING) + ELEMENT_SIZE / 2 + 5;
          return (
            <React.Fragment key={el.number}>
              <Circle cx={cx} cy={cy} r={ELEMENT_SIZE / 2} color={typeColors[el.type]} />
              {font && <Text x={cx - 10} y={cy + 5} text={el.symbol} font={font} />}
            </React.Fragment>
          );
        })}

        {font &&
          compounds.map((c, idx) => (
            <Text key={idx} x={c.x} y={c.y} text={c.formula} font={font} color={c.color} />
          ))}
      </Canvas>
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
});
