import React, { useState, useRef } from "react";
import { View, Button, StyleSheet, Dimensions, Text } from "react-native";
import Video from "react-native-video";

const { width } = Dimensions.get("window");

// Sample video list
const videos = [
  "https://xlijah.com/soso.mp4",
  "https://xlijah.com/soso.mp4",
  "https://www.youtube.com/shorts/UjkFlamFSoU?feature=share.mp4",
];

export default function CustomVideoPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(true);
  const videoRef = useRef<Video>(null);

  const playPause = () => setPaused(!paused);

  const nextVideo = () => {
    const nextIndex = (currentIndex + 1) % videos.length;
    setCurrentIndex(nextIndex);
    setPaused(false); // auto-play next video
  };

  const prevVideo = () => {
    const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
    setCurrentIndex(prevIndex);
    setPaused(false); // auto-play previous video
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Video Player</Text>
      <Video
        ref={videoRef}
        source={{ uri: videos[currentIndex] }}
        style={styles.video}
        resizeMode="contain"
        paused={paused}
        onEnd={nextVideo} // auto-play next on end
      />

      <View style={styles.controls}>
        <Button title="Prev" onPress={prevVideo} />
        <Button title={paused ? "Play" : "Pause"} onPress={playPause} />
        <Button title="Next" onPress={nextVideo} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  video: {
    width: width - 30,
    height: 200,
    borderRadius: 10,
    backgroundColor: "#000",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 15,
  },
});
