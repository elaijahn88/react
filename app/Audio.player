import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";

type Track = {
  id: string;
  title: string;
  artist: string;
  url: string;
};

const tracks: Track[] = [
  {
    id: "1",
    title: "Song One",
    artist: "Artist A",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "2",
    title: "Song Two",
    artist: "Artist B",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "3",
    title: "Song Three",
    artist: "Artist C",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

export default function App() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = async (track: Track) => {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: track.url },
      { shouldPlay: true }
    );
    setSound(newSound);
    setCurrentTrack(track);
    setIsPlaying(true);
    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        nextTrack();
      }
    });
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    if (!currentTrack) return;
    const index = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (index + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const prevTrack = () => {
    if (!currentTrack) return;
    const index = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (index - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  };

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Audio Player</Text>
      {currentTrack && (
        <View style={styles.currentTrack}>
          <Text style={styles.title}>{currentTrack.title}</Text>
          <Text style={styles.artist}>{currentTrack.artist}</Text>
        </View>
      )}
      <View style={styles.controls}>
        <Button title="Prev" onPress={prevTrack} />
        <Button title={isPlaying ? "Pause" : "Play"} onPress={togglePlayPause} />
        <Button title="Next" onPress={nextTrack} />
      </View>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.trackItem} onPress={() => playTrack(item)}>
            <Text style={styles.trackTitle}>{item.title}</Text>
            <Text style={styles.trackArtist}>{item.artist}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  currentTrack: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold" },
  artist: { fontSize: 14, color: "gray" },
  controls: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  trackItem: { backgroundColor: "#fff", padding: 15, marginBottom: 10, borderRadius: 8 },
  trackTitle: { fontSize: 16, fontWeight: "bold" },
  trackArtist: { fontSize: 14, color: "gray" },
});
