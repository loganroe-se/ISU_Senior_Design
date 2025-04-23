import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { PostGrid } from "../profile/_components/PostGrid";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function ViewPostSuggestions() {
  const { suggestions, userID } = useLocalSearchParams();
  const router = useRouter();

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (suggestions) {
      try {
        const parsed = JSON.parse(decodeURIComponent(suggestions as string))
        setPosts(parsed);
      } catch (e) {
        console.error("Error parsing suggestions:", e);
      }
    }
  }, [suggestions]);
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
        {/* Header Row*/}
        <View style={{ borderBottomWidth: 1, borderColor: "black", backgroundColor: Colors.light.background, marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 12 }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ justifyContent: "center", alignItems: "center", paddingRight: 20 }}
                >
                    <Ionicons name="arrow-back" size={20} color={Colors.light.primary} />
                </TouchableOpacity>
                <Text
                    style={{ color: Colors.light.primary, fontSize: 20, fontWeight: "bold" }}
                >
                    AI Suggestions
                </Text>
            </View>
        </View>

        {posts.length > 0 ? (
            <PostGrid
                posts={posts}
                onPressPost={(post) => {
                    router.push({
                        pathname: "./viewposts",
                        params: {
                            postID: post.postID.toString(),
                            posts: encodeURIComponent(JSON.stringify(posts)),
                            userID,
                            header: "AI Suggestions",
                        },
                    });
                }}
            />
        ) : (
            <View style={{ padding: 16 }}>
                <Text>No suggestions found.</Text>
            </View>
        )}
    </SafeAreaView>
  );
}