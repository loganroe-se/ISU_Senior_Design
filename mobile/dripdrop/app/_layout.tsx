// app/_layout.tsx
import { Slot, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { UserProvider } from "@/context/UserContext";
import { DarkTheme } from "@react-navigation/native";
import { useEffect } from "react";
import { PaperProvider, ThemeProvider, DefaultTheme } from "react-native-paper";
import Navbar from "@/components/Navbar";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const hideNavbar = ["/auth/signin", "/auth/signup", "/authenticated/posts"].includes(pathname);

  return (
    <ThemeProvider theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <PaperProvider>
        {/* Wrap everything inthe SafeAreaView */}
        <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === "dark" ? "light" : "dark" }}>
          <Slot />
          {!hideNavbar && <Navbar />}
          <StatusBar />
        </SafeAreaView>
      </PaperProvider >
    </ThemeProvider>
       
  );
}
