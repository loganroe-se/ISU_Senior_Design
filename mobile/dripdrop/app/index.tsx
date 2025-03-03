import React from 'react';
import { StyleSheet } from 'react-native';
import Login from './pages/Login';
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { ThemeProvider } from "./components/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';



export default function Index() {
  return (
    <ThemeProvider>
      <SafeAreaView style={styles.safeArea}>
        <Login />
      </SafeAreaView>
    </ThemeProvider>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,  // Ensures the safe area takes up all available space
    backgroundColor: 'white', // Adjust the background color to fit your design
  },
});