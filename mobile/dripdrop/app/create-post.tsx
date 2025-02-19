// CreatePost.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, TextInput, Snackbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function CreatePost() {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const router = useRouter();

    const pickImage = async () => {
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

    const handleCreatePost = async () => {
        if (!image) {
            alert('Please select an image first!');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSnackbarVisible(true);
            setCaption('');
            setImage(null);
            router.back();
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <Button mode="contained" onPress={pickImage} style={styles.button}>
                {image ? 'Change Image' : 'Upload Image'}
            </Button>

            {image && <Image source={{ uri: image }} style={styles.image} />}

            <TextInput
                label="Caption"
                value={caption}
                onChangeText={setCaption}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={4}
            />

            <Button
                mode="contained"
                onPress={handleCreatePost}
                loading={loading}
                disabled={loading}
                style={styles.primaryButton}
            >
                Create Post
            </Button>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                Post created successfully!
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    button: {
        marginVertical: 10,
        width: '80%',
    },
    primaryButton: {
        marginVertical: 10,
        width: '80%',
        backgroundColor: Colors.light.primary,
    },
    input: {
        marginVertical: 10,
        width: '80%',
    },
    image: {
        width: '80%',
        height: 200,
        borderRadius: 8,
        marginVertical: 10,
    },
});
