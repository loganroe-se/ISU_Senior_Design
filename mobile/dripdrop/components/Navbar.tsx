// src/components/Navbar.tsx
import React from "react";
import {
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";


function NavItem({ name, pageName }: NavItemProps) {
  const navigation = useNavigation();
  const route = useRoute();
  const isActive = route.name === pageName;

  function onPress() {
    navigation.navigate(pageName as never);
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.navItem}>
      <MaterialCommunityIcons
        name={name}
        size={32}
        style={[styles.icon, isActive && styles.activeIcon]}
      />
    </TouchableOpacity>
  );
}

function Navbar() {
  return (
    <SafeAreaView style={styles.navbarContainer}>
      <View style={styles.navbar}>
        <NavItem name="home-outline" pageName="Home" />
        <NavItem name="magnify" pageName="Search" />
        <NavItem name="plus-circle-outline" pageName="Post" />
        <NavItem name="bookmark-outline" pageName="Bookmarks" />
        <NavItem name="account-circle-outline" pageName="Profile" />
      </View>
    </SafeAreaView>
  );
}

export default Navbar;