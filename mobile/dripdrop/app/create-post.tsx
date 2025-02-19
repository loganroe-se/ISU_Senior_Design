import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Button, TextInput, Snackbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // Import expo-file-system
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { createPost } from './api';
import { Ionicons } from '@expo/vector-icons';

export default function CreatePost() {
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
            mediaTypes: ['images'], // Use an array of strings
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
            mediaTypes: ['images'], // Use an array of strings
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
            // Convert the image URI to a base64 string
            const base64Image = await FileSystem.readAsStringAsync(image, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const newPost = {
                userID: 1, // Replace with the logged-in user's ID
                caption: caption,
                images: [`data:image/jpeg;base64,${base64Image}`], // Send as base64
            };

            console.log('Creating post with payload:', JSON.stringify(newPost)); // Debugging log

            const createdPost = await createPost(newPost); // Call the createPost API
            console.log('Post created successfully:', createdPost);

            setSnackbarVisible(true);
            setCaption('');
            setImage(null);
            router.back(); // Navigate back after creating the post
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
            <View style={styles.imageContainer}>
                {image ? (
                    <>
                        <Image source={{ uri: image }} style={styles.image} />
                        <Button mode="contained" onPress={removeImage} style={styles.removeButton}>
                            Remove Image
                        </Button>
                    </>
                ) : (
                    <Button mode="contained" onPress={pickImage} style={styles.uploadButton}>
                        Upload Image
                    </Button>
                )}
            </View>

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
                style={styles.createButton}
            >
                {loading ? 'Creating Post...' : 'Create Post'}
            </Button>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                Post created successfully!
            </Snackbar>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 16,
        zIndex: 10,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 10,
    },
    uploadButton: {
        backgroundColor: Colors.light.primary,
        marginVertical: 10,
    },
    removeButton: {
        marginTop: 10,
        backgroundColor: 'red',
    },
    input: {
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    createButton: {
        backgroundColor: Colors.light.primary,
        marginVertical: 10,
    },
});