import React, { useState } from 'react';
import { View } from 'react-native';
import SignUpScreen from './pages/Signup';
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import Navbar from '@/components/navigation/Navbar';
import Home from '@/components/screens/Home';
import Bookmarks from '@/components/screens/Bookmarks';
import Profile from '@/components/screens/Profile';
import Search from '@/components/screens/Search';
import Post from '@/components/screens/Post';


export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {
        <SignUpScreen/>
      }
    </View>
  );
}