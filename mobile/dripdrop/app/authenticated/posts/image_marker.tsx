import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, ActivityIndicator, Modal, Alert } from "react-native";
import { Text, Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Marker } from '@/types/Marker'; // Import the Marker type
import { SafeAreaView } from "react-native-safe-area-context";
import { image_marker_styles } from "@/styles/post";
import { Ionicons } from "@expo/vector-icons";

const ImageMarkerScreen = () => {
    const router = useRouter();
    const { caption, image, verifiedMarkerId } = useLocalSearchParams();
    const [markers, setMarkers] = useState<Marker[]>([]); // Store marker data
    const [verifiedMarkers, setVerifiedMarkers] = useState<Set<number>>(new Set()); // Track verified markers
    const [loading, setLoading] = useState(true); // Track loading state
    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false); // State for help modal

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

    // Check if all markers are verified
    const allMarkersVerified = markers.length > 0 && verifiedMarkers.size === markers.length;

    // Handle Post button press
    const handlePost = () => {
        Alert.alert("Success", "Your post has been submitted!");
        // Add logic to submit the post
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
            {/* Help Button */}
            <TouchableOpacity
                style={image_marker_styles.helpButton}
                onPress={() => setIsHelpModalVisible(true)}
            >
                <Ionicons name="help-circle-outline" size={30} color={Colors.light.primary} />
            </TouchableOpacity>

            {/* Help Modal */}
            <Modal
                visible={isHelpModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsHelpModalVisible(false)}
            >
                <View style={image_marker_styles.modalContainer}>
                    <View style={image_marker_styles.modalContent}>
                        <Text style={image_marker_styles.modalText}>
                            Please click on the image markers to validate the clothing item's information.
                        </Text>
                        <Button
                            mode="contained"
                            onPress={() => setIsHelpModalVisible(false)}
                            style={image_marker_styles.modalButton}
                        >
                            Close
                        </Button>
                    </View>
                </View>
            </Modal>

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

            {/* Post Button */}
            <Button
                mode="contained"
                onPress={handlePost}
                style={[
                    image_marker_styles.postButton,
                    allMarkersVerified
                        ? { backgroundColor: Colors.light.primary } // Use primary color when all markers are verified
                        : { backgroundColor: "#ccc" }, // Greyed out when not all markers are verified
                ]}
                labelStyle={{
                    color: allMarkersVerified ? "#fff" : '#1c1b1f60', // White text when all markers are verified
                }}
                disabled={!allMarkersVerified} // Disable if not all markers are verified
            >
                Post
            </Button>
        </SafeAreaView>
    );
};

export default ImageMarkerScreen;