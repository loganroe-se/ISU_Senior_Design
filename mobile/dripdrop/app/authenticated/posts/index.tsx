import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Dimensions,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createPost } from "@/api/post";
import { useUserContext } from "@/context/UserContext";
import { Colors } from "@/constants/Colors";

export default function InstagramStylePost() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUserContext();
  const id = user?.uuid;

  const handleImagePick = async (fromCamera = false) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 5],
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 5],
          quality: 1,
        });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
    }
  };

  const handlePost = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const newPost = {
        uuid: id,
        caption,
        images: [manipResult.base64 || ""],
      };

      const response = await createPost(newPost);
      router.push({
        pathname: "./posts/processing_post",
        params: { caption, image, postId: response.postID },
      });
    } catch (e) {
      console.error("Error posting:", e);
    } finally {
      setLoading(false);
      setCaption("");
      setImage(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerText}>New Post</Text></View>
      <View style={styles.imagePreviewContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.selectionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleImagePick(false)}>
              <Ionicons name="images" size={24} color="#fff" />
              <Text style={styles.buttonText}>Choose Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleImagePick(true)}>
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <TextInput
        placeholder="Write a caption..."
        value={caption}
        onChangeText={setCaption}
        style={styles.captionInput}
        multiline
      />
      <TouchableOpacity
        style={[styles.postButton, (!image || loading) && styles.disabledButton]}
        onPress={handlePost}
        disabled={!image || loading}
      >
        <Text style={styles.postButtonText}>{loading ? "Posting..." : "Share"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  imagePreviewContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: Dimensions.get("window").width * 1.25,
    backgroundColor: "#f0f0f0",
  },
  imagePreview: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").width * 1.25,
  },
  selectionButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  captionInput: {
    padding: 16,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  postButton: {
    margin: 16,
    padding: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});
