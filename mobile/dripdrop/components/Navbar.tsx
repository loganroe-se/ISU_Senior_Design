import React from "react";
import { View, Dimensions, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from '@/constants/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from "@react-navigation/native";

const { width } = Dimensions.get('window');

interface NavItemProps {
    name: string;
    pageName: string;
}

function NavItem({ name, pageName }: NavItemProps) {
    const router = useRouter();

    function onPress() {
        router.replace(`/authenticated/${pageName}` as any);  // Navigate to the respective page
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
            <NavItem name="home" pageName="" />
            <NavItem name="magnify" pageName="search" />
            <NavItem name="plus-circle" pageName="posts" />
            <NavItem name="bookmark-multiple" pageName="bookmarks" />
            <NavItem name="account-circle" pageName="profile" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    navbar: {
        width,
        bottom: 0,
        flexDirection: "row",
        borderTopWidth: 1.5,
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor:'white'
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
