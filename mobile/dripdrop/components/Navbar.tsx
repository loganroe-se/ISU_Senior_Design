import React from "react";
import { View, Dimensions, StyleSheet, TouchableOpacity, useColorScheme, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

type ValidPageName = "Home" | "Search" | "Post" | "Profile"; 

interface NavItemProps {
    name: string;
    pageName: ValidPageName;
}

function NavItem({ name, pageName }: NavItemProps) {
    const router = useRouter();

    function onPress() {
        router.push(`/pages/${pageName}` as any);  // Navigate to the respective page
    }

    return (
        <TouchableOpacity onPress={onPress} style={styles.navItem}>
            <MaterialCommunityIcons name={name} size={42} style={styles.icon} />
        </TouchableOpacity>
    );
}

export default function Navbar() {
    return (
        <SafeAreaView style={[styles.navbar, { borderTopColor: "#ddd" }]}>
            <NavItem name="home" pageName="Home" />
            <NavItem name="magnify" pageName="Search" />
            <NavItem name="plus-circle" pageName="Post" />
            <NavItem name="account-circle" pageName="Profile" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    navbar: {
        width,
        position: "absolute",
        bottom: 0,
        paddingTop: 12,
        flexDirection: "row",
        borderTopWidth: 1.5,
        justifyContent: "space-around",
        alignItems: "center",
    },
    navItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 10, // Larger touch area
    },
    icon: {
        color: "#000", // Default, will be overridden by dark mode styles
    }
});
