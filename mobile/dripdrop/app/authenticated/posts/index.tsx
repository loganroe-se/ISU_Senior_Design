import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Dimensions,
  Text,
  SafeAreaView,
<<<<<<< HEAD
  TextInput,
  TouchableOpacity,
  StyleSheet,
=======
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  PermissionsAndroid,
  Keyboard,
  ActivityIndicator
>>>>>>> master
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
<<<<<<< HEAD
=======
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [adjustedImageUri, setAdjustedImageUri] = useState<string | null>(null);
  const [imageAdjustmentVisible, setImageAdjustmentVisible] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);


>>>>>>> master
  const router = useRouter();
  const { user } = useUserContext();
  const id = user?.uuid;

<<<<<<< HEAD
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
=======
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
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
>>>>>>> master

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
<<<<<<< HEAD
        )}
      </View>
      <TextInput
        placeholder="Write a caption..."
        value={caption}
        onChangeText={setCaption}
        style={styles.captionInput}
        multiline
=======

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
          <View style={{ flex: 1 }}>
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
                    loadingMore ? (
                      <View style={post_styles.loadingContainer}>
                        <Text>Loading more photos...</Text>
                      </View>
                    ) : null
                  }
                />
              )
            )}

          </View>

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
>>>>>>> master
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
