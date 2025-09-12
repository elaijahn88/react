import Video from "react-native-video";

// Inside ShowDetailScreen
function ShowDetailScreen({ route }: any) {
  const { show } = route.params;
  const [inWatchlist, setInWatchlist] = useState(
    watchlistStore.includes(show.id)
  );
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  const toggleWatchlist = () => {
    if (inWatchlist) {
      const index = watchlistStore.indexOf(show.id);
      if (index > -1) watchlistStore.splice(index, 1);
    } else {
      watchlistStore.push(show.id);
    }
    setInWatchlist(!inWatchlist);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{show.title}</Text>
      <Text style={styles.desc}>{show.description}</Text>
      <Button
        title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        onPress={toggleWatchlist}
      />

      <Text style={styles.sectionTitle}>Episodes</Text>
      {show.episodes.map((ep: Episode) => (
        <View key={ep.id} style={styles.episode}>
          <Text style={styles.episodeTitle}>{ep.title}</Text>
          <Text style={styles.episodeDuration}>{ep.duration}</Text>
          <Button
            title="Play"
            onPress={() =>
              setCurrentVideo(
                `https://xlijah.com/soso.mp4`
              )
            }
          />
        </View>
      ))}

      {currentVideo && (
        <View style={{ marginTop: 20 }}>
          <Video
            source={{ uri: currentVideo }} // Replace with episode-specific URL
            style={{ width: "100%", height: 200, borderRadius: 10 }}
            controls
            resizeMode="contain"
          />
          <Button title="Close Video" onPress={() => setCurrentVideo(null)} />
        </View>
      )}
    </ScrollView>
  );
}
