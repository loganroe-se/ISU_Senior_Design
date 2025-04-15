import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, ActivityIndicator, Modal, Alert, Text } from "react-native";
import { Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Marker } from '@/types/Marker';
import { SafeAreaView } from "react-native-safe-area-context";
import { image_marker_styles } from "@/styles/post";
import { Ionicons } from "@expo/vector-icons";
import Toolbar from "@/components/Toolbar";
import { fetchMarkers, deleteMarker } from "@/api/items";
import { getPostById, publishPost } from "@/api/post";


const ImageMarkerScreen = () => {
    const router = useRouter();
    const { caption, image, postId, refresh, markerId } = useLocalSearchParams();
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [verifiedMarkers, setVerifiedMarkers] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
    const [mode, setMode] = useState<"cursor" | "add" | "delete">("cursor");
    const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
    const [newMarkerPosition, setNewMarkerPosition] = useState<{ x: number; y: number } | null>(null);
    const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageLayout, setImageLayout] = useState<{ width: number; height: number }>({ width: 0, height: 0 });



    // Set image from params
    useEffect(() => {
        if (image) {
            setImageUri(image.toString());
        }
    }, [image]);
    useEffect(() => {
        console.log("Updated markers:", markers);
    }, [markers]);


    const loadMarkers = React.useCallback(async () => {
        try {
            setLoading(true);

            if (!postId || isNaN(Number(postId))) {
                throw new Error("Invalid post ID");
            }

            const numericPostId = Number(postId);
            const postData = await getPostById(numericPostId);

            if (!postData?.images?.[0]?.imageID) {
                throw new Error("Post data is incomplete");
            }

            const data = await fetchMarkers(postData.postID);
            console.log("Fetched marker data:", data);
            if (Array.isArray(data)) {
                
                setMarkers(data);

                // Automatically mark all valid clothingItemIDs as verified
                const verifiedSet = new Set<number>(
                    data.filter(m => m.clothingItemID > 0).map(m => m.clothingItemID)
                );
                setVerifiedMarkers(verifiedSet);
            } else {
                console.warn("Unexpected marker data format");
                setMarkers([]);
            }

        } catch (error) {
            console.error("Error fetching markers:", error);
            setMarkers([]);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        loadMarkers();
    }, [loadMarkers, refresh]);

    const confirmAddMarker = () => {
        if (newMarkerPosition) {
            const newMarker: Marker = {
                clothingItemID: -Date.now(),
                xCoord: newMarkerPosition.x,
                yCoord: newMarkerPosition.y,
            };
            console.log("Adding new marker at:", newMarkerPosition);
            setMarkers((prev) => [...prev, newMarker]);
            setNewMarkerPosition(null);
        }
    };


    const handleAddMarker = (event: any) => {
        if (mode !== "add" || !imageLayout.width || !imageLayout.height) return;

        const { locationX, locationY } = event.nativeEvent;

        // Save relative position (0 to 1)
        const relativeX = locationX / imageLayout.width;
        const relativeY = locationY / imageLayout.height;

        setNewMarkerPosition({ x: relativeX, y: relativeY });
    };


    // Cancel adding a new marker
    const cancelAddMarker = () => {
        setSelectedMarker(null);
        setNewMarkerPosition(null);
    };

    // Handle deleting a marker
const handleDeleteMarker = async (markerId: number) => {
    if (!Number.isInteger(markerId) || markerId <= 0) {
        setMarkers((prev) => prev.filter((marker) => marker.clothingItemID !== markerId));
        setVerifiedMarkers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(markerId);
            return newSet;
        });
        setSelectedMarker(null);
        setIsDeleteConfirmationVisible(false);
        return;
    }

    try {
        setIsDeleting(true);
        console.log("Attempting to delete marker with ID:", markerId);
        await deleteMarker(markerId);
        setMarkers((prev) => prev.filter((marker) => marker.clothingItemID !== markerId));
        setVerifiedMarkers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(markerId);
            return newSet;
        });
        setSelectedMarker(null);
        setIsDeleteConfirmationVisible(false);
    } catch (error) {
        console.error("Error deleting marker:", error);
        Alert.alert("Error", "Failed to delete the marker. Please try again.");
    } finally {
        setIsDeleting(false);
    }
};



    // Handle marker press (for verification)
    const handleMarkerPress = (marker: Marker) => {
        if (mode === "cursor") { 
            router.push({
                pathname: "./item_details",
                params: {
                    markerId: marker.clothingItemID.toString(),
                    xCoord: marker.xCoord.toString(),
                    yCoord: marker.yCoord.toString(),
                    postId: postId,
                    image: image.toString(),
                },
            });
        

        } else if (mode === "delete") {
            setSelectedMarker(marker);
            setIsDeleteConfirmationVisible(true);
        }
    };

    // Check if all markers are verified
    const allMarkersVerified = markers.length > 0 && verifiedMarkers.size === markers.length;

    // Handle Post button press
    const handlePost = async () => {
        try {
            if (!postId || isNaN(Number(postId))) {
                throw new Error("Invalid post ID");
            }

            // Call the API to publish the post
            await publishPost(Number(postId));

            // Show success alert
            Alert.alert("Success", "Your post has been published!");
            router.navigate('/'); // Uncomment this to navigate after post submission

        } catch (error) {
            console.error("Error publishing post:", error);
            Alert.alert("Error", "Failed to publish the post. Please try again.");
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
                        source={{ uri: image.toString()  }}
                        style={image_marker_styles.image}
                        onLayout={(event) => {
                            const { width, height } = event.nativeEvent.layout;
                            setImageLayout({ width, height });
                        }}
                    />
                    {markers.map((marker, index) => {
                        const left = marker.xCoord * imageLayout.width;
                        const top = marker.yCoord * imageLayout.height;

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleMarkerPress(marker)}
                                style={[
                                    image_marker_styles.marker,
                                    {
                                        left,
                                        top,
                                        backgroundColor: verifiedMarkers.has(marker.clothingItemID) ? "green" : "yellow",
                                        borderWidth: selectedMarker?.clothingItemID === marker.clothingItemID ? 2 : 0,
                                        borderColor: mode === "delete" ? "red" : Colors.light.primary,
                                    },
                                ]}
                            />
                        );
                    })}

                    {newMarkerPosition && (
                        <View
                            style={[
                                image_marker_styles.marker,
                                {
                                    left: newMarkerPosition.x * imageLayout.width - 10, // Offset to center
                                    top: newMarkerPosition.y * imageLayout.height - 10,
                                    backgroundColor: "#fff",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    opacity: 1,
                                    position: 'absolute', // Make sure this is set
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
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={isDeleteConfirmationVisible}
                    onRequestClose={() => setIsDeleteConfirmationVisible(false)}
                >
                    <View style={image_marker_styles.overlay}>
                        <View style={image_marker_styles.confirmationDialog}>
                            {isDeleting ? (
                                <ActivityIndicator size="large" color={Colors.light.primary} />
                            ) : (
                                <>
                                    <Text style={image_marker_styles.confirmationTitle}>Delete Marker</Text>
                                    <Text style={image_marker_styles.confirmationText}>
                                        Are you sure you want to delete this marker?
                                    </Text>
                                    <View style={image_marker_styles.confirmationButtons}>
                                        <Button
                                            mode="contained"
                                            buttonColor="#FF4C4C"
                                            textColor="white"
                                            style={image_marker_styles.button}
                                            onPress={() => handleDeleteMarker(selectedMarker!.clothingItemID)}
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            mode="outlined"
                                            textColor={Colors.light.primary}
                                            style={image_marker_styles.button}
                                            onPress={() => setIsDeleteConfirmationVisible(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>
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