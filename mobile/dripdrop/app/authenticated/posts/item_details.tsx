// item_details.tsx
import { Text, View, Alert, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { item_details_styles } from "@/styles/post";
import { updateItem } from "@/api/items";
import { Item } from "@/types/Item";

const Page = () => {
    const [email, setEmail] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [item, setItem] = useState<Omit<Item, 'id'>>({
        name: "",
        brand: "",
        category: "",
        price: 0,
        itemURL: "",
        size: "",
    });
    const params = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const markerId = params.markerId as string
    const router = useRouter();

    useEffect(() => {
        const getUserData = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem("email");
                const storedUsername = await AsyncStorage.getItem("username");

                if (storedEmail && storedUsername) {
                    setEmail(storedEmail);
                    setUsername(storedUsername);
                } else {
                    Alert.alert("No user data", "User is not logged in.");
                }
            } catch (error) {
                console.error("Error retrieving data", error);
                Alert.alert("Error", "Failed to load user data.");
            }
        };

        getUserData();
    }, []);

const handleSave = async () => {
    if (!markerId) {
        Alert.alert("Error", "No marker ID found");
        return;
    }

    setIsLoading(true);

    try {
        const numericMarkerId = parseInt(markerId);
        if (isNaN(numericMarkerId)) {
            throw new Error("Invalid marker ID");
        }

        // Create the item data without the id field
        const itemData = {
            name: item.name,
            brand: item.brand,
            category: item.category,
            price: Number(item.price) || 0,
            itemURL: item.itemURL,
            size: item.size,
        };

        const response = await updateItem(numericMarkerId, itemData);
        console.log("API Response:", response); // Log the response

        Alert.alert("Success", "Item approved and saved!");
        await AsyncStorage.setItem("image_marker_approved", "true");
        router.back();
    } catch (error) {
        console.error("Detailed Save Error:", error);
        Alert.alert("Error", error instanceof Error ? error.message : "Failed to save item details");
    } finally {
        setIsLoading(false);
    }
};
    const handleChange = (field: keyof Item, value: string) => {
        setItem(prev => ({
            ...prev,
            [field]: field === 'price' ? value.replace(/[^0-9.]/g, '') : value
        }));
    };

    return (
        <SafeAreaView style={item_details_styles.container}>
            <ScrollView
                contentContainerStyle={item_details_styles.scrollContainer}
                style={item_details_styles.scrollView}
            >
                <Text style={item_details_styles.header}>Verify Clothing Item Details</Text>

                <TextInput
                    placeholder="Name"
                    value={item.name}
                    onChangeText={(text) => handleChange('name', text)}
                    style={item_details_styles.input}
                />
                <TextInput
                    placeholder="Brand"
                    value={item.brand}
                    onChangeText={(text) => handleChange('brand', text)}
                    style={item_details_styles.input}
                />
                <TextInput
                    placeholder="Category"
                    value={item.category}
                    onChangeText={(text) => handleChange('category', text)}
                    style={item_details_styles.input}
                />
                <TextInput
                    placeholder="Price"
                    value={item.price.toString()}
                    onChangeText={(text) => handleChange('price', text)}
                    keyboardType="numeric"
                    style={item_details_styles.input}
                />
                <TextInput
                    placeholder="Item URL"
                    value={item.itemURL}
                    onChangeText={(text) => handleChange('itemURL', text)}
                    style={item_details_styles.input}
                />
                <TextInput
                    placeholder="Size"
                    value={item.size}
                    onChangeText={(text) => handleChange('size', text)}
                    style={item_details_styles.input}
                />
            </ScrollView>
            <View style={item_details_styles.buttonContainer}>
                <TouchableOpacity onPress={() => router.back()} style={item_details_styles.backButton}>
                    <Text style={item_details_styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={item_details_styles.saveButton} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={item_details_styles.buttonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Page;