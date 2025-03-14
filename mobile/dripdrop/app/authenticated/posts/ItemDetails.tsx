import React, { useState } from "react";
import { View, TextInput, StyleSheet, Button, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const ItemDetails = () => {
    const router = useRouter();
    const { markerId } = useLocalSearchParams();
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [itemUrl, setItemUrl] = useState("");
    const [size, setSize] = useState("");

    const handleSave = () => {
        // Save the details (e.g., send to an API)
        console.log("Saving item details:", {
            markerId,
            name,
            brand,
            category,
            price,
            itemUrl,
            size,
        });

        // Mark the marker as verified
        router.push({
            pathname: "./image_marker",
            params: { verifiedMarkerId: markerId }, // Pass the verified marker ID back
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Item Details</Text>
            <Text style={styles.subtitle}>Marker ID: {markerId}</Text>

            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Brand"
                value={brand}
                onChangeText={setBrand}
            />
            <TextInput
                style={styles.input}
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
            />
            <TextInput
                style={styles.input}
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Item URL"
                value={itemUrl}
                onChangeText={setItemUrl}
            />
            <TextInput
                style={styles.input}
                placeholder="Size"
                value={size}
                onChangeText={setSize}
            />

            <Button title="Save" onPress={handleSave} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
        color: "#666",
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 16,
    },
});

export default ItemDetails;