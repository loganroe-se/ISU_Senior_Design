import React, { useState } from 'react';
import { View } from 'react-native';
import SignUpScreen from './pages/Signup';
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";


export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <SignUpScreen/>
    </View>
  );
}