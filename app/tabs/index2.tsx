import React from "react";
import { StyleSheet, View } from "react-native";
import Video from "react-native-video";

export default function VideoPlayer() {
  return (
    <View style={styles.container}>
      <Video
        source={{ uri: "https://www.w3schools.com/html/mov_bbb.mp4" }}
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
    backgroundColor: "#000",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: 250,
  },
});
