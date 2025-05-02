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
  PermissionsAndroid,
  Keyboard,
  ActivityIndicator
} from "react-native";
import * as FileSystem from 'expo-file-system';

import { TextInput, Card } from "react-native-paper";
import { useRouter } from "expo-router";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import * as MediaLibrary from "expo-media-library";
import { post_styles } from "@/styles/post";
import { createPost } from "@/api/post";
import { sendPost } from "@/types/post";
import { useUserContext } from "@/context/UserContext";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import ImageAdjustmentModal from "@/components/ImageAdjustmentModal";

export default function Post() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [adjustedImageUri, setAdjustedImageUri] = useState<string | null>(null);
  const [imageAdjustmentVisible, setImageAdjustmentVisible] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);

  const router = useRouter();

  const { user } = useUserContext();
  const id = user?.uuid;
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

  const requestAndroidMediaPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: "Access Your Photos",
            message: "We need access to your media to let you choose photos.",
            buttonPositive: "OK",
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles this differently
  };

  // Fetch photos from the media library
  useEffect(() => {
    const fetchPhotos = async () => {
      setPhotosLoading(true);
      let granted = true;

      if (Platform.OS === "android") {
        granted = await requestAndroidMediaPermissions();
      } else {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        granted = status === "granted";
      }

      if (!granted) {
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
      setPhotosLoading(false);
    };

    fetchPhotos();
  }, []);

  // Load more photos from the media library
  const loadMorePhotos = async () => {
    if (loadingMore) return;
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
    setImageAdjustmentVisible(true);
  };

  // Handle taking a photo with the camera
  const takePhoto = async () => {
    // Request camera permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access the camera is required!');
      return;
    }

    // Options for cropping and quality
    const options: ImagePicker.ImagePickerOptions = {
      allowsEditing: false,   // Allow editing (crop)
      quality: 1,            // High quality
    };

    // Launch the camera
    const result = await ImagePicker.launchCameraAsync(options);
    
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Remove the selected image
  const removeImage = () => {
    setImage(null);
    setAdjustedImageUri(null);
  };

  // Handle saving the adjusted image
  const handleSaveAdjustedImage = (uri: string) => {
    setAdjustedImageUri(uri);
    setImage(uri);
    setImageAdjustmentVisible(false);
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
        [{ resize: { width: 300 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const base64Image = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const newPost: sendPost = {
        uuid: id,
        caption,
        images: [base64Image]
      };

      const response = await createPost(newPost);
      const postId = response.postID;
      console.log("Created post with ID:", postId);
      setCaption("");
      setImage(null);
      setAdjustedImageUri(null);

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

  // Handle selecting an image from the camera roll
  const pickImageFromCameraRoll = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      // Get the selected image URI
      const selectedImageUri = result.assets[0].uri;

      // Get the original image dimensions
      const { width } = await ImageManipulator.manipulateAsync(selectedImageUri, [], {
        format: ImageManipulator.SaveFormat.PNG,
      });

      // Calculate the target dimensions for a 4:3 aspect ratio
      const targetWidth = width;

      // Resize or crop the image to fit the 4:3 aspect ratio
      const resizedImage = await ImageManipulator.manipulateAsync(
        selectedImageUri,
        [
          { resize: { width: targetWidth } },
        ],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Set the resized image
      setImage(resizedImage.uri);
      setSelectedImageUri(resizedImage.uri);
      setImageAdjustmentVisible(true); // Open adjustment modal if needed
    }
  };

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
              style={[post_styles.continueButton, (loading || !image || caption.trim() === "") && post_styles.disabledButton]}
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
                <Image
                  source={{ uri: adjustedImageUri || image }}
                  style={post_styles.image}
                />
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
                <TouchableOpacity onPress={takePhoto} style={post_styles.takePhotoButton}>
                  <Ionicons name="camera" size={20} color="#fff" style={post_styles.cameraIcon} />
                  <Text style={post_styles.takePhotoText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Bottom Half Android: Choose image from Camera Roll */}
          {Platform.OS === 'android' && (
            <TouchableOpacity onPress={pickImageFromCameraRoll} style={post_styles.androidImageUpload}>
              <Ionicons name="images" size={20} color="#fff" style={post_styles.androidCameraIcon} />
              <Text style={post_styles.androidTakePhotoText}>Choose from Camera Roll</Text>
            </TouchableOpacity>
          )}

          {/* Bottom Half iOS: Image Gallery */}
          {Platform.OS === 'ios' && (
            photosLoading ? (
              <View style={post_styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 10 }} />
              </View>
            ) : (
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
                  loadingMore  && photos.length > 40 ? (
                    <View style={post_styles.loadingContainer}>
                      <Text>Loading more photos...</Text>
                    </View>
                  ) : null
                }
              />
            )
          )}
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
              activeUnderlineColor={Colors.light.primary}
              activeOutlineColor={Colors.light.primary}
            />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Image Adjustment Modal */}
      <ImageAdjustmentModal
        visible={imageAdjustmentVisible}
        imageUri={selectedImageUri}
        onSave={handleSaveAdjustedImage}
        onCancel={() => setImageAdjustmentVisible(false)}
      />
    </SafeAreaView>
  );
}
