import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Button,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Linking,
} from "react-native";
import Video from "react-native-video";

const { width, height } = Dimensions.get("window");

const videos = [
  {
    title: "First Video",
    uri: "https://xlijah.com/soso.mp4",
    desc: "Episode 1: Amazing show.",
  },
  {
    title: "Second Video",
    uri: "https://www.youtube.com/shorts/UjkFlamFSoU?feature=share.mp4",
    desc: "Episode 2: Even more amazing.",
  },
];

const lightTheme = {
  background: "#fff",
  card: "#f4f4f4",
  text: "#222",
  videoBg: "#000",
  button: "#222",
  buttonText: "#fff",
  adBg: "#e0e0e0",
  adText: "#555",
};
const darkTheme = {
  background: "#181924",
  card: "#23263a",
  text: "#fff",
  videoBg: "#111",
  button: "#fff",
  buttonText: "#222",
  adBg: "#23263a",
  adText: "#bdbdbd",
};

export default function CombinedVideoScreen() {
  // General state
  const [darkMode, setDarkMode] = useState(true);
  const theme = darkMode ? darkTheme : lightTheme;

  // List screen state
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(true);
  const videoRef = useRef<Video>(null);

  // Fullscreen overlay state
  const [showText, setShowText] = useState(false);

  // Timed overlay effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentIndex !== null) {
      setShowText(true);
      timer = setTimeout(() => setShowText(false), 10000); // hide text after 10s
    }
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Controls
  const playPause = () => setPaused((p) => !p);

  const nextVideo = () => {
    if (currentIndex === null) return;
    const nextIdx = (currentIndex + 1) % videos.length;
    setCurrentIndex(nextIdx);
    setPaused(false);
  };

  const prevVideo = () => {
    if (currentIndex === null) return;
    const prevIdx = (currentIndex - 1 + videos.length) % videos.length;
    setCurrentIndex(prevIdx);
    setPaused(false);
  };

  // Entry: Show list mode
  if (currentIndex === null) {
    return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>TV Shows & Custom Player</Text>
          <View style={styles.switchRow}>
            <Text style={{ color: theme.text, marginRight: 8 }}>
              {darkMode ? "Dark" : "Light"} Mode
            </Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor={darkMode ? "#fff" : "#222"}
              trackColor={{ false: "#aaa", true: "#444" }}
            />
          </View>
        </View>
        {/* Payment Links */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 18 }}>
          <Button title="Bank" onPress={() => Linking.openURL("https://samplebank.com") } />
          <View style={{ width: 10 }} />
          <Button title="Mobile Money" onPress={() => Linking.openURL("https://mobilemoney.com") } />
          <View style={{ width: 10 }} />
          <Button title="International Payments" onPress={() => Linking.openURL("https://internationalpayments.com") } />
        </View>
        {/* Rest of episode cards */}
        {videos.map((video, idx) => (
          <View key={idx} style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.videoTitle, { color: theme.text }]}>{video.title}</Text>
            <Text style={[styles.desc, { color: theme.text }]}>{video.desc}</Text>
            <Button
              title="Play Episode"
              color={theme.button}
              onPress={() => {
                setCurrentIndex(idx);
                setPaused(false);
              }}
            />
          </View>
        ))}
      </ScrollView>
    );
  }

  // Player (fullscreen overlay) mode
  const currentVideo = videos[currentIndex];
  return (
    <View style={[styles.fullScreenContainer, { backgroundColor: theme.background }]}>
      <Video
        ref={videoRef}
        source={{ uri: currentVideo.uri }}
        style={styles.fullScreenVideo}
        resizeMode="contain"
        paused={paused}
        onEnd={nextVideo}
      />
      {/* Timed text overlay */}
      {showText && (
        <View style={styles.textOverlay}>
          <Text style={styles.overlayText}>
            {currentVideo.title}
          </Text>
        </View>
      )}
      {/* Controls */}
      <View style={styles.playerControls}>
        <TouchableOpacity style={styles.controlButton} onPress={prevVideo}>
          <Text style={styles.buttonText}>⏮ Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={playPause}>
          <Text style={styles.buttonText}>{paused ? "▶ Play" : "⏸ Pause"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={nextVideo}>
          <Text style={styles.buttonText}>Next ⏭</Text>
        </TouchableOpacity>
      </View>
      {/* Close */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          setCurrentIndex(null);
          setPaused(true);
        }}
      >
        <Text style={styles.buttonText}>✖ Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 15,
    minHeight: height,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 18,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  card: {
    width: width - 30,
    borderRadius: 10,
    padding: 15,
    marginBottom: 18,
    alignItems: "flex-start",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    marginBottom: 15,
  },
  fullScreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
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
    padding: 14,
    borderRadius: 10,
  },
  overlayText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  playerControls: {
    position: "absolute",
    bottom: 110,
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
  },
  controlButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 14,
    borderRadius: 10,
  },
});
