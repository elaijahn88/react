import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null; // Wait for fonts to load
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Main tab navigator */}
        <Stack.Screen name="explorer" options={{ headerShown: false }} />

        {/* Not found screen */}
        <Stack.Screen name="+not-found" />

        {/* Additional screens */}
        <Stack.Screen 
          name="DashboardScreen" 
          options={{ title: 'D', headerShown: true }} 
        />
        <Stack.Screen 
          name="ProfileScreen" 
          options={{ title: 'Profile', headerShown: true }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
