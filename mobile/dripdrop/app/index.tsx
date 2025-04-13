// app/index.tsx
import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useUserContext } from "@/context/UserContext";

export default function Index() {
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000); // Simulate async loading (e.g., fetching auth state)
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" testID="loading-indicator" />
      </View>
    );
  }

  // Redirect users after checking authentication
  if (!user) {
    return <Redirect href="/auth/signin" />;
  }

  return <Redirect href="/authenticated" />;
}
