import React, { useState, useRef } from "react";
import { View, Button, StyleSheet, Dimensions, Text, ScrollView, Switch } from "react-native";
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
    uri: "https://xlijah.com/ai.mp4",
  },
];

export default function VideoScreens() {
  // State for each video screen
  const [pausedStates, setPausedStates] = useState([true, true]);
  const videoRefs = [useRef<Video>(null), useRef<Video>(null)];
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Dynamic styles based on theme
  const themeStyles = getThemeStyles(isDarkMode);

  return (
    <ScrollView contentContainerStyle={[styles.container, themeStyles.container]}>
      <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-end", marginBottom: 10 }}>
        <Text style={[styles.themeLabel, themeStyles.text]}>
          {isDarkMode ? "Dark" : "Light"} Mode
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={setIsDarkMode}
          thumbColor={isDarkMode ? "#333" : "#fff"}
          trackColor={{ false: "#bbb", true: "#444" }}
        />
      </View>
      <Text style={[styles.title, themeStyles.text]}>.......</Text>
      {videos.map((video, idx) => (
        <View key={idx} style={[styles.screen, themeStyles.screen]}>
          <Text style={[styles.videoTitle, themeStyles.text]}>{video.title}</Text>
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
              color={isDarkMode ? "#bbb" : "#333"}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// Helper function to get theme styles
function getThemeStyles(isDark: boolean) {
  return {
    container: {
      backgroundColor: isDark ? "#181818" : "#fff",
    },
    screen: {
      backgroundColor: isDark ? "#222" : "#f4f4f4",
      shadowColor: isDark ? "#fff" : "#000",
    },
    text: {
      color: isDark ? "#fff" : "#181818",
    },
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  themeLabel: {
    marginRight: 8,
    fontSize: 15,
    fontWeight: "500",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 18,
    color: "#181818",
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
    color: "#181818",
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
