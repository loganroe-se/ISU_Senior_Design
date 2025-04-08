// components/ImageAdjustmentModal.tsx
import React from "react";
import { Modal, View, Image } from "react-native";
import { Button } from "react-native-paper";
import { post_styles } from "@/styles/post";

type ImageAdjustmentModalProps = {
    visible: boolean;
    imageUri: string | null;
    onSave: () => void;
    onCancel: () => void;
};

const ImageAdjustmentModal: React.FC<ImageAdjustmentModalProps> = ({
    visible,
    imageUri,
    onSave,
    onCancel,
}) => {
    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <View style={post_styles.modalContainer}>
                <View style={post_styles.frame}>
                    <Image
                        source={{ uri: imageUri || "" }}
                        style={post_styles.adjustableImage}
                        resizeMode="contain"
                    />
                </View>
                <Button
                    mode="contained"
                    onPress={onSave}
                    style={[post_styles.modal_button, post_styles.saveButton]}
                >
                    Save
                </Button>
                <Button
                    mode="outlined"
                    onPress={onCancel}
                    style={[post_styles.modal_button, post_styles.cancelButton]}
                    textColor="red"
                >
                    Cancel
                </Button>
            </View>
        </Modal>
    );
};

export default ImageAdjustmentModal;
