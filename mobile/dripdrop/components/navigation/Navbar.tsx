import React from "react";
import { View, Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from "expo-router";

const { width } = Dimensions.get('window');
const router = useRouter();

interface NavItemProps {
    name: string;
    pageName: string;
}

function NavItem({name, pageName} : NavItemProps) {
    function onPress() {
        let route = `/pages/${pageName}`; 

        router.push(route as any);
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
        <NavItem name="bookmarks-outline" pageName="Bookmarks" />
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