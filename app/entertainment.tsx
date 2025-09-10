import React from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from "react-native";

type Track = {
  id: string;
  title: string;
  duration: string;
};

const sampleTracks: Track[] = [
  { id: "1", title: "Midnight Beats", duration: "3:45" },
  { id: "2", title: "Sunrise Vibes", duration: "4:20" },
  { id: "3", title: "Deep Groove", duration: "5:10" },
];

export default function MusicianPage() {
  const renderTrack = ({ item }: { item: Track }) => (
    <View style={styles.trackCard}>
      <Text style={styles.trackTitle}>{item.title}</Text>
      <Text style={styles.trackDuration}>{item.duration}</Text>
      <TouchableOpacity style={styles.playButton}>
        <Text style={styles.playText}>▶ Play</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profile}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>DJ Nightwave</Text>
        <Text style={styles.bio}>
          Independent DJ & Music Producer 🎶 | Mixing beats for the soul.
        </Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>Followers: 12.3k</Text>
          <Text style={styles.stat}>Tracks: 24</Text>
        </View>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followText}>+ Follow</Text>
        </TouchableOpacity>
      </View>

      {/* Tracks List */}
      <Text style={styles.sectionTitle}>Popular Tracks</Text>
      <FlatList
        data={sampleTracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  profile: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: "bold" },
  bio: { fontSize: 14, color: "#555", textAlign: "center", marginVertical: 5 },
  stats: { flexDirection: "row", gap: 15, marginTop: 5 },
  stat: { fontSize: 14, fontWeight: "600" },
  followButton: {
    marginTop: 10,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followText: { color: "#fff", fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  trackCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
  },
  trackTitle: { fontSize: 16, fontWeight: "500" },
  trackDuration: { fontSize: 14, color: "#555" },
  playButton: {
    backgroundColor: "#FF2D55",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  playText: { color: "#fff", fontWeight: "600" },
});
