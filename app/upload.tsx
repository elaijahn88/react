import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import DocumentPicker from "react-native-document-picker";

type UploadStatus = "idle" | "uploading" | "successful" | "failed";

const VideoUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("");

  const handleFileSelect = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.video],
      });
      setSelectedFile(res);
      setMessage("");
      setUploadStatus("idle");
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        console.log("User cancelled file picker");
      } else {
        console.error("DocumentPicker error:", err);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a video file first!");
      return;
    }

    setUploadStatus("uploading");
    setMessage("");

    const formData = new FormData();
    formData.append("video", {
      uri: selectedFile.uri,
      name: selectedFile.name || "video.mp4",
      type: selectedFile.type || "video/mp4",
    });

    const uploadUrl = "YOUR_UPLOAD_ENDPOINT_URL"; // Replace with your server's endpoint

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus("successful");
        setMessage(`Upload successful! Server response: ${JSON.stringify(result)}`);
        setSelectedFile(null);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Video upload failed.");
      }
    } catch (error: any) {
      setUploadStatus("failed");
      setMessage(error?.message || "An unexpected error occurred.");
      console.error("Upload error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Upload a Video</Text>

      <TouchableOpacity style={styles.selectButton} onPress={handleFileSelect}>
        <Text style={styles.buttonText}>Choose Video</Text>
      </TouchableOpacity>

      {selectedFile && (
        <Text style={styles.fileText}>
          Selected file: <Text style={{ fontWeight: "bold" }}>{selectedFile.name}</Text>
        </Text>
      )}

      <TouchableOpacity
        style={[styles.uploadButton, !selectedFile && { backgroundColor: "#aaa" }]}
        onPress={handleUpload}
        disabled={!selectedFile || uploadStatus === "uploading"}
      >
        {uploadStatus === "uploading" ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Upload Video</Text>
        )}
      </TouchableOpacity>

      {uploadStatus !== "idle" && <Text>Status: {uploadStatus}</Text>}
      {message ? <Text>{message}</Text> : null}
    </View>
  );
};

export default VideoUploader;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 5,
    marginVertical: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  fileText: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
  },
});
