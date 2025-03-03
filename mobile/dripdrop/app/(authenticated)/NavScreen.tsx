import React from "react";
import { View, StyleSheet } from "react-native";
import Navbar from "@/components/Navbar";

interface NavScreenProps {
    children: React.ReactNode;
}

export default function NavScreen ({ children } : NavScreenProps) {
    return (


    <View style={StyleSheet.absoluteFillObject}>
        {children}
        <Navbar />
    </View>


    );
};