import React from "react";
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
} from "react-native";

type RootStackParamList = {
  NewsApp: undefined;
  NewsDetail: { item: NewsItem };
};

type NewsItem = {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Dummy news data
const newsData: NewsItem[] = [
  {
    id: "1",
    title: "Arsenal Injury Crisis Ahead of Forest Clash",
    category: "Sports",
    summary: "Several key players out as Arsenal prepare for Forest.",
    content:
      "Arsenal face Nottingham Forest this weekend without William Saliba, Saka, and Havertz. Arteta is expected to reshuffle his defense...",
  },
  {
    id: "2",
    title: "New Marvel Movie Breaks Box Office Records",
    category: "Entertainment",
    summary: "The latest Marvel film opens to huge success worldwide.",
    content:
      "Marvel Studios’ latest blockbuster earned over $200M in its opening weekend, setting a new September record globally...",
  },
  {
    id: "3",
    title: "Cristiano Ronaldo Scores Hat-Trick in Al Nassr Win",
    category: "Sports",
    summary: "Ronaldo delivers again with a stunning hat-trick.",
    content:
      "Cristiano Ronaldo showed his class with three goals as Al Nassr secured an emphatic victory in the Saudi Pro League...",
  },
  {
    id: "4",
    title: "Grammy Awards 2025: Full Winners List",
    category: "Entertainment",
    summary: "Highlights from this year’s biggest night in music.",
    content:
      "The 2025 Grammys saw big wins for Taylor Swift, Burna Boy, and Billie Eilish. Here’s the full list of winners and performances...",
  },
];

// Reusable Feed Component
function NewsFeed({ navigation, category }: any) {
  const filtered = newsData.filter((item) => item.category === category);

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("NewsDetail", { item })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.summary}>{item.summary}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Sports Screen
function SportsScreen({ navigation }: any) {
  return <NewsFeed navigation={navigation} category="Sports" />;
}

// Entertainment Screen
function EntertainmentScreen({ navigation }: any) {
  return <NewsFeed navigation={navigation} category="Entertainment" />;
}

// Profile Screen
function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text>Customize your news feed and preferences here.</Text>
    </View>
  );
}

// News detail screen
function NewsDetailScreen({ route }: any) {
  const { item } = route.params;
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
    </ScrollView>
  );
}

// Bottom Tabs
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Sports" component={SportsScreen} />
      <Tab.Screen name="Entertainment" component={EntertainmentScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// App Entry
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="NewsApp" component={MainTabs} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
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
  summary: { fontSize: 14, color: "#555" },
  content: { fontSize: 16, marginTop: 10, lineHeight: 22 },
});
