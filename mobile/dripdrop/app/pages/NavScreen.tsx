import React from "react";
import { StyleSheet } from "react-native";
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