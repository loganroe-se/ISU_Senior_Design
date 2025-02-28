import React from "react";
import { View, Dimensions, StyleSheet, TouchableOpacity, useColorScheme, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from '../../constants/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface NavItemProps {
    name: string; // Icon name
    pageName: string; // Navigation page
}

function NavItem({ name, pageName }: NavItemProps) {
    const router = useRouter();

    function onPress() {
        router.push(`/pages/${pageName}` as any);
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
                <NavItem name="bookmark-outline" pageName="Bookmarks" />
                <NavItem name="account-circle" pageName="Profile" />
            </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Ensures the background color fills the whole screen
    },
    navbar: {
        width,
        position: "absolute",
        bottom: 0,
        paddingTop: 12,
        flexDirection: "row",
        borderTopWidth: 1.5,
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: Colors.light.background,
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
