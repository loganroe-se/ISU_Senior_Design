import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import NavScreen from './NavScreen';

export default function PreviewPost() {
    const router = useRouter();
    const { caption, image } = useLocalSearchParams();  // Get passed params

    const handleSubmitPost = () => {
        // Replace this with the actual logic to submit the post
        alert('Your post has been submitted!');
    };

    const handleGoBack = () => {
        router.back();  // Go back to the previous screen (Post.tsx)
    };

    return (
        <NavScreen>
            <View style={styles.container}>
                <Text style={styles.title}>Preview Your Post</Text>

                {image && <Image source={{ uri: Array.isArray(image) ? image[0] : image }} style={styles.image} />}
                {caption && <Text style={styles.caption}>{caption}</Text>}

                <Button
                    mode="outlined"
                    onPress={handleGoBack}  // Go back to the Post screen
                    style={styles.button}
                >
                    Previous
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSubmitPost}  // Submit the post
                    style={styles.button}
                >
                    Submit Post
                </Button>
            </View>
        </NavScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 10,
        marginBottom: 15,
    },
    caption: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    button: {
        width: '80%',
        marginVertical: 10,
    },
});
