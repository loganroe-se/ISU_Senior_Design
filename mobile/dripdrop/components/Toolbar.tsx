import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type ToolbarProps = {
    mode: "cursor" | "add" | "delete" | "move";
    setMode: (mode: "cursor" | "add" | "delete" | "move") => void;
};

const Toolbar = ({ mode, setMode }: ToolbarProps) => {
    return (
        <View style={styles.toolbar}>
            {/* Cursor Mode Button */}
            <TouchableOpacity
                style={[styles.toolbarButton, mode === "cursor" && styles.activeButton]}
                onPress={() => setMode("cursor")}
            >
                <Ionicons name="create" size={24} color={mode === "cursor" ? Colors.light.primary : "#000"} />
            </TouchableOpacity>

            {/* Add Mode Button */}
            <TouchableOpacity
                style={[styles.toolbarButton, mode === "add" && styles.activeButton]}
                onPress={() => setMode("add")}
            >
                <Ionicons name="add" size={24} color={mode === "add" ? Colors.light.primary : "#000"} />
            </TouchableOpacity>

            {/* Delete Mode Button */}
            <TouchableOpacity
                style={[styles.toolbarButton, mode === "delete" && styles.activeButton]}
                onPress={() => setMode("delete")}
            >
                <Ionicons name="trash" size={24} color={mode === "delete" ? Colors.light.primary : "#000"} />
            </TouchableOpacity>

            {/* Move Mode Button */}
            <TouchableOpacity
                style={[styles.toolbarButton, mode === "move" && styles.activeButton]}
                onPress={() => setMode("move")}
            >
                <Ionicons name="move" size={24} color={mode === "move" ? Colors.light.primary : "#000"} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    toolbar: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: 8,
        backgroundColor: "#f2f2f2",
        borderRadius: 8,
        marginBottom: 16,
    },
    toolbarButton: {
        padding: 8,
    },
    activeButton: {
        backgroundColor: "#e0e0e0",
        borderRadius: 8,
    },
});

export default Toolbar;