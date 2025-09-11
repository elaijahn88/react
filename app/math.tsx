import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

type RootStackParamList = {
  Tabs: undefined;
  TopicDetail: { topic: MathTopic };
};

type MathTopic = {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
};

type Exercise = {
  id: string;
  question: string;
  options: string[];
  correct: string;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Dummy Math Topics
const topics: MathTopic[] = [
  {
    id: "1",
    title: "Algebra",
    description: "Solve equations and factor expressions.",
    exercises: [
      {
        id: "e1",
        question: "Solve: 2x + 3 = 7",
        options: ["x=1", "x=2", "x=3", "x=4"],
        correct: "x=2",
      },
      {
        id: "e2",
        question: "Factor: x^2 - 9",
        options: ["(x-3)(x+3)", "x^2-3", "(x-9)(x+1)", "x^2+9"],
        correct: "(x-3)(x+3)",
      },
    ],
  },
  {
    id: "2",
    title: "Geometry",
    description: "Learn about areas, volumes, and shapes.",
    exercises: [
      {
        id: "e1",
        question: "Area of triangle with base=5, height=6?",
        options: ["15", "11", "30", "12"],
        correct: "15",
      },
      {
        id: "e2",
        question: "Pythagoras: a=3, b=4, find c?",
        options: ["5", "6", "7", "4"],
        correct: "5",
      },
    ],
  },
  {
    id: "3",
    title: "Calculus",
    description: "Derivatives, integrals, and limits.",
    exercises: [
      {
        id: "e1",
        question: "Derivative of x^2?",
        options: ["2x", "x^2", "1", "x"],
        correct: "2x",
      },
      {
        id: "e2",
        question: "Integral of 2x dx?",
        options: ["x^2 + C", "2x + C", "x + C", "x^2/2 + C"],
        correct: "x^2 + C",
      },
    ],
  },
];

// Topic List Screen
function TopicsScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <FlatList
        data={topics}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("TopicDetail", { topic: item })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Topic Detail Screen
function TopicDetailScreen({ route }: any) {
  const { topic } = route.params;
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<string[]>([]);

  const handleAnswer = (exId: string, option: string, correct: string) => {
    if (answered.includes(exId)) return;

    setAnswered([...answered, exId]);
    if (option === correct) {
      setScore(score + 1);
      Alert.alert("Correct!", "Well done!");
    } else {
      Alert.alert("Wrong!", `Correct answer: ${correct}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{topic.title}</Text>
      <Text style={styles.desc}>{topic.description}</Text>
      <Text style={styles.score}>Score: {score}</Text>

      {topic.exercises.map((ex) => (
        <View key={ex.id} style={styles.exercise}>
          <Text style={styles.question}>{ex.question}</Text>
          {ex.options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.optionButton}
              onPress={() => handleAnswer(ex.id, opt, ex.correct)}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

// Profile Screen
function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>Track your learning progress here.</Text>
    </View>
  );
}

// Bottom Tabs
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Topics" component={TopicsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// App Entry
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  card: { backgroundColor: "#fff", padding: 15, marginBottom: 10, borderRadius: 10, elevation: 2 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  desc: { fontSize: 14, color: "#555", marginBottom: 10 },
  exercise: { padding: 10, marginVertical: 5, borderBottomWidth: 1, borderColor: "#ddd" },
  question: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  optionButton: { backgroundColor: "#eee", padding: 10, marginVertical: 3, borderRadius: 5 },
  optionText: { fontSize: 14 },
  score: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
});
