import { Modal, Text, TouchableOpacity, PanResponder, Animated, StyleSheet, Linking, View } from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import { Marker } from "@/types/Marker";
import { Post } from "@/types/post";
import { Item } from "@/types/Item";
import { Colors } from "@/constants/Colors";
import { getAIRecommendations } from "@/api/post";
import Icon from "react-native-vector-icons/FontAwesome";

interface DraggableItemModalProps {
    visibleItemModal: { postID: number; clothingItemID: number } | null;
    onClose: () => void;
    onChangeIndex: (newClothingItemID: number) => void;
    markersMap: Record<number, Marker[]>;
    itemDetailsMap: Record<number, Item>;
    onAISuggestions: (suggestedPosts: Post[]) => void;
}

const DraggableItemModal = ({
    visibleItemModal,
    onClose,
    onChangeIndex,
    markersMap,
    itemDetailsMap,
    onAISuggestions,
}: DraggableItemModalProps) => {
    const translate = useRef(new Animated.ValueXY()).current;
    const lastModalRef = useRef<{ postID: number; clothingItemID: number } | null>(null);
    const lastOffset = useRef({ x: 0, y: 0 }).current;
    const [loadingAIRecs, setLoadingAIRecs] = useState<boolean>(false);
    const [aiSuggestions, setAISuggestions] = useState<Post[]>([]);
    const [hasFetched, setHasFetched] = useState<boolean>(false);

    // Reset the position of the modal
    useEffect(() => {
        const isNewItem = visibleItemModal &&
            (!lastModalRef.current ||
                visibleItemModal.postID !== lastModalRef.current.postID);

        if (isNewItem || !visibleItemModal) {
            translate.setValue({ x: 0, y: 0 });
            translate.setOffset({ x: 0, y: 0 });
            lastOffset.x = 0;
            lastOffset.y = 0;
            lastModalRef.current = visibleItemModal;
        }
    }, [visibleItemModal]);

    useEffect(() => {
        if (visibleItemModal?.clothingItemID != null) {
            setHasFetched(false);
            setAISuggestions([]);
        }
    }, [visibleItemModal?.clothingItemID]);
    

    // Set up a pan responder to allow dragging of the modal
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                translate.setOffset(lastOffset);
                translate.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: translate.x, dy: translate.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                translate.flattenOffset();
                lastOffset.x = (translate.x as any).__getValue();
                lastOffset.y = (translate.y as any).__getValue();
            },
        })
    ).current;

    // Checks if a URL is valid by seeing if it has http or https at the start
    const isValidURL = (url: string) =>
        typeof url === "string" && /^(http|https):\/\/[^ "]+$/.test(url);

    const onNavigate = (direction: "left" | "right") => {
        const currentIndex = markersWithDetails.findIndex(
            (marker) => marker.clothingItemID === visibleItemModal?.clothingItemID
        );

        if (currentIndex === -1) return;

        const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

        if (newIndex >= 0 && newIndex < markersWithDetails.length) {
            onChangeIndex(markersWithDetails[newIndex].clothingItemID);
        }
    };

    // Handle fetch
    const handleFetchSuggestions = async () => {
        const result = await getAIRecommendations(clothingItemID);
        setHasFetched(true);
        setAISuggestions(result);
        if (result.length !== 0) {
            onAISuggestions(result);
        }
    };

    if (!visibleItemModal) return null;

    const { postID, clothingItemID } = visibleItemModal;
    const markers = markersMap[postID] || [];
    const markersWithDetails = markers.filter(
        (marker) => itemDetailsMap[marker.clothingItemID]
    );
    const currentIndex = markersWithDetails.findIndex(
        (marker) => marker.clothingItemID === clothingItemID
    );
    const marker = markersWithDetails[currentIndex];
    const item = marker ? itemDetailsMap[marker.clothingItemID] : null;

    return (
        <Modal transparent visible animationType="fade">
            {/* Allow touch outside of modal to close */}
            <TouchableOpacity
                activeOpacity={1}
                onPressOut={onClose}
                style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            >
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[styles.animatedView, { transform: [{ translateX: translate.x }, { translateY: translate.y }] }]}
                >
                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeBtn}
                    >
                        <Text style={{ fontSize: 24 }}>ⓧ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.leftHalfTouchable}
                        onPress={() => onNavigate("left")}
                        activeOpacity={1}
                    />
                    <TouchableOpacity
                        style={styles.rightHalfTouchable}
                        onPress={() => onNavigate("right")}
                        activeOpacity={1}
                    />

                    {/* Navigation Arrows */}
                    {currentIndex > 0 && (
                        <Icon
                            name="chevron-left"
                            size={16}
                            style={styles.leftArrowIcon}
                        />
                    )}

                    {currentIndex < markersWithDetails.length - 1 && (
                        <Icon
                            name="chevron-right"
                            size={16}
                            style={styles.rightArrowIcon}
                        />
                    )}

                    <View style={{ flex: 1, justifyContent: "space-between" }}>
                        <View>
                            {/* Item Details */}
                            {item?.name && (
                                <Text style={styles.itemName}>
                                    {item.name}
                                </Text>
                            )}
                            {item?.brand && (
                                <Text style={styles.itemBrand}>
                                    <Text style={styles.boldText}>Brand: </Text>{item.brand}
                                </Text>
                            )}
                            {item?.category && (
                                <Text style={styles.itemCategory}>
                                    <Text style={styles.boldText}>Category: </Text>{item.category}
                                </Text>
                            )}
                            {item?.price !== 0 && item?.price && (
                                <Text style={styles.itemPrice}>
                                    <Text style={styles.boldText}>Price: </Text>${item.price}
                                </Text>
                            )}
                            {item?.itemURL && isValidURL(item.itemURL) && (
                                <Text style={styles.itemURL}>
                                    <Text style={styles.boldText}>URL: </Text>
                                    <Text 
                                        style={{ textDecorationLine: "underline", color: "#0000EE" }}
                                        onPress={() => Linking.openURL(item.itemURL)}
                                    >
                                        {item.itemURL}
                                    </Text>
                                </Text>
                            )}
                            {item?.size && (
                                <Text style={styles.itemSize}>
                                    <Text style={styles.boldText}>Size: </Text>{item.size}
                                </Text>
                            )}
                        </View>

                        {/* AI Suggestions */}
                        {aiSuggestions.length === 0 && !loadingAIRecs && hasFetched ? (
                            <Text style={{ fontSize: 16, color: "black", alignContent: "center", textAlign: "center" }}>
                                There are no AI suggestions for this item at this time.
                            </Text>
                        ) : (
                            <TouchableOpacity
                                style={styles.suggestionsBtn}
                                onPress={async () => {
                                    // Make the API call to get the recommendations
                                    setLoadingAIRecs(true);
                                    await handleFetchSuggestions();
                                    setLoadingAIRecs(false);
                                }}
                                disabled={loadingAIRecs}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={styles.suggestionsText}>
                                        Generate AI Suggestions{" "}
                                    </Text>
                                    {loadingAIRecs ? (
                                        <View style={{ width: 16, height: 16, justifyContent: 'center', alignItems: 'center' }}>
                                            <ActivityIndicator style={{ marginLeft: 4, transform: [{ scale: 0.6 }] }} size="small" color="#ffffff" />
                                        </View>
                                    ) : (
                                        <Text style={styles.suggestionsText}>→</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    animatedView: {
        position: "absolute",
        top: "30%",
        left: "10%",
        width: "80%",
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: "white",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        minHeight: 150,
    },
    closeBtn: {
        position: "absolute",
        top: -4,
        right: 2,
        zIndex: 1,
        padding: 6,
    },
    leftHalfTouchable: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 60,
        height: "100%",
        zIndex: 0,
    },
    rightHalfTouchable: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 60,
        height: "100%",
        zIndex: 0,
    },
    leftArrowIcon: {
        position: "absolute",
        top: "50%",
        left: 10,
        transform: [{ translateY: 4 }],
        zIndex: 1,
    },
    rightArrowIcon: {
        position: "absolute",
        top: "50%",
        right: 10,
        transform: [{ translateY: 4 }],
        zIndex: 1,
    },
    itemName: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 6,
    },
    boldText: {
        fontWeight: "bold",
    },
    itemBrand: {
        fontSize: 16,
        marginBottom: 4,
    },
    itemCategory: {
        fontSize: 16,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        marginBottom: 4,
    },
    itemURL: {
        fontSize: 16,
        marginBottom: 4,
    },
    itemSize: {
        fontSize: 16,
        marginBottom: 4,
    },
    suggestionsBtn: {
        marginTop: 12,
        marginBottom: 4,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.light.primary,
        borderRadius: 10,
        alignSelf: "center",
    },
    suggestionsText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 4,
    }
});

export default DraggableItemModal;