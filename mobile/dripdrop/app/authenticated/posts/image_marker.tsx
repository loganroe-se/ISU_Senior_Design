import React, { useEffect, useState, useRef } from "react";
import { View, Image, TouchableOpacity, ActivityIndicator, Modal, Alert, Text, PanResponder } from "react-native";
import { Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Marker } from '@/types/Marker'; // Import the Marker type
import { SafeAreaView } from "react-native-safe-area-context";
import { image_marker_styles } from "@/styles/post";
import { Ionicons } from "@expo/vector-icons";
import Toolbar from "@/components/Toolbar"; // Adjust the path as needed

const ImageMarkerScreen = () => {
    const router = useRouter();
    const { caption, image, verifiedMarkerId } = useLocalSearchParams();
    const [markers, setMarkers] = useState<Marker[]>([]); // Store marker data
    const [verifiedMarkers, setVerifiedMarkers] = useState<Set<number>>(new Set()); // Track verified markers
    const [loading, setLoading] = useState(true); // Track loading state
    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false); // State for help modal
    const [mode, setMode] = useState<"cursor" | "add" | "delete" | "move">("cursor"); // Toolbar mode
    const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null); // Selected marker for moving or deleting
    const [newMarkerPosition, setNewMarkerPosition] = useState<{ x: number; y: number } | null>(null); // New marker position
    const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false); // State for delete confirmation dialog

    // PanResponder for moving markers
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => mode === "move",
            onPanResponderMove: (event, gestureState) => {
                if (mode === "move" && selectedMarker) {
                    const { moveX, moveY } = gestureState;
                    const updatedMarkers = markers.map((m) =>
                        m.clothingItemID === selectedMarker.clothingItemID
                            ? { ...m, xCoord: moveX, yCoord: moveY }
                            : m
                    );
                    setMarkers(updatedMarkers);
                }
            },
            onPanResponderRelease: () => {
                setSelectedMarker(null); // Deselect marker after moving
            },
        })
    ).current;

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

    // Handle adding a new marker
    const handleAddMarker = (event: any) => {
        if (mode !== "add") return;

        const { locationX, locationY } = event.nativeEvent;
        setNewMarkerPosition({ x: locationX, y: locationY });
    };

    // Confirm adding a new marker
    const confirmAddMarker = () => {
        if (newMarkerPosition) {
            const newMarker: Marker = {
                clothingItemID: markers.length + 1,
                xCoord: newMarkerPosition.x,
                yCoord: newMarkerPosition.y,
            };
            setMarkers((prev) => [...prev, newMarker]);
            setNewMarkerPosition(null);
        }
    };

    // Cancel adding a new marker
    const cancelAddMarker = () => {
        setNewMarkerPosition(null);
    };

    // Handle deleting a marker
    const handleDeleteMarker = (markerId: number) => {
        setMarkers((prev) => prev.filter((marker) => marker.clothingItemID !== markerId));
        setVerifiedMarkers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(markerId);
            return newSet;
        });
        setSelectedMarker(null);
        setIsDeleteConfirmationVisible(false);
    };

    // Handle marker press (for verification)
    const handleMarkerPress = (marker: Marker) => {
        if (mode === "cursor" && !verifiedMarkers.has(marker.clothingItemID)) {
            router.push({
                pathname: "./item_details",
                params: { markerId: marker.clothingItemID },
            });
        } else if (mode === "delete") {
            setSelectedMarker(marker);
            setIsDeleteConfirmationVisible(true);
        } else if (mode === "move") {
            setSelectedMarker(marker);
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

            {/* Toolbar */}
            <Toolbar mode={mode} setMode={setMode} />

            {image && (
                <View
                    style={image_marker_styles.imageContainer}
                    onStartShouldSetResponder={() => true}
                    onResponderRelease={handleAddMarker} // Add marker on tap
                >
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
                                    backgroundColor: verifiedMarkers.has(marker.clothingItemID) ? "green" : "grey",
                                    borderWidth: selectedMarker?.clothingItemID === marker.clothingItemID ? 2 : 0,
                                    borderColor: Colors.light.primary,
                                },
                            ]}
                            {...panResponder.panHandlers}
                        >
                            {mode === "delete" && selectedMarker?.clothingItemID === marker.clothingItemID && (
                                <Ionicons name="trash" size={16} color="red" style={image_marker_styles.deleteIcon} />
                            )}
                        </TouchableOpacity>
                    ))}
                    {newMarkerPosition && (
                        <View
                            style={[
                                image_marker_styles.marker,
                                {
                                    left: newMarkerPosition.x,
                                    top: newMarkerPosition.y,
                                    backgroundColor: "#fff",
                                    flexDirection: "row", // Align buttons horizontally
                                    justifyContent: "space-between", // Space between buttons
                                    alignItems: "center",
                                    opacity:1,
                                },
                            ]}
                        >
                            <TouchableOpacity onPress={confirmAddMarker} style={{ backgroundColor: "#fff", borderRadius: 15 }}>
                                <Ionicons name="checkmark" size={30} color="green" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={cancelAddMarker} style={{ backgroundColor: "#fff", borderRadius: 15 }}>
                                <Ionicons name="close" size={30} color="red" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {caption && <Text style={image_marker_styles.caption}>{caption}</Text>}

            {/* Delete Confirmation Dialog */}
            {isDeleteConfirmationVisible && (
                <View style={image_marker_styles.confirmationDialog}>
                    <Text style={image_marker_styles.confirmationText}>Are you sure you want to delete this marker?</Text>
                    <View style={image_marker_styles.confirmationButtons}>
                        <Button
                            mode="contained"
                            onPress={() => handleDeleteMarker(selectedMarker!.clothingItemID)}
                            style={image_marker_styles.confirmButton}
                        >
                            Delete
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => setIsDeleteConfirmationVisible(false)}
                            style={image_marker_styles.cancelButton}
                        >
                            Cancel
                        </Button>
                    </View>
                </View>
            )}

            {/* Post Button */}
            <Button
                mode="contained"
                onPress={handlePost}
                style={[
                    image_marker_styles.postButton,
                    allMarkersVerified
                        ? { backgroundColor: Colors.light.primary }
                        : { backgroundColor: "#ccc" },
                ]}
                labelStyle={{
                    color: allMarkersVerified ? "#fff" : '#1c1b1f60',
                }}
                disabled={!allMarkersVerified}
            >
                Post
            </Button>
        </SafeAreaView>
    );
};

export default ImageMarkerScreen;