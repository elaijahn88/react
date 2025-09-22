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
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>\n        <View style={styles.headerRow}>\n          <Text style={[styles.title, { color: theme.text }]}>TV Shows & Custom Player</Text>\n          <View style={styles.switchRow}>\n            <Text style={{ color: theme.text, marginRight: 8 }}>\n              {darkMode ? "Dark" : "Light"} Mode\n            </Text>\n            <Switch\n              value={darkMode}\n              onValueChange={setDarkMode}\n              thumbColor={darkMode ? "#fff" : "#222"}\n              trackColor={{ false: "#aaa", true: "#444" }}\n            />\n          </View>\n        </View>\n        {videos.map((video, idx) => (\n          <View key={idx} style={[styles.card, { backgroundColor: theme.card }]}>\n            <Text style={[styles.videoTitle, { color: theme.text }]}>{video.title}</Text>\n            <Text style={[styles.desc, { color: theme.text }]}>{video.desc}</Text>\n            <Button\n              title="Play Episode"\n              color={theme.button}\n              onPress={() => {\n                setCurrentIndex(idx);\n                setPaused(false);\n              }}\n            />\n          </View>\n        ))}\n      </ScrollView>\n    );\n  }

  // Player (fullscreen overlay) mode
  const currentVideo = videos[currentIndex];
  return (
    <View style={[styles.fullScreenContainer, { backgroundColor: theme.background }]}>\n      <Video\n        ref={videoRef}\n        source={{ uri: currentVideo.uri }}\n        style={styles.fullScreenVideo}\n        resizeMode="contain"\n        paused={paused}\n        onEnd={nextVideo}\n      />\n
      {/* Timed text overlay */}\n      {showText && (\n        <View style={styles.textOverlay}>\n          <Text style={styles.overlayText}>\n            {currentVideo.title}\n          </Text>\n        </View>\n      )}\n
      {/* Controls */}\n      <View style={styles.playerControls}>\n        <TouchableOpacity style={styles.controlButton} onPress={prevVideo}>\n          <Text style={styles.buttonText}>⏮ Prev</Text>\n        </TouchableOpacity>\n        <TouchableOpacity style={styles.controlButton} onPress={playPause}>\n          <Text style={styles.buttonText}>{paused ? "▶ Play" : "⏸ Pause"}</Text>\n        </TouchableOpacity>\n        <TouchableOpacity style={styles.controlButton} onPress={nextVideo}>\n          <Text style={styles.buttonText}>Next ⏭</Text>\n        </TouchableOpacity>\n      </View>\n
      {/* Close */}\n      <TouchableOpacity\n        style={styles.closeButton}\n        onPress={() => {\n          setCurrentIndex(null);\n          setPaused(true);\n        }}\n      >\n        <Text style={styles.buttonText}>✖ Close</Text>\n      </TouchableOpacity>\n    </View>\n  );\n}

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