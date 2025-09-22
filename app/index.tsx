import React, { useState, useRef } from "react";
import { View, Button, StyleSheet, Dimensions, Text, ScrollView } from "react-native";
import Video from "react-native-video";

const { width } = Dimensions.get("window");

// Sample video list (2 screens, each with a video)
const videos = [
  {
    title: "First Video",
    uri: "https://xlijah.com/soso.mp4",
  },
  {
    title: "Second Video",
    uri: "https://www.youtube.com/shorts/UjkFlamFSoU?feature=share.mp4",
  },
];

export default function VideoScreens() {
  // State for each video screen
  const [pausedStates, setPausedStates] = useState([true, true]);
  const videoRefs = [useRef<Video>(null), useRef<Video>(null)];

  const togglePause = (index: number) => {
    setPausedStates((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  const onEnd = (index: number) => {
    // When a video ends, pause it
    setPausedStates((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>.......</Text>
      {videos.map((video, idx) => (
        <View key={idx} style={styles.screen}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Video
            ref={videoRefs[idx]}
            source={{ uri: video.uri }}
            style={styles.video}
            resizeMode="contain"
            paused={pausedStates[idx]}
            onEnd={() => onEnd(idx)}
          />
          <View style={styles.controls}>
            <Button
              title={pausedStates[idx] ? "Play" : "Pause"}
              onPress={() => togglePause(idx)}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 18,
  },
  screen: {
    width: width - 30,
    marginBottom: 30,
    borderRadius: 10,
    backgroundColor: "#f4f4f4",
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: "#000",
  },
  controls: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
});
