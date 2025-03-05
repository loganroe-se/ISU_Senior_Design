import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, TextInput, Snackbar, Card } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export default function Post() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    Alert.alert(
      "Select Image",
      "Choose an option to select an image:",
      [
        { text: "Take a Photo", onPress: () => launchCamera() },
        { text: "Choose from Library", onPress: () => launchImageLibrary() },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const launchImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleContinue = async () => {
    if (!image) {
      alert("Please select an image first!");
      return;
    }

    setLoading(true);

    try {
      // Resize and compress the image before showing it (no post submission here)
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 800 } }], // Resize to 800px width (adjust as needed)
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress to 70% quality
      );

      // Temporarily show a post preview in the snackbar or state without sending it
      const previewPost = {
        caption,
        imageUri: manipulatedImage.uri, // Display the image preview
      };

      console.log("Post preview:", previewPost);

      // Optionally show a snackbar message
      setSnackbarVisible(true);

      // Reset caption and image
      setCaption("");
      setImage(null);

      // Navigate to the processing post screen
      router.push({
        pathname: "./posts/processing_post" as any,
        params: {
          caption: caption,
          image: image,
        },
      });
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post preview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>

        <Card style={styles.cardContainer}>
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <Button
                mode="contained"
                onPress={removeImage}
                style={[styles.button, styles.removeButton]}
              >
                Remove Image
              </Button>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={pickImage}
              style={[styles.button, styles.uploadButton]}
              icon="cloud-upload"
            >
              Upload
            </Button>
          )}
        </Card>

        <TextInput
          label="Caption"
          value={caption}
          onChangeText={setCaption}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Write a caption..."
        />
        <Button
          mode="contained"
          onPress={handleContinue}
          loading={loading}
          disabled={loading || !image || caption.trim() === ""}
          style={[
            styles.button,
            {
              backgroundColor:
                loading || !image || caption.trim() === ""
                  ? "gray" // Disabled state color
                  : Colors.light.primary, // Primary color when enabled
            },
          ]}
        >
          {loading ? "Loading..." : "Continue"}
        </Button>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          Post created successfully (Preview)!
        </Snackbar>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    flex: 1, // Ensures it fills available space
    padding: 20,
    alignItems: "center",
    justifyContent: "center", // Centers content vertically
  },
  backButton: {
    position: "absolute",
    top: "10%",
    left: 16,
    zIndex: 10,
  },
  cardContainer: {
    width: "90%",
    padding: 20,
    alignItems: "center",
    marginVertical: 20, // Keeps spacing consistent
    borderRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    borderRadius: 8,
  },
  uploadButton: {
    backgroundColor: Colors.light.primary,
  },
  removeButton: {
    backgroundColor: Colors.redButtonColor,
  },
  input: {
    width: "90%",
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 8,
  },
});
