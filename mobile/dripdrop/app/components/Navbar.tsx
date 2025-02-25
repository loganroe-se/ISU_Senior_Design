import React from "react";
import { View, Dimensions, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from "expo-router";

const { width } = Dimensions.get('window');

type ValidPageName = "Home" | "Search" | "Post" | "Profile"; 

interface NavItemProps {
    name: string;
    pageName: ValidPageName;
}

function NavItem({name, pageName} : NavItemProps) {
    const router = useRouter();
    function onPress() {
        let route = `/pages/${pageName}`; 

        router.push(route);
    }
    

    return (
        <TouchableOpacity onPress={onPress}>
            <Icon name={name} size={45} color="black" />
        </TouchableOpacity>
    )
}

export default function Navbar({}) {
  return (
    <View style={styles.navbar}>
        <NavItem name="home-outline" pageName="Home" />
        <NavItem name="search-outline" pageName="Search" />
        <NavItem name="create-outline" pageName="Post" />
        <NavItem name="person-circle-outline" pageName="Profile" />
    </View>
  );
};

const styles = StyleSheet.create(
    {
        navbar: {
            display: 'flex',
            width,
            position: 'absolute',
            bottom: 0,
            paddingTop: 16,
            paddingBottom: 40,
            justifyContent: 'space-around',
            flexDirection: 'row',
            borderTopWidth: 2
        }
    }
)