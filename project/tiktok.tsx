import React, { useRef } from "react";
import { View, Text, FlatList, Dimensions, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const { height, width } = Dimensions.get("window");

const videos = [
  {
    id: "1",
    uri: "https://www.w3schools.com/html/mov_bbb.mp4",
    username: "@user1",
    caption: "Check out this cool video! 😎",
    music: "Original Sound - User1",
    likes: "12.4K",
    comments: "1.2K",
    shares: "340",
  },
  {
    id: "2",
    uri: "https://www.w3schools.com/html/movie.mp4",
    username: "@user2",
    caption: "Vibes 🌊✨",
    music: "Song - User2",
    likes: "54.2K",
    comments: "8.3K",
    shares: "1.1K",
  },
];

export default function App() {
  const videoRefs = useRef<any>({});

  const renderItem = ({ item }: any) => (
    <View style={styles.container}>
      {/* Video */}
      <Video
        ref={(ref) => (videoRefs.current[item.id] = ref)}
        source={{ uri: item.uri }}
        style={styles.video}
        resizeMode="cover"
        isLooping
        shouldPlay
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Left side text */}
        <View style={styles.leftSection}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.caption}>{item.caption}</Text>
          <Text style={styles.music}>🎵 {item.music}</Text>
        </View>

        {/* Right side buttons */}
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart" size={32} color="white" />
            <Text style={styles.iconText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chatbubble" size={32} color="white" />
            <Text style={styles.iconText}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="arrow-redo" size={32} color="white" />
            <Text style={styles.iconText}>{item.shares}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Image
              source={{ uri: "https://placekitten.com/100/100" }}
              style={styles.profilePic}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Ionicons name="home" size={28} color="white" />
        <Ionicons name="search" size={28} color="white" />
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={{ color: "white", fontSize: 20 }}>＋</Text>
        </TouchableOpacity>
        <Ionicons name="chatbubble-ellipses" size={28} color="white" />
        <Ionicons name="person" size={28} color="white" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: "black",
  },
  video: {
    width,
    height,
    position: "absolute",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
    flexDirection: "row",
  },
  leftSection: {
    flex: 1,
    justifyContent: "flex-end",
  },
  username: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 4,
  },
  caption: {
    color: "white",
    marginBottom: 4,
  },
  music: {
    color: "white",
    fontStyle: "italic",
  },
  rightSection: {
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 60,
  },
  iconButton: {
    marginVertical: 10,
    alignItems: "center",
  },
  iconText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  uploadButton: {
    backgroundColor: "red",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
