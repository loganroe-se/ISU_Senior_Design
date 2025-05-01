import React, { useState, useEffect } from "react";
import { View, Image, Alert, ActivityIndicator } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { processing_post_styles } from "@/styles/post";  // Import the styles from the post.tsx file
import { Colors } from "@/constants/Colors";  // Import your app's color constants
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPostById } from "@/api/post";
import { useUserContext } from "@/context/UserContext";

export default function ProcessingScreen() {
  const router = useRouter();
  const { caption, image, postId } = useLocalSearchParams();
  const [storedUsername, setStoredUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

    const { user } = useUserContext();

  const handleNavigateToProfile = () => {
    // Navigate to the ImageMarker screen with the current caption and image data
    router.replace({
      pathname: "/authenticated/profile",
      params: { tab: "NEEDS_REVIEW" }
    });
  };
  // Fetch the username from AsyncStorage when the component mounts
  useEffect(() => {
    const fetchUsername = async () => {
      const username = await AsyncStorage.getItem("username");
      setStoredUsername(username);
    };

    fetchUsername();
  }, []);


  // function to verify status before navigation
  const handleVerifyClothingInfo = async () => {
    if (!postId) {
      Alert.alert("Error", "Post ID is missing.");
      return;
    }

    setLoading(true);

    try {
      const post = await getPostById(Number(postId));

      if (post.status === "NEEDS_REVIEW") {
        router.push({
          pathname: "./image_marker",
          params: { caption, image, postId },
        });
      } else {
        Alert.alert("Post Not Ready", "AI is still processing your post.");
      }
    } catch (error) {
      console.error("Error verifying post status:", error);
      Alert.alert("Error", "Failed to verify post status. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={processing_post_styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={processing_post_styles.title}>Our AI is processing your post</Text>
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
          onPress={handleVerifyClothingInfo}
          disabled={loading}
          style={[processing_post_styles.button, { borderColor: Colors.light.primary }]}
          labelStyle={{ color: Colors.light.primary }}
          icon={() =>
            loading ? (
              <ActivityIndicator size="small" color={Colors.light.primary} />
            ) : (
              <Ionicons name="exit-outline" size={20} color={Colors.light.primary} />
            )
          }
        >
          {loading ? "Verifying..." : "Finish Post"}
        </Button>

        <Button
          mode="contained"
          onPress={handleNavigateToProfile}
          style={[processing_post_styles.button, { backgroundColor: Colors.light.primary }]}
          labelStyle={{ color: "#fff" }}
        >
          View Post in Drafts
        </Button>
      </View>
    </View>

  );
}