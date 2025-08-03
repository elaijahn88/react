import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

export default function App() {
  const videoRef = useRef(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎬 S Media Player</Text>

      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }}
        useNativeControls
        resizeMode="contain"
        shouldPlay
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  video: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
});
