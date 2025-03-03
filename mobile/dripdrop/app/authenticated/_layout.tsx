// app/(authenticated)/_layout.tsx
import { Stack } from "expo-router";

export default function AuthenticatedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" options={{title: "Home"}} />
      <Stack.Screen name="profile" />
      <Stack.Screen name="search" />
      <Stack.Screen name="posts" options={{ title: "All Posts" }} />
      <Stack.Screen name="posts/preview" options={{ title: "Preview Post" }} />
      <Stack.Screen name="posts/processing" options={{ title: "Processing Post" }} />
    </Stack>
  );
}
