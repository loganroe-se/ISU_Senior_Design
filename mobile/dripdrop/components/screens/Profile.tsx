import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Profile({}) {
  return (
    <View style={{...StyleSheet.absoluteFillObject, backgroundColor: '#f5f8fa', flex: 1, margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Text>Profile</Text>
    </View>
  );
};

const styles = StyleSheet.create(
    {
    }
)