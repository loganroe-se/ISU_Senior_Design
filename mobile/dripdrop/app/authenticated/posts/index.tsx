import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard
} from "react-native";
import { Button, TextInput, Card } from "react-native-paper";
import { useRouter } from "expo-router";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import * as MediaLibrary from "expo-media-library";
import { post_styles } from "@/styles/post";
import { createPost } from "@/api/post";
import { sendPost } from "@/types/post";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { useUserContext } from "@/context/UserContext";

export default function Post() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const router = useRouter();

  const { user } = useUserContext();
  const id = user?.id;
  if (id === undefined) {
    throw new Error("User ID is undefined. Please ensure the user is logged in.");
  }

  useEffect(() => {
    const fetchPhotos = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access media library is required!");
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        first: 40,
        mediaType: MediaLibrary.MediaType.photo,
      });

      const assetsWithFileUris = await Promise.all(
        media.assets.map(async (asset) => {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
          return { ...asset, uri: assetInfo.localUri || asset.uri };
        })
      );

      setPhotos(assetsWithFileUris);
    };

    fetchPhotos();
  }, []);

  const loadMorePhotos = async () => {
    if (loadingMore) return; // Prevent multiple requests
    setLoadingMore(true);

    const media = await MediaLibrary.getAssetsAsync({
      first: 100,
      mediaType: MediaLibrary.MediaType.photo,
      after: photos[photos.length - 1]?.id,
    });

    const assetsWithFileUris = await Promise.all(
      media.assets.map(async (asset) => {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
        return { ...asset, uri: assetInfo.localUri || asset.uri };
      })
    );

    setPhotos((prevPhotos) => [...prevPhotos, ...assetsWithFileUris]);
    setLoadingMore(false);
  };

  const handleImageSelect = async (selectedImage: MediaLibrary.Asset) => {
    const assetInfo = await MediaLibrary.getAssetInfoAsync(selectedImage.id);
    setImage(assetInfo.localUri || selectedImage.uri);
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
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const previewPost = {
        caption,
        imageUri: manipulatedImage.uri,
      };

      const newPost: sendPost = {
        userID: id,
        caption,
        images: [manipulatedImage.uri],
      };

      const response = await createPost(newPost);

      console.log("Post preview:", previewPost);
      setSnackbarVisible(true);
      setCaption("");
      setImage(null);

      router.push({
        pathname: "./posts/processing_post",
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

  const numColumns = Math.min(
    Math.floor(Dimensions.get("window").width / (Dimensions.get("window").width / 4)),
    4
  );

  return (
    <SafeAreaView style={post_styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior based on platform
          style={post_styles.container}
        >
          <TouchableOpacity onPress={() => router.replace("/authenticated")} style={post_styles.backButton}>
            <Ionicons name="arrow-back-circle" size={40} color="grey" />
          </TouchableOpacity>

          {/* Top Half: Selected Image */}
          <Card style={post_styles.cardContainer}>
            {image ? (
              <View style={post_styles.imageContainer}>
                <Image source={{ uri: image }} style={post_styles.image} />
                <Button
                  mode="contained"
                  onPress={removeImage}
                  style={[post_styles.button, post_styles.removeButton]}
                  textColor="#fff"
                >
                  Remove Image
                </Button>
              </View>
            ) : (
              <View style={post_styles.placeholderContainer}>
                <Ionicons name="image-outline" size={50} color={Colors.light.primary} />
                <Text style={post_styles.placeholderText}>No image selected</Text>
              </View>
            )}
          </Card>

          {/* Bottom Half: Image Gallery */}
          <FlatList
            data={photos}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleImageSelect(item)}>
                <Image source={{ uri: item.uri }} style={post_styles.thumbnail} />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            onEndReached={loadMorePhotos}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={post_styles.loadingContainer}>
                  <Text>Loading...</Text>
                </View>
              ) : null
            }
          />

          {/* Caption Input and Continue Button */}
          <View style={post_styles.bottomContainer}>
            <TextInput
              label="Caption"
              value={caption}
              onChangeText={setCaption}
              mode="outlined"
              style={post_styles.input
              }
              textColor="#000"
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
                post_styles.button,
                {
                  backgroundColor:
                    loading || !image || caption.trim() === ""
                      ? "gray"
                      : Colors.light.primary,
                },
              ]}
            >
              {loading ? "Loading..." : "Continue"}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}