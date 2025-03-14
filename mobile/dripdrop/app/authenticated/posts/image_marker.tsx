import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors"; // Import your app's color constants
import { Marker } from '@/types/Marker'; // Import the Marker type
import { SafeAreaView } from "react-native-safe-area-context";

const ImageMarkerScreen = () => {
    const router = useRouter();
    const { caption, image, verifiedMarkerId } = useLocalSearchParams();
    const [markers, setMarkers] = useState<Marker[]>([]); // Store marker data
    const [verifiedMarkers, setVerifiedMarkers] = useState<Set<number>>(new Set()); // Track verified markers
    const [loading, setLoading] = useState(true); // Track loading state

    console.log("Caption:", caption);
    console.log("Image URI:", image);

    // Fetch the coordinates from the API
    useEffect(() => {
        const fetchMarkers = async () => {
            try {
                const response = await fetch("https://api.dripdropco.com/items/post/1");
                const data: Marker[] = await response.json(); // Explicitly type the response data
                setMarkers(data);
            } catch (error) {
                console.error("Error fetching markers:", error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchMarkers();
    }, []);

    useEffect(() => {
        if (verifiedMarkerId) {
            const id = Number(verifiedMarkerId);
            setVerifiedMarkers((prev) => new Set(prev).add(id));
        }
    }, [verifiedMarkerId]);

    // Handle marker press
    const handleMarkerPress = (marker: Marker) => {
        if (!verifiedMarkers.has(marker.clothingItemID)) {
            // Navigate to the ItemDetails screen for unverified markers
            router.push({
                pathname: "./item_details", // Updated path
                params: { markerId: marker.clothingItemID },
            });
        }
    };

    // Show loading indicator while fetching data
    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Preview Your Post</Text>

            {image && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: Array.isArray(image) ? image[0] : image }}
                        style={styles.image}
                    />
                    {markers.map((marker, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleMarkerPress(marker)}
                            style={[
                                styles.marker,
                                {
                                    left: marker.xCoord,
                                    top: marker.yCoord,
                                    backgroundColor: verifiedMarkers.has(marker.clothingItemID) ? "green" : "grey", // Color based on verification state
                                },
                            ]}
                        />
                    ))}
                </View>
            )}

            {caption && <Text style={styles.caption}>{caption}</Text>}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.light.primary,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        color: Colors.light.primary,
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        aspectRatio: 1,
        marginBottom: 16,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 8,
    },
    marker: {
        position: "absolute",
        width: 20, // Larger marker
        height: 20, // Larger marker
        borderRadius: 10, // Circular marker
        backgroundColor: "grey", // Default color for unverified markers
        opacity: 0.7, // Semi-transparent
    },
    caption: {
        fontSize: 16,
        textAlign: "center",
        color: Colors.light.text,
    },
});

export default ImageMarkerScreen;