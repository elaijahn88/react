import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';

const PaymentScreen = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePayment = async () => {
    try {
      const res = await fetch('https://your-backend.com/api/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cardNumber, expiry, cvv })
      });

      const result = await res.json();
      if (result.success) {
        Alert.alert('Payment Successful!');
      } else {
        Alert.alert('Payment Failed:', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Card Number" onChangeText={setCardNumber} />
      <TextInput placeholder="Expiry (MM/YY)" onChangeText={setExpiry} />
      <TextInput placeholder="CVV" onChangeText={setCvv} secureTextEntry />
      <Button title="Pay" onPress={handlePayment} />
    </View>
  );
};

export default PaymentScreen;
