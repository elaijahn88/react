import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

type AddCardModalProps = {
  visible: boolean;
  onClose: () => void;
  onAddCard: (card: PaymentCardType) => void;
  isDark: boolean;
};

export const AddCardModal = ({ visible, onClose, onAddCard, isDark }: AddCardModalProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");

  const handleAdd = () => {
    if (!cardNumber || !cardHolder || !expiry) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    // Basic validation, ideally improve this
    if (cardNumber.length < 16) {
      Alert.alert("Error", "Card number must be at least 16 digits");
      return;
    }

    const maskedNumber = "**** **** **** " + cardNumber.slice(-4);

    onAddCard({
      id: Math.random().toString(36).substring(7),
      cardNumber: maskedNumber,
      cardHolder,
      expiry,
    });

    setCardNumber("");
    setCardHolder("");
    setExpiry("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={[modalStyles.overlay, { backgroundColor: isDark ? "#000a" : "#0006" }]}>
        <View style={[modalStyles.container, { backgroundColor: isDark ? "#222" : "#fff" }]}>
          <Text style={[modalStyles.title, { color: isDark ? "#fff" : "#000" }]}>Add New Card</Text>

          <TextInput
            placeholder="Card Number"
            placeholderTextColor={isDark ? "#aaa" : "#888"}
            style={[modalStyles.input, { color: isDark ? "#fff" : "#000" }]}
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={setCardNumber}
            maxLength={16}
          />
          <TextInput
            placeholder="Card Holder Name"
            placeholderTextColor={isDark ? "#aaa" : "#888"}
            style={[modalStyles.input, { color: isDark ? "#fff" : "#000" }]}
            value={cardHolder}
            onChangeText={setCardHolder}
          />
          <TextInput
            placeholder="Expiry (MM/YY)"
            placeholderTextColor={isDark ? "#aaa" : "#888"}
            style={[modalStyles.input, { color: isDark ? "#fff" : "#000" }]}
            value={expiry}
            onChangeText={setExpiry}
            maxLength={5}
          />

          <View style={modalStyles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={[modalStyles.button, { backgroundColor: "#888" }]}>
              <Text style={modalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAdd} style={[modalStyles.button, { backgroundColor: "#007aff" }]}>
              <Text style={modalStyles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  container: {
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
