import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Video from 'react-native-video';

const videoUrls = [
  'https://xlijah.com/video1.mp4',
  'https://xlijah.com/video2.mp4',
  'https://xlijah.com/video3.mp4'
];

const App = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>🎥 Xlijah Video List</Text>

        {videoUrls.map((url, index) => (
          <View key={index} style={styles.videoContainer}>
            <Video
              source={{ uri: url }}
              style={styles.video}
              controls
              resizeMode="contain"
              paused={false}
            />
          </View>
        ))}

        <View style={styles.buttonRow}>
          <ActionButton title="💰 Save" />
          <ActionButton title="🏦 Take Loans" />
        </View>
        <View style={styles.buttonRow}>
          <ActionButton title="💳 Pay" />
          <ActionButton title="🛍️ Market" />
        </View>
        <View style={styles.buttonRow}>
          <ActionButton title="👑 Royal Society" />
        </View>
      </ScrollView>
    </View>
  );
};

const ActionButton = ({ title }) => (
  <TouchableOpacity style={styles.button}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold'
  },
  videoContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  video: {
    width: width - 20,
    height: 200,
    backgroundColor: '#111'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15
  },
  button: {
    backgroundColor: '#1e1e1e',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: '40%',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16
  }
});

export default App;