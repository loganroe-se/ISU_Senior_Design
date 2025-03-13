import React from "react";
import { View, Image } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { preview_post_styles } from "@/styles/post";  // Import the styles from the post.tsx file
import { Colors } from "@/constants/Colors";  // Import your app's color constants

export default function ProcessingScreen() {
  const router = useRouter();
  const { caption, image } = useLocalSearchParams();

  const handleNavigateToPreviewPost = () => {
    // Navigate to the PreviewPost screen with the current caption and image data
    router.back();
  };
  return (
    <View style={preview_post_styles.container}>
      <Text style={preview_post_styles.title}>We are Currently Processing Your Post</Text>

      {image && (
        <Image
          source={{ uri: Array.isArray(image) ? image[0] : image }}
          style={preview_post_styles.image}
        />
      )}
      {caption && <Text style={preview_post_styles.caption}>{caption}</Text>}

      <Button
        mode="contained"
        onPress={() => alert("AI is still processing, please wait.")}
        style={[preview_post_styles.button, { backgroundColor: Colors.light.primary }]}
        labelStyle={{ color: "#fff" }} // White text for the contained button
        icon="progress-clock"
      >
        Wait for AI to Finish Processing
      </Button>
      <Button
        mode="outlined"
        onPress={() => {
          router.replace('/authenticated');
        }}
        style={[preview_post_styles.button, { borderColor: Colors.light.primary }]}
        labelStyle={{ color: Colors.light.primary }} // Primary color text for the outlined button
        icon={() => <Ionicons name="exit-outline" size={20} color={Colors.light.primary} />}
      >
        Exit and Come Back Later
      </Button>
      <Button
        mode="contained"
        onPress={handleNavigateToPreviewPost} // Temp button to navigate to PreviewPost screen
        style={[preview_post_styles.button, { backgroundColor: Colors.light.primary }]}
        labelStyle={{ color: "#fff" }} // White text for the contained button
      >
        Go to Preview Post
      </Button>
    </View>
  );
}