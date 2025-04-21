import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { searchUsersByUsername } from "@/api/user";
import { searchPostsByTerm } from "@/api/post";
import { User } from "@/types/user.interface";
import { Post } from "@/types/post";
import { fetchUserByUsername } from "@/api/following";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchType, setSearchType] = useState<"accounts" | "posts">("accounts");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (searchQuery === "") {
      setUsers([]);
      setPosts([]);
    } else {
      const fetchData = async () => {
        setLoading(true);
        if (searchType === "accounts") {
          const fetchedUsers = await searchUsersByUsername(searchQuery);
          setUsers(fetchedUsers ?? []);
        } else {
          const fetchedPosts = await searchPostsByTerm(searchQuery);
          setPosts(Array.isArray(fetchedPosts) ? fetchedPosts : []);
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [searchQuery, searchType]);

  const handleUserPress = async (username: string) => {
    setLoadingProfile(true);
    const user = await fetchUserByUsername(username);
    if (user) {
      router.replace(`/authenticated/profile?id=${user.uuid}`);
    }
    setLoadingProfile(false);
  };

  const handlePostClick = (post: Post) => {
    const index = posts.findIndex((p) => p.postID === post.postID);
    if (index === -1) return;
  
    // Move the selected post and all after it to the top
    const reorderedPosts = [
      ...posts.slice(index), // from the clicked post to the end
      ...posts.slice(0, index), // then the posts before the clicked one
    ];
  
    router.push({
      pathname: "/authenticated/posts/viewposts",
      params: {
        posts: encodeURIComponent(JSON.stringify(reorderedPosts)),
        postID: post.postID.toString(),
        initialIndex: "0", // always start at 0 since selected post is now at front
      },
    });
  };

  const renderUser = (user: User) => (
    <TouchableOpacity key={user.uuid} style={styles.userRow} onPress={() => handleUserPress(user.username)}>
      <Image
        source={{ uri: `https://cdn.dripdropco.com/${user.profilePic}?format=png` }}
        style={styles.avatar}
      />
      <Text style={styles.username}>{user.username}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: Post }) => {
    const imageURL = item.images?.[0]?.imageURL
      ? `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png`
      : "default_image.png";

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => handlePostClick(item)}
      >
        <Image source={{ uri: imageURL }} style={styles.postImage} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, searchType === "accounts" && styles.activeTab]}
          onPress={() => setSearchType("accounts")}
        >
          <Text style={[styles.tabText, searchType === "accounts" && styles.activeTabText]}>Accounts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, searchType === "posts" && styles.activeTab]}
          onPress={() => setSearchType("posts")}
        >
          <Text style={[styles.tabText, searchType === "posts" && styles.activeTabText]}>Posts</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5271ff" />
        </View>
      ) : searchType === "accounts" ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {users.length > 0 ? users.map(renderUser) : <Text style={styles.noResultsText}>No accounts found</Text>}
        </ScrollView>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postID.toString()}
          numColumns={3}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={styles.gridContainer}
          renderItem={renderPost}
          ListEmptyComponent={<Text style={styles.noResultsText}>No posts found</Text>}
        />
      )}

      {loadingProfile && (
        <View style={styles.loadingProfileContainer}>
          <ActivityIndicator size="small" color="#5271ff" />
          <Text style={styles.loadingProfileText}>Loading profile...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  searchBar: {
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#5271ff",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "700",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "500",
  },
  gridContainer: {
    gap: 1,
    paddingBottom: 20,
  },
  postCard: {
    width: "32%",
    aspectRatio: 1,
    marginBottom: 4,
    backgroundColor: "#eee",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  noResultsText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingProfileContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    zIndex: 999,
  },
  loadingProfileText: {
    fontSize: 14,
    color: "#5271ff",
    marginTop: 10,
  },
});
