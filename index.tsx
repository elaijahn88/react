import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Video from "react-native-video";

const { width } = Dimensions.get("window");

export default function App() {
  return (
    <View style={styles.container}>
      <Video
        source={{ uri: "https://www.w3schools.com/html/mov_bbb.mp4" }}
        style={styles.video}
        controls={true}
        resizeMode="contain"
        paused={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: width,
    height: 250,
  },
});
