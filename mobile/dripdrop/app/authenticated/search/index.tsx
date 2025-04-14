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
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { searchUsersByUsername } from "@/api/user";
import { searchPostsByTerm } from "@/api/post";
import { User } from "@/types/user.interface";
import { Post } from "@/types/post";
import { fetchUserByUsername } from "@/api/following";

const windowWidth = Dimensions.get("window").width;

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchType, setSearchType] = useState<"accounts" | "posts">("accounts");
  const [loading, setLoading] = useState(false); // Loading state for search results
  const [loadingProfile, setLoadingProfile] = useState(false); // Loading state for profile navigation

  useEffect(() => {
    if (searchQuery === "") {
      setUsers([]);
      setPosts([]);
    } else {
      const fetchData = async () => {
        setLoading(true); // Start loading
        if (searchType === "accounts") {
          const fetchedUsers = await searchUsersByUsername(searchQuery);
          setUsers(fetchedUsers ?? []);
        } else {
          const fetchedPosts = await searchPostsByTerm(searchQuery);
          setPosts(Array.isArray(fetchedPosts) ? fetchedPosts : []);
        }
        setLoading(false); // End loading
      };
      fetchData();
    }
  }, [searchQuery, searchType]);

  const handleUserPress = async (username: string) => {
    setLoadingProfile(true); // Start profile loading
    const user = await fetchUserByUsername(username);
    if (user != null) {
      router.replace(`/authenticated/profile?id=${user.uuid}`);
    }
    setLoadingProfile(false); // End profile loading
  };

  const handlePostClick = (post: Post) => {
    const index = posts.findIndex((p) => p.postID === post.postID);

    if (index === -1) return;

    router.push({
      pathname: "/authenticated/search/search_feed",
      params: {
        posts: encodeURIComponent(JSON.stringify(posts)),
        initialIndex: index.toString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search for a username or post"
        placeholderTextColor="#D3D3D3"
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
      />

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, searchType === "accounts" && styles.activeToggle]}
          onPress={() => setSearchType("accounts")}
        >
          <Text style={styles.toggleText}>Accounts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, searchType === "posts" && styles.activeToggle]}
          onPress={() => setSearchType("posts")}
        >
          <Text style={styles.toggleText}>Posts</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5271ff" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searchType === "accounts" ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {users.length > 0 ? (
            users.map((item) => (
              <TouchableOpacity key={item.uuid} onPress={() => handleUserPress(item.username)}>
                <Text style={styles.userItem}>{item.username}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResultsText}>No accounts found</Text>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.gridContainer}>
          {posts.length > 0 ? (
            posts.map((post) => {
              const imageURL =
                post.images?.[0]?.imageURL
                  ? `https://cdn.dripdropco.com/${post.images[0].imageURL}?format=png`
                  : "default_image.png";

              return (
                <TouchableOpacity
                  key={post.postID.toString()}
                  style={styles.postCard}
                  onPress={() => handlePostClick(post)}
                >
                  <Image source={{ uri: imageURL }} style={styles.postImage} />
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noResultsText}>No posts found</Text>
          )}
        </ScrollView>
      )}

      {loadingProfile && (
        <View style={styles.loadingProfileContainer}>
          <ActivityIndicator size="small" color="#5271ff" />
          <Text style={styles.loadingProfileText}>Navigating to profile...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  searchBar: {
    height: 40,
    width: 300,
    borderColor: "grey",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
    alignSelf: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    margin: 5,
    backgroundColor: "#ccc",
    borderRadius: 5,
  },
  activeToggle: {
    backgroundColor: "#5271ff",
  },
  toggleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  userItem: {
    fontSize: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  postCard: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    resizeMode: "cover",
  },
  noResultsText: {
    textAlign: "center",
    color: "grey",
    marginTop: 20,
    alignSelf: "center",
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#5271ff",
    marginBottom: 200,
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
