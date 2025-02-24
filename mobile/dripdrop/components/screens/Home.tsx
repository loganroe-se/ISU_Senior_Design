import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Navbar from "../navigation/Navbar";

export default function Home({}) {
  return (
    <View style={{...StyleSheet.absoluteFillObject, backgroundColor: '#f5f8fa', flex: 1, margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Text>Home</Text>
    </View>
  );
};

const styles = StyleSheet.create(
    {
    }
)