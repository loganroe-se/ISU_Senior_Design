// app/(authenticated)/_layout.tsx
import { Stack } from "expo-router";

export default function AuthenticatedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" options={{title: "Home"}} />
      <Stack.Screen name="profile/index" options={{ title: "Profile" }} />
      <Stack.Screen name="search/index" options={{ title: "Search" }} />
      <Stack.Screen name="posts/index" options={{ title: "All Posts" }} />
      <Stack.Screen name="posts/processing_post" options={{ title: "Processing Post" }} />
      <Stack.Screen name="posts/image_marker" options={{ title: "Image Marker" }} />
      <Stack.Screen name="posts/item_details" options={{ title: "Item Details" }} />
      <Stack.Screen name="settings/index" options={{ presentation: "card", animation: "slide_from_right" }} />
    </Stack>
  );
}
