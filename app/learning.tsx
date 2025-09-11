// App.tsx
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

type RootStackParamList = {
  Learning: undefined;
  CourseDetail: { course: Course };
};

type Lesson = {
  id: string;
  title: string;
  duration: string;
};

type Course = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Dummy course data
const courses: Course[] = [
  {
    id: "1",
    title: "React Native for Beginners",
    description: "Learn to build mobile apps using React Native.",
    lessons: [
      { id: "l1", title: "Introduction to React Native", duration: "10 min" },
      { id: "l2", title: "Setting up Expo", duration: "15 min" },
      { id: "l3", title: "First App Walkthrough", duration: "20 min" },
    ],
  },
  {
    id: "2",
    title: "JavaScript Mastery",
    description: "Deep dive into JavaScript fundamentals.",
    lessons: [
      { id: "l1", title: "Variables & Data Types", duration: "12 min" },
      { id: "l2", title: "Functions & Scope", duration: "18 min" },
      { id: "l3", title: "Asynchronous JS", duration: "25 min" },
    ],
  },
];

// Courses screen
function CoursesScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("CourseDetail", { course: item })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Course detail screen
function CourseDetailScreen({ route }: any) {
  const { course } = route.params;
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.desc}>{course.description}</Text>
      <Button title="Enroll Now" onPress={() => alert("Enrollment feature coming soon!")} />
      <Text style={styles.sectionTitle}>Lessons</Text>
      {course.lessons.map((lesson: Lesson) => (
        <View key={lesson.id} style={styles.lesson}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDuration}>{lesson.duration}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// My Courses (enrolled placeholder)
function MyCoursesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Courses</Text>
      <Text>You have not enrolled in any courses yet.</Text>
    </View>
  );
}

// Profile screen
function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Button title="Logout" onPress={() => alert("Logout feature coming soon!")} />
    </View>
  );
}

// Tabs navigation
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Courses" component={CoursesScreen} />
      <Tab.Screen name="My Courses" component={MyCoursesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Learning" component={MainTabs} />
        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
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
  desc: { fontSize: 14, color: "#555" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  lesson: { padding: 10, borderBottomWidth: 1, borderColor: "#ddd" },
  lessonTitle: { fontSize: 15 },
  lessonDuration: { fontSize: 12, color: "gray" },
});
