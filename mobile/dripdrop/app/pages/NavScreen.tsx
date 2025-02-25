import React from "react";
import { View, Dimensions, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import Navbar from "@/app/components/Navbar";

interface NavScreenProps {
    children: React.ReactNode;
}

export default function NavScreen ({ children } : NavScreenProps) {
    return (
        <View style={{...StyleSheet.absoluteFillObject, backgroundColor: '#f5f8fa', flex: 1, margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {children}
            <Navbar />
        </View>
    );
};