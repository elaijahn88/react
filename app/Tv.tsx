import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, Button, StyleSheet, Dimensions, TouchableOpacity 
} from "react-native";
import { Video } from "react-native-video";   // ✅ named import

const { width, height } = Dimensions.get("window");

export default function ShowDetailScreen() {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [showText, setShowText] = useState(false);

  // Show overlay text for 10s after video starts
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentVideo) {
      setShowText(true);
      timer = setTimeout(() => setShowText(false), 10000); // hide after 10s
    }
    return () => clearTimeout(timer);
  }, [currentVideo]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.showTitle}>TV Show</Text>
      <Text style={styles.showDesc}>Amazing show.</Text>

      <Button
        title="Play Episode"
        onPress={() => setCurrentVideo("https://xlijah.com/soso.mp4")}
      />

      {currentVideo && (
        <View style={styles.fullScreenContainer}>
          <Video
            source={{ uri: currentVideo }}
            style={styles.fullScreenVideo}
            resizeMode="contain"
            paused={paused}
          />

          {/* Timed text overlay */}
          {showText && (
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText}>Show </Text>
            </View>
          )}

          {/* Play / Pause button */}
          <TouchableOpacity 
            style={styles.playButton} 
            onPress={() => setPaused(!paused)}
          >
            <Text style={styles.buttonText}>
              {paused ? "▶ Play" : "⏸ Pause"}
            </Text>
          </TouchableOpacity>

          {/* Close button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setCurrentVideo(null)}
          >
            <Text style={styles.buttonText}>✖ Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
    minHeight: height,
  },
  showTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  showDesc: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },
  fullScreenContainer: {
    position: "absolute",
    
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenVideo: {
    width,
    height,
    backgroundColor: "black",
  },
  textOverlay: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 8,
  },
  overlayText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  playButton: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 8,
  },
  closeButton: {
    position: "absolute",
  });
