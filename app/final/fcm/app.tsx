import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { listenToUserDoc, GLOBAL_DOC_ID, GLOBAL_DOC_DATA } from './globals';

export default function App() {
  useEffect(() => {
    // Start listening for a specific user email
    const unsubscribe = listenToUserDoc('user@example.com');

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <View>
      <Text>Global docId: {GLOBAL_DOC_ID}</Text>
      <Text>Global data: {GLOBAL_DOC_DATA ? JSON.stringify(GLOBAL_DOC_DATA) : 'Loading...'}</Text>
    </View>
  );
}

