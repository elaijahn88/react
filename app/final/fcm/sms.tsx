import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SignupScreen from "../signup";
import LoginScreen from "../login";
import HomeScreen from "../home";

export type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: { profile: { uid: string; email: string; name: string } };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Signup">
        <Stack.Screen name="Signup" component={signup} />
        <Stack.Screen name="Login" component={login} />
        <Stack.Screen name="Home" component={home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
