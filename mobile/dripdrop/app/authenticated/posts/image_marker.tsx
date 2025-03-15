import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Marker } from '@/types/Marker'; // Import the Marker type
import { SafeAreaView } from "react-native-safe-area-context";
import { image_marker_styles } from "@/styles/post";

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
                pathname: "./item_details", 
                params: { markerId: marker.clothingItemID },
            });
        }
    };

    // Show loading indicator while fetching data
    if (loading) {
        return (
            <SafeAreaView style={image_marker_styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={image_marker_styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={image_marker_styles.container}>
            <Text style={image_marker_styles.title}>Preview Your Post</Text>

            {image && (
                <View style={image_marker_styles.imageContainer}>
                    <Image
                        source={{ uri: Array.isArray(image) ? image[0] : image }}
                        style={image_marker_styles.image}
                    />
                    {markers.map((marker, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleMarkerPress(marker)}
                            style={[
                                image_marker_styles.marker,
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

            {caption && <Text style={image_marker_styles.caption}>{caption}</Text>}
        </SafeAreaView>
    );
};

export default ImageMarkerScreen;