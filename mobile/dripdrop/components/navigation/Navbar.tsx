import React from "react";
import { View, Dimensions, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface NavbarProps {
    setPageName: React.Dispatch<React.SetStateAction<string>>;
}

interface NavItemProps {
    name: string;
    pageName: string;
    setPageName: React.Dispatch<React.SetStateAction<string>>;
}

function NavItem({name, pageName, setPageName} : NavItemProps) {
    function onPress() {
        setPageName(pageName)
    }

    return (
        <TouchableOpacity onPress={onPress}>
            <Icon name={name} size={45} color="black" />
        </TouchableOpacity>
    )
}

export default function Navbar({setPageName} : NavbarProps) {
  return (
    <View style={styles.navbar}>
        <NavItem name="home-outline" pageName="Home" setPageName={setPageName} />
        <NavItem name="search-outline" pageName="Search" setPageName={setPageName} />
        <NavItem name="create-outline" pageName="Post" setPageName={setPageName} />
        <NavItem name="bookmarks-outline" pageName="Bookmarks" setPageName={setPageName} />
        <NavItem name="person-circle-outline" pageName="Profile" setPageName={setPageName} />
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