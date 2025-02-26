import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput, Snackbar, Card } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { createPost } from '../../__lib/api';
import { Ionicons } from '@expo/vector-icons';
import NavScreen from "./NavScreen";

export default function Post() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    Alert.alert(
      'Select Image',
      'Choose an option to select an image:',
      [
        { text: 'Take a Photo', onPress: () => launchCamera() },
        { text: 'Choose from Library', onPress: () => launchImageLibrary() },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const launchImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleCreatePost = async () => {
    if (!image) {
      alert('Please select an image first!');
      return;
    }

    setLoading(true);

    try {
      const base64Image = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const newPost = {
        userID: 1,
        caption: caption,
        images: [`data:image/jpeg;base64,${base64Image}`],
      };

      const createdPost = await createPost(newPost);
      console.log('Post Created by user ' + newPost.userID + ' created successfully:');

      setSnackbarVisible(true);
      setCaption('');
      setImage(null);
      router.back();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <NavScreen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>

          <Card style={styles.cardContainer}>
            {image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <Button mode="contained" onPress={removeImage} style={[styles.button, styles.removeButton]}>
                  Remove Image
                </Button>
              </View>
            ) : (
              <Button mode="contained" onPress={pickImage} style={[styles.button, styles.uploadButton]}>
                Upload Image
              </Button>
            )}
          </Card>

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
            onPress={handleCreatePost}
            loading={loading}
            disabled={loading || !image}
            style={[styles.button, styles.createButton]}
          >
            {loading ? 'Loading...' : 'Continue'}
          </Button>

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
          >
            Post created successfully!
          </Snackbar>
        </ScrollView>
      </KeyboardAvoidingView>
    </NavScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center', // Ensure center alignment for content
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    zIndex: 10,
  },
  cardContainer: {
    width: '90%',
    padding: 20,
    alignItems: 'center',
    marginVertical: 20, // More spacing for a cleaner look
    borderRadius: 12, // Rounded corners for the card
    elevation: 5, // Shadow effect for the card
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    width: '90%',
    paddingVertical: 10, // More padding to make buttons larger
  },
  uploadButton: {
    backgroundColor: Colors.light.primary,
  },
  removeButton: {
    backgroundColor: 'red',
  },
  input: {
    width: '90%',
    marginBottom: 20,
    borderRadius: 8,
  },
  createButton: {
    backgroundColor: Colors.light.primary,
    color: 'white'
  },
});
