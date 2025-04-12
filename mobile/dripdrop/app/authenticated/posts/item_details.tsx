// item_details.tsx
import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    Alert,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView, Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button } from "react-native-paper";

import { item_details_styles } from "@/styles/post";
import { updateItem, getItem, getMarker } from "@/api/items";
import { getPostById } from "@/api/post";
import { Item } from "@/types/Item";
import { Post } from "@/types/post";
import { Colors } from "@/constants/Colors";


type ItemFormData = Omit<Item, "id">;

const API_BASE_URL = "https://api.dripdropco.com/items";

const Page = () => {
    const params = useLocalSearchParams();
    const router = useRouter();

    // Extract and type route params
    const postId = params.postId as string;
    const xCoord = params.xCoord as string | undefined;
    const yCoord = params.yCoord as string | undefined;
    const markerId = params.markerId as string | undefined;

    // State management
    const [email, setEmail] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingItem, setIsLoadingItem] = useState(true);
    const [post, setPost] = useState<Post | null>(null);
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        const loadImageFromAsyncStorage = async () => {
            try {
                const savedImage = await AsyncStorage.getItem('selectedImage');
                if (savedImage) {
                    setImage(savedImage);
                }
            } catch (error) {
                console.error("Failed to load image from AsyncStorage:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadImageFromAsyncStorage();
    }, []);

    const [item, setItem] = useState<ItemFormData>({
        name: "",
        brand: "",
        category: "",
        price: 0,
        itemURL: "",
        size: "",
    });

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load user data
                const [storedEmail, storedUsername] = await Promise.all([
                    AsyncStorage.getItem("email"),
                    AsyncStorage.getItem("username"),
                ]);

                if (storedEmail && storedUsername) {
                    setEmail(storedEmail);
                    setUsername(storedUsername);
                } else {
                    Alert.alert("No user data", "User is not logged in.");
                }

                // Load post and item data if marker exists
                if (markerId) {
                    const numericPostId = parseInt(postId);
                    if (isNaN(numericPostId)) {
                        console.log("Invalid numeric postId:", postId);
                        return;
                    }

                    const postData = await getPostById(numericPostId);
                    setPost(postData);

                    const imageId = postData.images?.[0]?.imageID;
                    if (!imageId) {
                        console.log("No imageId in postData.images[0]");
                        return;
                    }

                    const existingItem = await getItem(parseInt(markerId));
                    if (typeof existingItem !== "string") {
                        setItem({
                            name: existingItem!.name,
                            brand: existingItem!.brand,
                            category: existingItem!.category,
                            price: existingItem!.price || 0,
                            itemURL: existingItem!.itemURL,
                            size: existingItem!.size,
                        });
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoadingItem(false);
            }
        };

        loadData();
    }, [postId, markerId]);

    const handleChange = (field: keyof ItemFormData, value: string) => {
        setItem((prev) => ({
            ...prev,
            [field]: field === "price" ? value.replace(/[^0-9.]/g, "") : value,
        }));
    };

    const saveItem = async (
        itemExists: boolean,
        itemData: any,
        clothingItemID?: number
    ): Promise<{ status: number, data: any }> => {
        const url = itemExists
            ? `${API_BASE_URL}/${clothingItemID}`
            : API_BASE_URL;

        const method = itemExists ? "PUT" : "POST";
        console.log("ITEM EXITS?: ", itemExists)

        console.log("📝 Save Item Triggered");
        console.log("➡️ HTTP Method:", method);
        console.log("📍 URL:", url);
        console.log("📦 Item Data:", JSON.stringify(itemData, null, 2));

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(itemData),
            });

            const responseJson = await response.json();

            return {
                status: response.status,
                data: responseJson,
            };
        } catch (error) {
            console.error("❌ Error making request:", error);
            throw error;
        }
    };




    const handleSave = async () => {
        if (!postId || !post) {
            Alert.alert("Error", "No post ID found or post not loaded");
            return;
        }

        setIsLoading(true);

        try {
            const numericPostId = parseInt(postId);
            if (isNaN(numericPostId)) throw new Error("Invalid post ID");

            const imageId = post.images[0]?.imageID;
            if (!imageId) throw new Error("No image ID found in post");

            if (!markerId) throw new Error("No marker ID provided");

            const existingItem = await getMarker(parseInt(markerId));
            const itemExists = !!existingItem?.clothingItemID;

            const itemData = {
                ...item,
                price: Number(item.price),
                image_id: imageId,
                ...(!itemExists && { xCoord, yCoord }),
            };

            const { status, data } = await saveItem(itemExists, itemData, existingItem?.clothingItemID);

            if (status !== 200) {
                throw new Error(data?.message || "Failed to save item");
            }

            // The backend returns: { itemId: {123}, message: "..." }
            const newItemId = Array.isArray(data.itemId)
                ? data.itemId[0]
                : typeof data.itemId === 'object'
                    ? Object.values(data.itemId)[0]
                    : data.itemId;

            console.log("🆔 New Item ID:", newItemId);

            await AsyncStorage.setItem(`item_${imageId}`, JSON.stringify(itemData));
            Alert.alert("Success", itemExists ? "Item updated!" : "Item created!");
            await handleSubmit(newItemId.toString());

        } catch (error) {
            console.error("Save failed:", error);
            Alert.alert("Error", error instanceof Error ? error.message : "Failed to save item");
        } finally {
            setIsLoading(false);
        }
    };



    const handleSubmit = async (newClothingItemID: string) => {
        try {
            if (!markerId) return;

            const storedMarker = await AsyncStorage.getItem(`marker_${markerId}_coords`);
            console.log("Stored marker: ", storedMarker)
            if (storedMarker) {
                const parsedMarker = JSON.parse(storedMarker);
                parsedMarker.clothingItemID = newClothingItemID;
                await AsyncStorage.setItem(
                    `marker_${newClothingItemID}_coords`,
                    JSON.stringify(parsedMarker)
                );
            }

            router.replace({
                pathname: "./image_marker",
                params: { verifiedMarkerId: newClothingItemID, image, refresh: 'true', postId: postId },
            });
        } catch (error) {
            Alert.alert("Error", "Failed to update item.");
        }
    };

    if (isLoadingItem) {
        return (
            <SafeAreaView style={item_details_styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text>Loading item data...</Text>
            </SafeAreaView>
        );
    }

    const inputProps = {
        mode: "outlined" as const,
        style: item_details_styles.input,
        textColor: "#000000",
        activeUnderlineColor: Colors.light.primary,
        activeOutlineColor: Colors.light.primary,
    };

    return (
        <SafeAreaView style={item_details_styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={item_details_styles.scrollContainer}
                    style={item_details_styles.scrollView}
                >
                    <Text style={item_details_styles.header}>Verify Clothing Item Details</Text>

                    <TextInput
                        {...inputProps}
                        label="Item Name"
                        value={item.name}
                        onChangeText={(text) => handleChange("name", text)}
                        placeholder="e.g. Nike Air Max"
                    />

                    <TextInput
                        {...inputProps}
                        label="Brand"
                        value={item.brand}
                        onChangeText={(text) => handleChange("brand", text)}
                        placeholder="e.g. Nike, Adidas"
                    />

                    <TextInput
                        {...inputProps}
                        label="Category"
                        value={item.category}
                        onChangeText={(text) => handleChange("category", text)}
                        placeholder="e.g. Shoes, T-Shirt"
                    />

                    <TextInput
                        {...inputProps}
                        label="Price"
                        value={item.price.toString()}
                        onChangeText={(text) => handleChange("price", text)}
                        keyboardType="numeric"
                        placeholder="e.g. 99.99"
                        left={<TextInput.Affix text="$" />}
                    />

                    <TextInput
                        {...inputProps}
                        label="Item URL"
                        value={item.itemURL}
                        onChangeText={(text) => handleChange("itemURL", text)}
                        placeholder="https://example.com/item"
                    />

                    <TextInput
                        {...inputProps}
                        label="Size"
                        value={item.size}
                        onChangeText={(text) => handleChange("size", text)}
                        placeholder="e.g. M, 10, 28x32"
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={item_details_styles.buttonContainer}>
                <Button
                    mode="outlined"
                    onPress={() => router.back()}
                    style={item_details_styles.backButton}
                >
                    Back
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={item_details_styles.saveButton}
                    loading={isLoading}
                    disabled={isLoading}
                >
                    Save
                </Button>
            </View>
        </SafeAreaView>
    );
};

export default Page;