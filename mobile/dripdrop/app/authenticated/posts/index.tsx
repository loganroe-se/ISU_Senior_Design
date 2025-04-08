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
  Keyboard,
  Modal,
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
import { useUserContext } from "@/context/UserContext";
import * as ImagePicker from "expo-image-picker"; // For camera functionality
import { Camera } from "expo-camera"; // For camera functionality
import ImageAdjustmentModal from "@/components/ImageAdjustmentModal";


export default function Post() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const router = useRouter();

  const { user } = useUserContext();
  const id = user?.id;
  if (id === undefined) {
    throw new Error("User ID is undefined. Please ensure the user is logged in.");
  }

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === "granted");
    })();
  }, []);

  // Fetch photos from the media library
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

  // Load more photos from the media library
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

  // Handle image selection from the gallery
  const handleImageSelect = async (selectedImage: MediaLibrary.Asset) => {
    const assetInfo = await MediaLibrary.getAssetInfoAsync(selectedImage.id);
    setSelectedImageUri(assetInfo.localUri || selectedImage.uri);
    setModalVisible(true); // Open the modal for gallery images
  };

  // Handle taking a photo with the camera
  const takePhoto = async () => {
    if (cameraPermission === null) {
      alert("Camera permission is still being requested.");
      return;
    }
    if (!cameraPermission) {
      alert("Camera permission is required to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Allow the user to adjust the frame in the camera
      aspect: [1, 1], // Square aspect ratio
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImageUri(result.assets[0].uri);
      setImage(result.assets[0].uri); // Directly set the image without opening the modal
    }
  };

  // Remove the selected image
  const removeImage = () => {
    setImage(null);
  };

  // Handle saving the adjusted image (for gallery images)
  const handleSaveAdjustedImage = async () => {
    if (selectedImageUri) {
      setImage(selectedImageUri); // Set the adjusted image
      setModalVisible(false); // Close the modal
    }
  };

  // Handle continuing to create the post
  const handleContinue = async () => {
    if (!image) {
      alert("Please select an image first!");
      return;
    }
    Keyboard.dismiss();
    setLoading(true);

    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const newPost: sendPost = {
        userID: id,
        caption,
        images: [manipulatedImage.uri],
      };

      const response = await createPost(newPost);
      const postId = response.postID;
      console.log("Created post with ID:", postId);

      setSnackbarVisible(true);
      setCaption("");
      setImage(null);

      router.push({
        pathname: "./posts/processing_post",
        params: {
          caption: caption,
          image: image,
          postId: postId
        },
      });
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={post_styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
        >
          {/* Top Navigation Bar */}
          <View style={post_styles.topBar}>
            <TouchableOpacity onPress={() => router.replace("/authenticated")} style={post_styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleContinue}
              disabled={loading || !image || caption.trim() === ""}
              style={[
                post_styles.continueButton,
                (loading || !image || caption.trim() === "") && post_styles.disabledButton, // Apply the disabled button style
              ]}
            >
              <Text
                style={[post_styles.continueText, loading && post_styles.loadingText, (loading || !image || caption.trim() === "") && post_styles.disabledText]}
              >
                {loading ? "Loading..." : "Continue"}
              </Text>
            </TouchableOpacity>

          </View>

          {/* Top Half: Selected Image */}
          <Card style={post_styles.cardContainer}>
            {image ? (
              <View style={post_styles.imageContainer}>
                <Image source={{ uri: image }} style={post_styles.image} />
                {/* X Icon in the top-right corner */}
                <TouchableOpacity
                  onPress={removeImage}
                  style={post_styles.removeIconContainer}
                >
                  <Ionicons name="close-outline" size={40} color={'red'} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={post_styles.placeholderContainer}>
                <Ionicons name="image-outline" size={50} color={Colors.light.primary} />
                <Text style={post_styles.placeholderText}>
                  No image selected.
                </Text>
                {/* Take Photo Button */}
                <TouchableOpacity onPress={takePhoto} style={post_styles.takePhotoButton}>
                  <Ionicons name="camera" size={20} color="#fff" style={post_styles.cameraIcon} />
                  <Text style={post_styles.takePhotoText}>Take Photo</Text>
                </TouchableOpacity>
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

          {/* Caption Input */}
          <View style={post_styles.bottomContainer}>
            <TextInput
              label="Caption"
              value={caption}
              onChangeText={setCaption}
              mode="outlined"
              style={post_styles.input}
              textColor="#000"
              multiline
              numberOfLines={4}
              placeholder="Write a caption..."
              activeUnderlineColor={Colors.light.primary} // Set the focus color to your primary color
              activeOutlineColor={Colors.light.primary} //
            />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <ImageAdjustmentModal
        visible={modalVisible}
        imageUri={selectedImageUri}
        onSave={handleSaveAdjustedImage}
        onCancel={() => setModalVisible(false)}
      />

    </SafeAreaView>
  );
}
