import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Image,
    Text,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export default function Caption({ route }: any) {
    const { imageUri } = route.params; // Get the image URI passed from the previous page
    const [caption, setCaption] = useState("");
    const router = useRouter();

    // Function to go to the previous screen
    const handleGoBack = () => {
        router.back();
    };

    // Function to proceed to the next screen
    const handleNext = () => {
        // Navigate to the next screen
        router.push({
            pathname: "/authenticated/posts/PreviewPost" as any,
            params: {
                caption,
                image: imageUri,
            },
        });
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <TouchableOpacity
                    onPress={handleGoBack}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>

                {/* Display the selected image as preview */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.image} />
                </View>

                {/* Caption input field */}
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

                {/* Continue button */}
                <Button
                    mode="contained"
                    onPress={handleNext}
                    disabled={!caption.trim()}
                    style={[
                        styles.button,
                        {
                            backgroundColor:
                                !caption.trim() ? "gray" : Colors.light.primary, // Disabled state color
                        },
                    ]}
                >
                    Continue
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    backButton: {
        position: "absolute",
        top: "10%",
        left: 16,
        zIndex: 10,
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 15,
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 10,
        marginBottom: 15,
    },
    input: {
        width: "90%",
        marginBottom: 20,
        backgroundColor: "white",
        borderRadius: 8,
    },
    button: {
        borderRadius: 8,
        width: "90%",
        marginBottom: 20,
    },
});
