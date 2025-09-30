import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import * as Location from "expo-location";

export default function LocationExample() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const getLocation = async () => {
    // Request permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    // Get current position
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      {errorMsg && <Text>{errorMsg}</Text>}
      {location ? (
        <Text>
          Latitude: {location.coords.latitude}{"\n"}
          Longitude: {location.coords.longitude}
        </Text>
      ) : (
        <Text>Fetching location...</Text>
      )}
      <Button title="Refresh Location" onPress={getLocation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
});
