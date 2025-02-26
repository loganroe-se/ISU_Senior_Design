import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import NavScreen from './NavScreen';

export default function ProcessingScreen() {
    const router = useRouter();
    const { caption, image } = useLocalSearchParams();

    return (
        <NavScreen>
            <View style={styles.container}>
                <Text style={styles.title}>We are Currently Processing Your Post</Text>

                {image && <Image source={{ uri: Array.isArray(image) ? image[0] : image }} style={styles.image} />}
                {caption && <Text style={styles.caption}>{caption}</Text>}

                <Button
                    mode="contained"
                    onPress={() => alert('AI is still processing, please wait.')}
                    style={styles.button}
                >
                    Wait for AI to Finish Processing
                </Button>
                <Button
                    mode="outlined"
                    onPress={() => { router.back(); router.back() }}
                    style={styles.button}
                >
                    Exit and Come Back Later
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
        width: 250,
        height: 250,
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
