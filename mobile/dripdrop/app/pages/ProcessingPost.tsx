import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import NavScreen from './NavScreen';

export default function ProcessingScreen() {
    const router = useRouter();

    return (
        <NavScreen>
        <View style={styles.container}>
            <Text style={styles.title}>Processing Your Post...</Text>
            <Button
                mode="contained"
                onPress={() => alert('AI is still processing, please wait.')}
                style={styles.button}
            >
                Wait for AI to Finish Processing
            </Button>
            <Button
                mode="outlined"
                onPress={() => router.back()}
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
    },
    button: {
        width: '80%',
        marginVertical: 10,
    },
});
