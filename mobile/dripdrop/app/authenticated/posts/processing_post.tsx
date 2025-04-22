import React, { useState, useEffect } from "react";
import { View, Image } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { processing_post_styles } from "@/styles/post";  // Import the styles from the post.tsx file
import { Colors } from "@/constants/Colors";  // Import your app's color constants
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProcessingScreen() {
  const router = useRouter();
  const { caption, image, postId } = useLocalSearchParams();
  const [storedUsername, setStoredUsername] = useState<string | null>(null);


  const handleNavigateToImageMarker = () => {
    // Navigate to the ImageMarker screen with the current caption and image data
    router.push({
      pathname: "./image_marker",
      params: { caption, image, postId }, // Pass caption and image as parameters
    });
    console.log("Passed the following POSTID: " + postId)
  };
  // Fetch the username from AsyncStorage when the component mounts
  useEffect(() => {
    const fetchUsername = async () => {
      const username = await AsyncStorage.getItem("username");
      setStoredUsername(username);
    };

    fetchUsername();
  }, []);

  return (
    <View style={processing_post_styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={processing_post_styles.title}>We are currently processing your draft</Text>
        <Text style={processing_post_styles.subtitle}>
          Come back soon to finish the post and share it with the world!
        </Text>

        {image && (
          <Image
            source={{ uri: Array.isArray(image) ? image[0] : image }}
            style={processing_post_styles.image}
          />
        )}
        {caption && storedUsername && (
          <Text style={processing_post_styles.caption}>
            <Text style={{ fontWeight: "bold", color: "black" }}>{storedUsername} </Text>
            {caption}
          </Text>
        )}
      </View>

      <View style={processing_post_styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => router.replace("/authenticated/profile")}
          style={[processing_post_styles.button, { borderColor: Colors.light.primary }]}
          labelStyle={{ color: Colors.light.primary }}
          icon={() => <Ionicons name="exit-outline" size={20} color={Colors.light.primary} />}
        >
          Exit and Come Back Later
        </Button>
        <Button
          mode="contained"
          onPress={handleNavigateToImageMarker}
          style={[processing_post_styles.button, { backgroundColor: Colors.light.primary }]}
          labelStyle={{ color: "#fff" }}
        >
          Go to Image Marker Screen
        </Button>
      </View>
    </View>

  );
}