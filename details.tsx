import React from 'react';
import { View, Button, Linking, StyleSheet } from 'react-native';
import Video from 'react-native-video';

export default function DetailsScreen() {
  const handleDial = () => {
    Linking.openURL('tel:+256700000000');
  };

  const handleSMS = () => {
    Linking.openURL('sms:+256700000000');
  };

  const handleVideo = () => {
    alert('Scroll down to watch the video!');
  };

  return (
    <View style={styles.container}>
      <Button title="Dial" onPress={handleDial} />
      <View style={styles.spacer} />
      <Button title="SMS" onPress={handleSMS} />
      <View style={styles.spacer} />
      <Button title="Video" onPress={handleVideo} />

      <Video
        source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }}
        style={styles.video}
        controls
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  spacer: {
    height: 20,
  },
  video: {
    width: '100%',
    height: 200,
    marginTop: 40,
  },
});
