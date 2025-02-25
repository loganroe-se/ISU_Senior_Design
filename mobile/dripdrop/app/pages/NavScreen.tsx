import React from "react";
import { View, Dimensions, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from "expo-router";
import Navbar from "@/components/navigation/Navbar";
import { SafeAreaView } from 'react-native';

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