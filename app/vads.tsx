// VideoAd.tsx
import React, { useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Linking } from "react-native";
import Video from "react-native-video";

const { width, height } = Dimensions.get("window");

interface VideoAdProps {
  source: string;        // Video URL
  adLink?: string;       // Optional link on click
  autoPlay?: boolean;
}

export default function VideoAd({ source, adLink, autoPlay = true }: VideoAdProps) {
  const videoRef = useRef<Video>(null);
  const [paused, setPaused] = useState(!autoPlay);
  const [finished, setFinished] = useState(false);

  const handlePress = () => {
    if (adLink) {
      Linking.openURL(adLink);
    }
  };

  return (
    <View style={styles.container}>
      {!finished ? (
        <TouchableOpacity style={styles.touchArea} onPress={handlePress} activeOpacity={1}>
          <Video
            ref={videoRef}
            source={{ uri: source }}
            style={styles.video}
            resizeMode="cover"
            paused={paused}
            onEnd={() => setFinished(true)}
            repeat={false}
          />
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={() => setPaused(!paused)}
          >
            <Text style={styles.playPauseText}>{paused ? "Play" : "Pause"}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedText}>Ad Finished</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height * 0.3,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  touchArea: {
    width: "100%",
    height: "100%",
  },
  playPauseButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#0ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
    playPauseText: {
    color: "#000",
    fontWeight: "bold",
  },
  finishedContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  finishedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

