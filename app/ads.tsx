import React, { useState } from "react";
import { View, Button, StyleSheet, Dimensions } from "react-native";
import Video from "react-native-video";

const { width } = Dimensions.get("window");

export default function App() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      {!videoUrl && (
        <Button
          title="video"
          onPress={() => setVideoUrl("https://xlijah.com/soso.mp4")}
        />
      )}

      {videoUrl && (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: videoUrl }}
            style={styles.video}
            controls
            resizeMode="contain"
          />
          <Button title="Stop Video" onPress={() => setVideoUrl(null)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
  },
  videoContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  video: {
    width: width - 30,
    height: 200,
    borderRadius: 10,
    backgroundColor: "#000",
  },
});
