import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import Entypo from '@expo/vector-icons/Entypo';


type ToolbarProps = {
    mode: "cursor" | "add" | "delete";
    setMode: (mode: "cursor" | "add" | "delete" ) => void;
};

const Toolbar = ({ mode, setMode }: ToolbarProps) => {
    return (
        <View style={styles.toolbar}>
            {/* Cursor Mode Button */}
            <TouchableOpacity
                style={[styles.toolbarButton, mode === "cursor" && styles.activeButton]}
                onPress={() => setMode("cursor")}
            >
                <Entypo name="mouse-pointer" size={24} color={mode === "cursor" ? Colors.light.primary : "#000"} />
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

        </View>
    );
};

const styles = StyleSheet.create({
    toolbar: {
        width: '100%',
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