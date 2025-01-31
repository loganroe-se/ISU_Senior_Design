import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Login({}) {
  return (
    <View style={{...StyleSheet.absoluteFillObject, backgroundColor: '#0073FF', flex: 1, margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'white', fontFamily: 'Inter', fontSize: 64, fontWeight: 'bold'}}>dripdrop</Text>
    </View>
  );
};

const styles = StyleSheet.create(
    {
    }
)
