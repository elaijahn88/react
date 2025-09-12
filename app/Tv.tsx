import React, { useState } from "react";
import { 
  View, Text, ScrollView, Button, StyleSheet, Dimensions 
} from "react-native";
import Video from "react-native-video";

const { width } = Dimensions.get("window");

type Episode = {
  id: string;
  title: string;
  duration: string;
};

type Show = {
  id: string;
  title: string;
  description: string;
  episodes: Episode[];
};

// Dummy TV show with your video
const show: Show = {
  id: "1",
  title: "My Cool TV Show",
  description: "An exciting show with amazing content.",
  episodes: [
    { id: "e1", title: "Episode 1", duration: "30 min" },
  ],
};

export default function ShowDetailScreen() {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.showTitle}>{show.title}</Text>
      <Text style={styles.showDesc}>{show.description}</Text>

      <Text style={styles.sectionTitle}>Episodes</Text>
      {show.episodes.map((ep) => (
        <View key={ep.id} style={styles.episodeCard}>
          <Text style={styles.episodeTitle}>{ep.title}</Text>
          <Text style={styles.episodeDuration}>{ep.duration}</Text>
          <Button
            title="Play"
            onPress={() =>
              setCurrentVideo("https://xlijah.com/soso.mp4")
            }
          />
        </View>
      ))}

      {currentVideo && (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: currentVideo }}
            style={styles.videoPlayer}
            controls
            resizeMode="contain"
          />
          <Button title="Close Video" onPress={() => setCurrentVideo(null)} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  episodeCard: {
    padding: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  episodeDuration: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  videoContainer: {
    marginTop: 20,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  videoPlayer: {
    width: width - 30,
    height: 200,
    borderRadius: 10,
    backgroundColor: "#000",
  },
});
