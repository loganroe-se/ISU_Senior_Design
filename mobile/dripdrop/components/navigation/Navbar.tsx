import React from "react";
import { View, Dimensions, Text, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export default function Navbar({}) {
  return (
    <View style={styles.navbar}>
        <Icon name="home-outline" size={45} color="black" />
        <Icon name="search-outline" size={45} color="black" />
        <Icon name="create-outline" size={45} color="black" />
        <Icon name="bookmarks-outline" size={45} color="black" />
        <Icon name="person-circle-outline" size={45} color="black" />
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