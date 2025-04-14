import { Modal, View, Text, TouchableOpacity, Dimensions, PanResponder, Animated, StyleSheet } from "react-native";
import React, { useRef, useEffect } from "react";
import { Marker } from "@/types/Marker";
import { Item } from "@/types/Item";

interface DraggableItemModalProps {
    visibleItemModal: { postID: number; index: number } | null;
    onClose: () => void;
    onChangeIndex: (newIndex: number) => void;
    markersMap: Record<number, Marker[]>;
    itemDetailsMap: Record<number, Item>;
}

const DraggableItemModal = ({
    visibleItemModal,
    onClose,
    onChangeIndex,
    markersMap,
    itemDetailsMap,
}: DraggableItemModalProps) => {
    const translate = useRef(new Animated.ValueXY()).current;
    const lastModalRef = useRef<{ postID: number; index: number } | null>(null);
    const lastOffset = useRef({ x: 0, y: 0 }).current;

    // Reset the position of the modal
    useEffect(() => {
        const isNewItem = visibleItemModal &&
            (!lastModalRef.current ||
                visibleItemModal.postID !== lastModalRef.current.postID);

        if (isNewItem) {
            translate.setValue({ x: 0, y: 0 });
            translate.setOffset({ x: 0, y: 0 });
            lastOffset.x = 0;
            lastOffset.y = 0;
            lastModalRef.current = visibleItemModal;
        }
    }, [visibleItemModal]);

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

    if (!visibleItemModal) return null;

    const { postID, index } = visibleItemModal;
    const markers = markersMap[postID] || [];
    const marker = markers[index];
    const item = itemDetailsMap[marker.clothingItemID];

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
                        <Text style={{ fontSize: 24 }}>x</Text>
                    </TouchableOpacity>

                    {/* Navigation Arrows */}
                    {index > 0 && (
                        <TouchableOpacity
                            style={styles.leftArrow}
                            onPress={() => onChangeIndex(index - 1)}
                        >
                            <Text style={{ fontSize: 24 }}>◀</Text>
                        </TouchableOpacity>
                    )}

                    {index < markers.length - 1 && (
                        <TouchableOpacity
                            style={styles.rightArrow}
                            onPress={() => onChangeIndex(index + 1)}
                        >
                            <Text style={{ fontSize: 24 }}>▶</Text>
                        </TouchableOpacity>
                    )}

                    {/* Item Details */}
                    {item?.name && (
                        <Text style={styles.itemName}>
                            {item.name}
                        </Text>
                    )}
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    animatedView: {
        position: "absolute",
        top: "30%",
        left: "20%",
        width: "60%",
        padding: 20,
        backgroundColor: "white",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    closeBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
    },
    leftArrow: {
        position: "absolute",
        top: "50%",
        left: -30,
    },
    rightArrow: {
        position: "absolute",
        top: "50%",
        right: -30,
    },
    itemName: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    }
});

export default DraggableItemModal;