import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
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
import { Button, TextInput, Snackbar, Card } from "react-native-paper";
import { useRouter } from "expo-router";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import * as MediaLibrary from "expo-media-library";

export default function Post() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const router = useRouter();

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

      console.log("Post preview:", previewPost);
      setSnackbarVisible(true);
      setCaption("");
      setImage(null);

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

  const numColumns = Math.min(
    Math.floor(Dimensions.get("window").width / (Dimensions.get("window").width / 4)),
    4
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior based on platform
        style={styles.container}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>

        {/* Top Half: Selected Image */}
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
            <View style={styles.placeholderContainer}>
              <Ionicons name="image-outline" size={50} color={Colors.light.primary} />
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </Card>

        {/* Bottom Half: Image Gallery */}
        <FlatList
          data={photos}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleImageSelect(item)}>
              <Image source={{ uri: item.uri }} style={styles.thumbnail} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          onEndReached={loadMorePhotos}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
              </View>
            ) : null
          }
        />

        {/* Caption Input and Continue Button */}
        <View style={styles.bottomContainer}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10, // To add spacing at the top
  },
  backButton: {
    top: 20,
    left: 16,
    zIndex: 10,
  },
  cardContainer: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  placeholderText: {
    color: Colors.light.primary,
    fontSize: 16,
  },
  thumbnail: {
    width: Dimensions.get("window").width / 4 - 10,
    height: Dimensions.get("window").width / 4 - 10,
    margin: 5,
    borderRadius: 5,
  },
  button: {
    borderRadius: 8,
  },
  removeButton: {
    backgroundColor: Colors.redButtonColor,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 10,
    width: "90%",
    alignSelf: "center",
  },
  bottomContainer: {
    width: "90%",
    alignSelf: "center",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
});