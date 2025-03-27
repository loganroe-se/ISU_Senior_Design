import React from "react";
import { View, Image } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { preview_post_styles } from "@/styles/post";

export default function PreviewPost() {
  const router = useRouter();
  const { caption, image } = useLocalSearchParams(); // Get passed params

  const handleSubmitPost = () => {
    // Replace this with the actual logic to submit the post
    alert("Your post has been submitted!");
  };

  const handleGoBack = () => {
    router.back(); // Go back to the previous screen (Post.tsx)
  };

  return (
    <View style={preview_post_styles.container}>
      <Text style={preview_post_styles.title}>Preview Your Post</Text>

      {image && (
        <Image
          source={{ uri: Array.isArray(image) ? image[0] : image }}
          style={preview_post_styles.image}
        />
      )}
      {caption && <Text style={preview_post_styles.caption}>{caption}</Text>}

      <Button
        mode="outlined"
        onPress={handleGoBack} // Go back to the Post screen
        style={preview_post_styles.button}
      >
        Previous
      </Button>
      <Button
        mode="contained"
        onPress={handleSubmitPost} // Submit the post
        style={preview_post_styles.button}
      >
        Submit Post
      </Button>
    </View>
  );
}


