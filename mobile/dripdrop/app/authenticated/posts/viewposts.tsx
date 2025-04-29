// app/authenticated/posts/viewposts.tsx

import React, { useEffect, useRef, useState } from "react";
import { View, FlatList, Text, ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Post } from "@/types/post";
import { fetchUserPosts } from "@/api/post";
import { PostCard } from "./_components/PostCard";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const { height } = Dimensions.get("window");

const ViewPosts = () => {
  const { postID, tab, userID, posts, initialIndex, header } = useLocalSearchParams();
  const title = header || "dripdrop";
  const [postList, setPostList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<Post>>(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (posts) {
          const parsedPosts = JSON.parse(decodeURIComponent(posts as string));
          setPostList(parsedPosts);
        } else if (userID && tab) {
          const fetchedPosts = await fetchUserPosts(userID as string, tab as string);
          setPostList(fetchedPosts);
        } else {
          setError("Missing required parameters.");
        }
      } catch (err) {
        console.error("Failed to initialize posts:", err);
        setError("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [posts, userID, tab]);

  useEffect(() => {
    if (!loading && postList.length) {
      let index = -1;
      
      // Check postID first, if available
      if (postID) {
        index = postList.findIndex((p) => p.postID.toString() === postID);
      } else if (initialIndex) {
        // Fallback to initialIndex if no postID
        index = parseInt(initialIndex as string, 10);
      }
  
      // Proceed if index is found and it's within bounds
      if (index >= 0 && index < postList.length) {
        setTimeout(() => {
          // Check if the content is rendered before attempting to scroll
          flatListRef.current?.scrollToIndex({ index, animated: false });
        }, 100);
      }
    }
  }, [loading, postList, postID, initialIndex]);
  

  const onScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const { index } = info;
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index, animated: false });
    }, 500);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#5271ff" />
        <Text style={{ marginTop: 10 }}>Loading posts...</Text>
      </View>
    );
  }

  if (error || !postList.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", textAlign: "center" }}>
          {error || "No posts found."}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header Row */}
      <View style={{ borderBottomWidth: 1, borderColor: "black", backgroundColor: Colors.light.background }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ justifyContent: "center", alignItems: "center", paddingRight: 20 }}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.light.primary} />
          </TouchableOpacity>
          <Text
            style={{ 
              color: Colors.light.primary, 
              fontSize: 20, 
              fontWeight: "bold", 
              fontStyle: (title === "dripdrop") ? "italic" : "normal" 
            }}
          >
            {title}
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={postList.reverse()}
        keyExtractor={(item) => item.postID.toString()}
        renderItem={({ item }) => <PostCard post={item} />}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: height * 0.82,
          offset: height * 0.82 * index,
          index,
        })}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />
    </View>
  );
};

export default ViewPosts;
