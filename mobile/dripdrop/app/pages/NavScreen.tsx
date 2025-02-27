import React from "react";
import { View, Dimensions, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import Navbar from "@/app/components/Navbar";

interface NavScreenProps {
    children: React.ReactNode;
}

export default function NavScreen ({ children } : NavScreenProps) {
    return (


    <SafeAreaView style={StyleSheet.absoluteFillObject}>
        {children}
        <Navbar />
    </SafeAreaView>


    );
};