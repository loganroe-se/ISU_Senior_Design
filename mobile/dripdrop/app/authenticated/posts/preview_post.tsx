import React, {useState} from "react";
import { View, Image } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { preview_post_styles } from "@/styles/post";
import { publishPost } from "@/api/post";


export default function PreviewPost() {
  const router = useRouter();
  const { caption, image, postID } = useLocalSearchParams(); // Get passed params
  const [loading, setLoading] = useState(false);



  const handleSubmitPost = async () => {
    if (!postID) {
      alert("Error: Missing post ID.");
      return;
    }

    setLoading(true);
    try {
      const parsedPostID = Array.isArray(postID) ? parseInt(postID[0], 10) : parseInt(postID, 10);
      await publishPost(parsedPostID);
      alert("Your post has been submitted!");
      router.push("./home"); // Redirect after successful post
    } catch (error) {
      alert("Failed to submit post. Please try again.");
      console.error("Error publishing post:", error);
    } finally {
      setLoading(false);
    }
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
        loading={loading}  // Shows a loading indicator
        disabled={loading || !postID} // Prevents submission if no postID
      >
        Submit Post
      </Button>

    </View>
  );
}


