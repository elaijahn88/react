import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Video } from "react-native-video";

const { width } = Dimensions.get("window");

export default function App() {
  return (
    <View style={styles.container}>
      <Video
        source={{ uri: "https://xlijah.com/soso.mp4" }} // sample video
        style={styles.video}
        controls={true}
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
    alignItems: "center",
  },
  video: {
    width: width,
    height: 250,
  },
});
