import { Text, View, Alert, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { useRouter } from "expo-router"; // Import useRouter for navigation
import { SafeAreaView } from "react-native-safe-area-context";
import { item_details_styles } from "@/styles/post";

const Page = () => {
    const [email, setEmail] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [name, setName] = useState<string>("");
    const [brand, setBrand] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [itemURL, setItemURL] = useState<string>("");
    const [size, setSize] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false); // New state for loading indicator

    const router = useRouter(); // Initialize the router

    useEffect(() => {
        const getUserData = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem("email");
                const storedUsername = await AsyncStorage.getItem("username");

                // Set them to state if they exist
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
    }, []); // Empty array ensures this effect runs only once when the component mounts

    const handleSave = async () => {
        setIsLoading(true); // Set loading to true when the save process starts

        // Prepare the request body
        const itemData = {
            name,
            brand,
            category,
            price: parseFloat(price), // Convert price to a number
            itemURL,
            size,
        };

        try {
            // Send a POST request to the backend
            const response = await fetch("https://api.dripdropco.com/items/1", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(itemData),
            });

            if (!response.ok) {
                throw new Error("Failed to save item details.");
            }

            const result = await response.json();
            console.log("Item saved successfully:", result);

            // Show success message
            Alert.alert("Success", "Item details saved successfully!");

            // Optionally, navigate back or reset the form
            router.back(); // Navigate back to the previous screen
        } catch (error) {
            console.error("Error saving item details:", error);
            Alert.alert("Error", "Failed to save item details. Please try again.");
        } finally {
            setIsLoading(false); // Set loading to false when the save process completes
        }
    };

    return (
        <SafeAreaView style={item_details_styles.container}>
            <ScrollView
                contentContainerStyle={item_details_styles.scrollContainer}
                style={item_details_styles.scrollView} // Apply scrollView style
            >
                <Text style={item_details_styles.header}>Verify Clothing Item Details</Text>

                {/* Input fields for item details */}
                <TextInput
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    style={item_details_styles.input}
                />
                <TextInput
                    placeholder="Brand"
                    value={brand}
                    onChangeText={setBrand}
                    style={item_details_styles.input}
                />
                <TextInput
                    placeholder="Category"
                    value={category}
                    onChangeText={setCategory}
                    style={item_details_styles.input}
                />
                <TextInput
                    placeholder="Price"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    style={item_details_styles.input}
                />
                <TextInput
                    placeholder="Item URL"
                    value={itemURL}
                    onChangeText={setItemURL}
                    style={item_details_styles.input}
                />
                <TextInput
                    placeholder="Size"
                    value={size}
                    onChangeText={setSize}
                    style={item_details_styles.input}
                />

            </ScrollView>
            {/* Buttons above the navbar */}
            <View style={item_details_styles.buttonContainer}>
                <TouchableOpacity onPress={() => router.back()} style={item_details_styles.backButton}>
                    <Text style={item_details_styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={item_details_styles.saveButton} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" /> // Show loading indicator when isLoading is true
                    ) : (
                        <Text style={item_details_styles.buttonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Page;