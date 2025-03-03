// app/_layout.tsx
import { Slot, usePathname } from "expo-router";
import { View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { UserProvider } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import { DarkTheme } from "@react-navigation/native";
import { useEffect } from "react";
import { ThemeProvider, DefaultTheme } from "react-native-paper";

// Prevent splash screen from hiding until assets load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

function AppContent() {
  const pathname = usePathname();
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Screens where Navbar should be hidden
  const hideNavbar = ["/auth/signin", "/auth/signup"].includes(pathname);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Slot /> {/* Renders the current screen */}
        {!hideNavbar && <Navbar />} {/* Show Navbar unless on SignIn/SignUp */}
      </View>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
