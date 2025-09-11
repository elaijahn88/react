import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
} from "react-native";

type RootStackParamList = {
  TVApp: undefined;
  ShowDetail: { show: Show };
};

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

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Dummy TV shows
const shows: Show[] = [
  {
    id: "1",
    title: "Breaking Bad",
    description: "A chemistry teacher turned meth producer in New Mexico.",
    episodes: [
      { id: "e1", title: "Pilot", duration: "58 min" },
      { id: "e2", title: "Cat’s in the Bag…", duration: "48 min" },
      { id: "e3", title: "...And the Bag’s in the River", duration: "47 min" },
    ],
  },
  {
    id: "2",
    title: "Stranger Things",
    description: "Mystery and sci-fi thriller set in 1980s Hawkins.",
    episodes: [
      { id: "e1", title: "The Vanishing of Will Byers", duration: "50 min" },
      { id: "e2", title: "The Weirdo on Maple Street", duration: "55 min" },
      { id: "e3", title: "Holly, Jolly", duration: "52 min" },
    ],
  },
];

// Watchlist state
const watchlistStore: string[] = [];

function TVShowsScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <FlatList
        data={shows}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ShowDetail", { show: item })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function ShowDetailScreen({ route }: any) {
  const { show } = route.params;
  const [inWatchlist, setInWatchlist] = useState(
    watchlistStore.includes(show.id)
  );

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
        </View>
      ))}
    </ScrollView>
  );
}

function WatchlistScreen() {
  const saved = shows.filter((s) => watchlistStore.includes(s.id));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Watchlist</Text>
      {saved.length === 0 ? (
        <Text>No shows in your watchlist yet.</Text>
      ) : (
        saved.map((s) => (
          <View key={s.id} style={styles.card}>
            <Text style={styles.title}>{s.title}</Text>
          </View>
        ))
      )}
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>Manage your account and preferences here.</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="TV Shows" component={TVShowsScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="TVApp" component={MainTabs} />
        <Stack.Screen name="ShowDetail" component={ShowDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  desc: { fontSize: 14, color: "#555" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  episode: { padding: 10, borderBottomWidth: 1, borderColor: "#ddd" },
  episodeTitle: { fontSize: 15 },
  episodeDuration: { fontSize: 12, color: "gray" },
});
