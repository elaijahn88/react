import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { Audio } from "expo-av";

export default function AudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [soundUri, setSoundUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission denied", "Please allow audio recording");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setSoundUri(uri || null);
    setRecording(null);
    console.log("Recording stopped, saved at:", uri);
  };

  const playRecording = async () => {
    if (!soundUri) return;
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: soundUri });
    setSound(newSound);
    await newSound.playAsync();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Audio Recorder</Text>
      <Button
        title={isRecording ? "Recording..." : "Start Recording"}
        onPress={startRecording}
        disabled={isRecording}
      />
      <Button title="Stop Recording" onPress={stopRecording} disabled={!isRecording} />
      <Button title="Play Recording" onPress={playRecording} disabled={!soundUri} />
      {soundUri && <Text style={styles.uriText}>Recorded file: {soundUri}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  uriText: { marginTop: 15, fontSize: 12, color: "gray", textAlign: "center" },
});
