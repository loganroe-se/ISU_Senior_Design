import { Slot, Redirect, usePathname } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useUserContext } from "@/context/UserContext";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import Navbar from "@/components/Navbar";
import { ThemeProvider, DefaultTheme, MD3DarkTheme } from "react-native-paper";

// Prevent the splash screen from auto-hiding before assets load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const pathname = usePathname(); // Get current path
  const colorScheme = useColorScheme();
  
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000); // Simulate loading
  }, []);

  if (!fontsLoaded || loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: "center" }} />;
  }

  // If user is not logged in, redirect to SignIn
  if (!user && pathname !== "/auth/signin" && pathname !== "/auth/signup") {
    return <Redirect href="/auth/signin" />;
  }

  // Screens where Navbar should be hidden
  const hideNavbar = ["/auth/signin", "/auth/signup"].includes(pathname);

  return (
    <ThemeProvider value={colorScheme === "dark" ? MD3DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Slot /> {/* This renders the current screen */}
        {!hideNavbar && <Navbar />} {/* Show Navbar unless on SignIn/SignUp */}
      </View>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
