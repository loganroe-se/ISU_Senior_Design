// item_details.tsx
import { Text, View, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { item_details_styles } from "@/styles/post";
import { updateItem, getItem } from "@/api/items";
import { getPostById } from "@/api/post"; 
import { Item } from "@/types/Item";
import { Post } from "@/types/post";
import { TextInput, Button } from 'react-native-paper';
import { Colors } from "@/constants/Colors";

const Page = () => {
    const params = useLocalSearchParams();
    const postId = params.postId as string;
    const xCoord = params.xCoord as string | undefined;
    const yCoord = params.yCoord as string | undefined;

    const [email, setEmail] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingItem, setIsLoadingItem] = useState<boolean>(true);
    const [item, setItem] = useState<Omit<Item, 'id'>>({
        name: "",
        brand: "",
        category: "",
        price: 0,
        itemURL: "",
        size: "",
    });
    const [post, setPost] = useState<Post | null>(null); // Add state for post data

    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            console.log("PARAMS: " + params)
            try {
                // Load user data
                const storedEmail = await AsyncStorage.getItem("email");
                const storedUsername = await AsyncStorage.getItem("username");

                if (storedEmail && storedUsername) {
                    setEmail(storedEmail);
                    setUsername(storedUsername);
                } else {
                    Alert.alert("No user data", "User is not logged in.");
                }

                // Load post data
                if (postId) {
                    console.log("POSTID: " + postId);
                    const numericPostId = parseInt(postId);
                    if (!isNaN(numericPostId)) {
                        const postData = await getPostById(numericPostId);
                        console.log("POSTDATA Caption: " + postData.caption);
                        setPost(postData);

                        const imageId = postData.images?.[0]?.imageID;
                
                        if (imageId) {
                                const existingItem = await getItem(imageId);
                                if (existingItem) {
                                    setItem({
                                        name: existingItem.name,
                                        brand: existingItem.brand,
                                        category: existingItem.category,
                                        price: existingItem.price || 0,
                                        itemURL: existingItem.itemURL,
                                        size: existingItem.size,
                                    });
                                }
                            
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoadingItem(false);
            }
        };

        loadData();
    }, [postId, xCoord, yCoord]);

    const handleSave = async () => {
        console.log("POST:  "+ post)
        console.log("POSTIDDDD:  " + postId)
        if (!postId || !post) {
            Alert.alert("Error", "No post ID found or post not loaded");
            return;
        }

        setIsLoading(true);

        try {
            const numericPostId = parseInt(postId);
            if (isNaN(numericPostId)) {
                throw new Error("Invalid post ID");
            }

            // Use the first image's ID from the post
            const imageId = post.images[0]?.imageID;
            if (!imageId) {
                throw new Error("No image ID found in post");
            }

            // Check if item exists
            const existingItem = await getItem(imageId);
            const itemExists = existingItem?.id !== undefined;
            console.log('Item exists:', itemExists);

            // Prepare payload
            const itemData = {
                name: item.name,
                brand: item.brand,
                category: item.category,
                price: Number(item.price) || 0,
                itemURL: item.itemURL,
                size: item.size,
                ...(!itemExists && {
                    image_id: imageId.toString(),
                    xCoord: xCoord,
                    yCoord: yCoord
                })
            };

            // Save to API
            const endpoint = itemExists
                ? `https://api.dripdropco.com/items/${imageId}`
                : 'https://api.dripdropco.com/items';

            const method = itemExists ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${method} item`);
            }

            const savedItem = await response.json();
            console.log('Saved item:', savedItem);

            // Cache the item data locally
            await AsyncStorage.setItem(
                `item_${imageId}`,
                JSON.stringify(savedItem)
            );

            Alert.alert("Success", itemExists ? "Item updated!" : "Item created!");
            router.back();

        } catch (error) {
            console.error('Save failed:', error);
            Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to save item"
            );
        } finally {
            setIsLoading(false);
        }
    };

// ... rest of the component remains the same ...

    const handleChange = (field: keyof Item, value: string) => {
        setItem(prev => ({
            ...prev,
            [field]: field === 'price' ? value.replace(/[^0-9.]/g, '') : value
        }));
    };

    if (isLoadingItem) {
        return (
            <SafeAreaView style={item_details_styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading item data...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={item_details_styles.container}>
            <ScrollView
                contentContainerStyle={item_details_styles.scrollContainer}
                style={item_details_styles.scrollView}
            >
                <Text style={item_details_styles.header}>Verify Clothing Item Details</Text>

                {/* Name Input */}
                <TextInput
                    label="Item Name"
                    mode="outlined"
                    value={item.name}
                    onChangeText={(text) => handleChange('name', text)}
                    style={item_details_styles.input}
                    placeholder="e.g. Nike Air Max"
                    textColor="#000000" 
                    activeUnderlineColor={Colors.light.primary}
                    activeOutlineColor={Colors.light.primary}
                />

                {/* Brand Input */}
                <TextInput
                    label="Brand"
                    mode="outlined"
                    value={item.brand}
                    onChangeText={(text) => handleChange('brand', text)}
                    style={item_details_styles.input}
                    placeholder="e.g. Nike, Adidas"
                    textColor="#000000" 
                    activeUnderlineColor={Colors.light.primary}
                    activeOutlineColor={Colors.light.primary}
                />

                {/* Category Input */}
                <TextInput
                    label="Category"
                    mode="outlined"
                    value={item.category}
                    onChangeText={(text) => handleChange('category', text)}
                    style={item_details_styles.input}
                    placeholder="e.g. Shoes, T-Shirt"
                    textColor="#000000" 
                    activeUnderlineColor={Colors.light.primary}
                    activeOutlineColor={Colors.light.primary}
                />

                {/* Price Input */}
                <TextInput
                    label="Price"
                    mode="outlined"
                    value={item.price.toString()}
                    onChangeText={(text) => handleChange('price', text)}
                    keyboardType="numeric"
                    style={item_details_styles.input}
                    placeholder="e.g. 99.99"
                    left={<TextInput.Affix text="$" />}
                    textColor="#000000" 
                    activeUnderlineColor={Colors.light.primary}
                    activeOutlineColor={Colors.light.primary}
                />

                {/* URL Input */}
                <TextInput
                    label="Item URL"
                    mode="outlined"
                    value={item.itemURL}
                    onChangeText={(text) => handleChange('itemURL', text)}
                    style={item_details_styles.input}
                    placeholder="https://example.com/item"
                    textColor="#000000" 
                    activeUnderlineColor={Colors.light.primary}
                    activeOutlineColor={Colors.light.primary}
                />

                {/* Size Input */}
                <TextInput
                    label="Size"
                    mode="outlined"
                    value={item.size}
                    onChangeText={(text) => handleChange('size', text)}
                    style={item_details_styles.input}
                    placeholder="e.g. M, 10, 28x32"
                    textColor="#000000" 
                    activeUnderlineColor={Colors.light.primary}
                    activeOutlineColor={Colors.light.primary}
                />
            </ScrollView>

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