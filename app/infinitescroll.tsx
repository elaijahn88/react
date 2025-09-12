import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import Video from "react-native-video"; // install with: npm install react-native-video

// 1. Define the type for a video item
interface VideoItem {
  id: string;
  url: string;
  title: string;
}

// 2. Mock API function to simulate fetching data
const fetchVideos = async (page: number): Promise<VideoItem[]> => {
  console.log(`Fetching videos for page: ${page}`);
  const videosPerPage = 5;
  const start = (page - 1) * videosPerPage;
  const end = start + videosPerPage;

  const dummyVideos: VideoItem[] = [
    { id: "1", url: "https://xlijah.com/soso.mp4", title: "**soso**" },
    { id: "2", url: "https://www.tiktok.com/@theswisschris/video/7504333026881539350?is_from_webapp=1&sender_device=pc", title: "Big Buck Bunny #2" },
    { id: "3", url: "https://www.tiktok.com/@steven/video/7511466867626708246?is_from_webapp=1&sender_device=pc", title: "Big Buck Bunny #3" },
    { id: "4", url: "https://www.tiktok.com/@chriskohlernews/video/7420707068425915655?is_from_webapp=1&sender_device=pc", title: "Big Buck Bunny #4" },
    { id: "5", url: "https://www.tiktok.com/@alexblumy/video/7515898321685433646?is_from_webapp=1&sender_device=pc", title: "Big Buck Bunny #5" },
    { id: "6", url: "https://www.tiktok.com/@chriscobb_chosen/video/7527730404242017550?is_from_webapp=1&sender_device=pc", title: "Big Buck Bunny #6" },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyVideos.slice(start, end));
    }, 1000);
  });
};

const VideoFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch videos when page changes
  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const newVideos = await fetchVideos(page);
        if (newVideos.length > 0) {
          setVideos((prev) => [...prev, ...newVideos]);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to fetch videos:", err);
        setError("Failed to load videos. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, [page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const renderItem = ({ item }: { item: VideoItem }) => (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: item.url }}
        style={styles.video}
        resizeMode="contain"
        controls
        muted
      />
      <Text style={styles.title}>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Video Feed</Text>

      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 50 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#007bff" style={{ margin: 20 }} /> : null
        }
      />

      {error && <Text style={styles.error}>{error}</Text>}
      {!hasMore && !loading && (
        <Text style={styles.endText}>You've reached the end of the feed!</Text>
      )}
    </View>
  );
};

export default VideoFeed;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  videoContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  video: {
    width: "100%",
    height: 200,
    backgroundColor: "black",
  },
  title: {
    padding: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  endText: {
    textAlign: "center",
    marginVertical: 20,
    fontStyle: "italic",
  },
});
