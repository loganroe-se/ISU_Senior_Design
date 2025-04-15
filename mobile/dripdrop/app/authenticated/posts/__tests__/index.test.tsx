import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import Post from "../index";
import { useUserContext } from "@/context/UserContext";
import { createPost } from "@/api/post";
import * as ImagePicker from "expo-image-picker";

// Mocks
jest.mock("@/context/UserContext", () => ({
    useUserContext: jest.fn(),
}));

jest.mock("@/api/post", () => ({
    createPost: jest.fn().mockResolvedValue({ postID: "123" }),
}));

jest.mock("expo-media-library", () => ({
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
    getAssetsAsync: jest.fn().mockResolvedValue({
        assets: [
            { id: "1", uri: "test-uri", filename: "test.jpg" }
        ]
    }),
    getAssetInfoAsync: jest.fn().mockResolvedValue({
        localUri: "test-uri"
    }),
    MediaType: {
        photo: "photo",
    },
}));

jest.mock("expo-camera", () => ({
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
    Camera: {
        requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
    },
}));

jest.mock("expo-image-picker", () => ({
    launchCameraAsync: jest.fn().mockResolvedValue({
        canceled: false,
        assets: [{ uri: "camera-image-uri" }],
    }),
    MediaTypeOptions: {
        Images: "Images",
    },
}));

jest.mock("expo-file-system", () => ({
    readAsStringAsync: jest.fn().mockResolvedValue("base64EncodedImage"),
    EncodingType: {
        Base64: "base64",
    },
}));

jest.mock("expo-image-manipulator", () => ({
    manipulateAsync: jest.fn().mockResolvedValue({ uri: "manipulated-uri" }),
    SaveFormat: {
        JPEG: "jpeg",
    },
}));

jest.mock("expo-router", () => ({
    useRouter: () => ({
        replace: jest.fn(),
        push: jest.fn(),
    }),
}));

jest.mock("@expo/vector-icons", () => ({
    Ionicons: "Ionicons",
}));

jest.mock("@/components/ImageAdjustmentModal", () => "ImageAdjustmentModal");

describe("Post Screen", () => {
    beforeEach(() => {
        (useUserContext as jest.Mock).mockReturnValue({
            user: { uuid: "user-123" },
        });

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("allows caption input and calls createPost on continue", async () => {
        jest.useFakeTimers();

        const { getByPlaceholderText, getByText } = render(<Post />);

        // Set caption
        await act(async () => {
            fireEvent.changeText(getByPlaceholderText("Write a caption..."), "Test caption");
        });

        // Take photo
        await act(async () => {
            fireEvent.press(getByText("Take Photo"));
            jest.runAllTimers();
        });

        // Continue
        await act(async () => {
            fireEvent.press(getByText("Continue"));
            jest.runAllTimers();
        });

        // Verify API call
        await waitFor(() => {
            expect(createPost).toHaveBeenCalledWith(
                expect.objectContaining({
                    uuid: "user-123",
                    caption: "Test caption",
                    images: ["base64EncodedImage"],
                })
            );
        });
    });
});