// components/ImageAdjustmentModal.tsx
import React, { useRef } from "react";
import { Modal, View, Image as RNImage, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";
import { post_styles } from "@/styles/post";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import ViewShot from "react-native-view-shot";
import { Ionicons } from "@expo/vector-icons";

type ImageAdjustmentModalProps = {
    visible: boolean;
    imageUri: string | null;
    onSave: (uri: string) => void;
    onCancel: () => void;
};

const AnimatedImage = Animated.createAnimatedComponent(RNImage);

const ImageAdjustmentModal: React.FC<ImageAdjustmentModalProps> = ({
    visible,
    imageUri,
    onSave,
    onCancel,
}) => {
    const viewShotRef = useRef<ViewShot>(null);
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // Check if image has been transformed from original position
    const isTransformed = () => {
        return (
            scale.value !== 1 ||
            translateX.value !== 0 ||
            translateY.value !== 0
        );
    };

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            if (scale.value < 1) {
                scale.value = withSpring(1);
                savedScale.value = 1;
            }
        });

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = savedTranslateX.value + e.translationX;
            translateY.value = savedTranslateY.value + e.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedImageStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }));

    const resetImageTransform = () => {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
    };

    const handleSave = async () => {
        if (viewShotRef.current?.capture) {
            try {
                const uri = await viewShotRef.current.capture();
                onSave(uri);
            } catch (error) {
                console.error("Error capturing image:", error);
                onSave(imageUri || "");
            }
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={post_styles.modalContainer}>
                    <View style={post_styles.frame}>
                        <ViewShot
                            ref={viewShotRef}
                            style={{ flex: 1 }}
                            options={{ format: "jpg", quality: 0.9 }}
                        >
                            <GestureDetector gesture={composedGesture}>
                                <Animated.Image
                                    source={{ uri: imageUri || "" }}
                                    style={[post_styles.adjustableImage, animatedImageStyle]}
                                    resizeMode="contain"
                                />
                            </GestureDetector>
                        </ViewShot>
                        {isTransformed() && (
                            <TouchableOpacity
                                onPress={resetImageTransform}
                                style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: 20,
                                    padding: 8,
                                }}
                            >
                                <Ionicons name="refresh" size={24} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={post_styles.buttonGroup}>
                        <Button
                            mode="contained"
                            onPress={handleSave}
                            style={[post_styles.modal_button, post_styles.saveButton]}
                        >
                            Save
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => {
                                resetImageTransform();
                                onCancel();
                            }}
                            style={[post_styles.modal_button, post_styles.cancelButton]}
                            textColor="red"
                        >
                            Cancel
                        </Button>
                    </View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
};

export default ImageAdjustmentModal;