import React, { useState, useEffect } from "react";
import { Text, View, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button } from "react-native-paper";
import { item_details_styles } from "@/styles/post";
import { updateItem, getItem, createItem } from "@/api/items";
import { getPostById } from "@/api/post";
import { Item } from "@/types/Item";
import { Post } from "@/types/post";
import { Colors } from "@/constants/Colors";

type ItemFormData = Omit<Item, "id">;

const Page = () => {
    const params = useLocalSearchParams();
    const router = useRouter();

    const postId = params.postId as string;
    const xCoord = params.xCoord as string | undefined;
    const yCoord = params.yCoord as string | undefined;
    const markerId = params.markerId as string | undefined;
    const imageUri = params.image as string | undefined;

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingItem, setIsLoadingItem] = useState(true);
    const [post, setPost] = useState<Post | null>(null);
    const [item, setItem] = useState<ItemFormData>({
        clothingItemID: 0,
        name: "",
        brand: "",
        category: "",
        price: 0,
        itemURL: "",
        size: "",
    });

    // Load initial data
    useEffect(() => {
        // item_details.tsx
        const loadData = async () => {
            try {
                console.log("Starting to load data...");
                if (markerId) {
                    console.log(`Marker ID: ${markerId}`);
                    const numericPostId = parseInt(postId);
                    console.log(`Parsed Post ID: ${numericPostId}`);
                    if (isNaN(numericPostId)) {
                        console.error("Invalid post ID");
                        return;
                    }

                    const postData = await getPostById(numericPostId);
                    console.log("Post data:", postData);
                    setPost(postData);

                    console.log("Marker ID in loadData:", Number(markerId));
                    if (Number(markerId) < 0) {
                        setIsLoadingItem(false);
                        return; // Skip loading for temporary markers
                    }

                    const existingItem = await getItem(parseInt(markerId));
                    console.log("Existing item:", existingItem);

                    if (!existingItem) {
                        console.log("No item found, keeping default form values");
                        setIsLoadingItem(false);
                        return;
                    }

                    setItem({
                        clothingItemID: existingItem.clothingItemID,
                        name: existingItem.name,
                        brand: existingItem.brand,
                        category: existingItem.category,
                        price: existingItem.price || 0,
                        itemURL: existingItem.itemURL,
                        size: existingItem.size,
                    });
                }
            } catch (error) {
                console.error("Error loading data:", error);
                Alert.alert("Error", "Failed to load item data");
            } finally {
                setIsLoadingItem(false);
            }
        };

        loadData();
    }, [postId, markerId]);

    const handleChange = (field: keyof ItemFormData, value: string | number) => {
        console.log(`Changing ${field} to ${value}`);
        setItem((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        console.log("Handling save...");
        if (!postId || !post) {
            Alert.alert("Error", "No post ID found or post not loaded");
            console.error("No post found");
            return;
        }

        setIsLoading(true);

        try {
            const numericPostId = parseInt(postId);
            if (isNaN(numericPostId)) throw new Error("Invalid post ID");

            const imageId = post.images[0]?.imageID;
            if (!imageId) throw new Error("No image ID found in post");
            if (!markerId) throw new Error("No marker ID provided");

            const numericMarkerId = parseInt(markerId);
            const itemExists = numericMarkerId > 0;

            const baseItemData = {
                ...item,
                price: Number(item.price) || 0,
                image_id: imageId.toString(),
            };

            if (itemExists) {
                console.log("Updating existing item");
                const updateData = {
                    ...baseItemData,
                    clothingItemID: numericMarkerId,
                };
                console.log("Updating item with ID:", numericMarkerId, "Data:", updateData);
                await updateItem(numericMarkerId, updateData);
                console.log("Item updated successfully");
                Alert.alert("Success", "Item updated!");
                // Use the existing marker ID we already have
                handleSubmit(numericMarkerId.toString());
            } else {
                console.log("Creating new item");
                if (!xCoord || !yCoord) throw new Error("Coordinates are required for new items");

                const createData = {
                    ...baseItemData,
                    xCoord: Number(xCoord),
                    yCoord: Number(yCoord),
                };
                const data = await createItem(createData);
                console.log("Item created:", data);
                Alert.alert("Success", "Item created!");
                handleSubmit(data.itemId.toString());
            }
        } catch (error) {
            console.error("Save failed:", error);
            Alert.alert("Error", error instanceof Error ? error.message : "Failed to save item");
        } finally {
            setIsLoading(false);
        }
    };


    const handleSubmit = (newClothingItemID: string) => {
        console.log("Submitting item with ID:", newClothingItemID);
        if (!markerId) return;

        router.replace({
            pathname: "./image_marker",
            params: {
                verifiedMarkerId: newClothingItemID,
                image: imageUri,
                refresh: 'true',
                postId: postId
            },
        });
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
