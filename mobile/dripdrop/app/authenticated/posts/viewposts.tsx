// app/authenticated/posts/viewposts.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, FlatList, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Post } from "@/types/post";
import { fetchUserPosts } from "@/api/post";
import { PostCard } from "./_components/PostCard";

const ViewPosts = () => {
  const { postID, tab, userID } = useLocalSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const flatListRef = useRef<FlatList<Post>>(null);

  useEffect(() => {
    if (userID && tab) {
      fetchUserPosts(userID as string, tab as string).then((data) => {
        setPosts(data);

        // Scroll to selected post
        const index = data.findIndex((p) => p.postID.toString() === postID);
        setTimeout(() => {
          if (index >= 0) flatListRef.current?.scrollToIndex({ index, animated: false });
        }, 100);
      });
    }
  }, [userID, tab]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.postID.toString()}
        renderItem={({ item }) => <PostCard post={item} />}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
      />
    </View>
  );
};

export default ViewPosts;
