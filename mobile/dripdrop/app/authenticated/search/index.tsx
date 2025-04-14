import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Dimensions,
} from "react-native";
import { FeedPost } from "@/types/post";
import Icon from "react-native-vector-icons/FontAwesome";
import { Colors } from "@/constants/Colors";
import { searchUsersByUsername } from "@/api/user";
import { User } from "@/types/user.interface";
import { fetchUserByUsername } from "@/api/following";

interface Post {
  postID: number;
  uuid: string;
  images: { imageURL: string }[];
  username: string;
  caption: string;
  createdDate: string;
  clothesUrl: string;
  numLikes: number;
}

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [searchType, setSearchType] = useState<"accounts" | "posts">("accounts");
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [initialIndex, setInitialIndex] = useState<number>(0);

  const fetchUsers = async (searchTerm: string): Promise<User[]> => {
    return await searchUsersByUsername(searchTerm);
  };

  const fetchPosts = async (searchTerm: string): Promise<FeedPost[]> => {
    try {
      const response = await fetch(
        `https://api.dripdropco.com/posts/search/${searchTerm}`
      );
      const data = await response.json();
      const updatedPosts = await Promise.all(
        data.map(async (post: Post) => {
          const userResponse = await fetch(
            `https://api.dripdropco.com/users/${post.uuid}`
          );
          const userData = await userResponse.json();
          return {
            ...post,
            username: userData.username,
          };
        })
      );
      return updatedPosts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  };

  useEffect(() => {
    if (searchQuery === "") {
      setUsers([]);
      setPosts([]);
    } else {
      const fetchData = async () => {
        if (searchType === "accounts") {
          const fetchedUsers = await fetchUsers(searchQuery);
          setUsers(fetchedUsers);
        } else {
          const fetchedPosts = await fetchPosts(searchQuery);
          setPosts(fetchedPosts);
        }
      };
      fetchData();
    }
  }, [searchQuery, searchType]);

  const handleUserPress = (username: string) => {
    const fetchUser = async () => {
      let user = await fetchUserByUsername(username);
      if (user != null) {
        console.log(user);
        router.replace(`/authenticated/profile?id=${user.uuid}` as any);
      }
    };

    fetchUser();
  };

  const handlePostClick = (post: FeedPost) => {
    setSelectedPost(post);
    // Find the index of the clicked post in the posts array
    const index = posts.findIndex((p) => p.postID === post.postID);
    setInitialIndex(index); // Set the initial index to scroll to
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  const handleLike = () => {
    if (selectedPost) {
      setSelectedPost({
        ...selectedPost,
        numLikes: selectedPost.numLikes + 1,
      });
    }
  };

  const handleComments = () => {
    Alert.alert("Comments", "View all comments for this post.");
  };

  const renderPostInModal = ({ item }: { item: FeedPost }) => {
    return (
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.backButton} onPress={closeModal}>
          <Icon name="arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <View style={styles.underArrow}>
          <Text style={styles.modalUsername}>{item.username}</Text>
          <Image
            source={{
              uri: `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png`,
            }}
            style={styles.modalImage}
          />
          <View style={styles.modalTextContainer}>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
                <Icon
                  name={item.userHasLiked ? "heart" : "heart-o"}
                  size={30}
                  color={item.userHasLiked ? "red" : Colors.light.contrast}
                  onPress={() => handleLike()}
                  style={styles.icon}
                />
                <Text style={styles.modalLikeText}>{item.numLikes}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleComments} style={styles.commentIcon}>
                <Icon name="comment-o" size={30} color="black" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalUsername}>{item.username}</Text>
            <Text style={styles.modalCaption}>{item.caption}</Text>
          </View>
        </View>
      </View>
    );
  };

  const onScrollToIndexFailed = (info: {
    index: number;
    averageItemLength: number;
  }) => {
    const { index } = info;
    console.warn(`Error scrolling to index ${index}. Retrying...`);
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }, 500);
  };

  const flatListRef = React.useRef<FlatList>(null);

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
          style={[
            styles.toggleButton,
            searchType === "accounts" && styles.activeToggle,
          ]}
          onPress={() => setSearchType("accounts")}
        >
          <Text style={styles.toggleText}>Accounts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            searchType === "posts" && styles.activeToggle,
          ]}
          onPress={() => setSearchType("posts")}
        >
          <Text style={styles.toggleText}>Posts</Text>
        </TouchableOpacity>
      </View>

      {searchType === "accounts" ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {users.length > 0 ? (
            users.map((item) => (
              <TouchableOpacity
                key={item.uuid} // Ensuring unique key here
                onPress={() => handleUserPress(item.username)}
              >
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
                Array.isArray(post.images) &&
                post.images.length > 0 &&
                post.images[0].imageURL
                  ? `https://cdn.dripdropco.com/${post.images[0].imageURL}?format=png`
                  : "default_image.png";
              return (
                <TouchableOpacity
                  key={post.postID.toString()} // Ensuring unique key here
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

      <Modal
        visible={selectedPost !== null}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalBackdrop}></View>
          </TouchableWithoutFeedback>

          {selectedPost && (
            <FlatList
              ref={flatListRef}
              data={posts}
              renderItem={renderPostInModal}
              keyExtractor={(item) => item.postID.toString()}
              horizontal={false}
              pagingEnabled={true}
              showsVerticalScrollIndicator={false}
              initialScrollIndex={initialIndex}
              onScrollToIndexFailed={onScrollToIndexFailed}
            />
          )}
        </View>
      </Modal>
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
    width: "50%",
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    height: windowHeight,
    width: windowWidth,
    maxWidth: 500,
  },
  modalImage: {
    width: "100%",
    height: 500,
  },
  modalTextContainer: {
    marginTop: 10,
  },
  modalUsername: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalCaption: {
    fontSize: 16,
    marginTop: 10,
    color: "grey",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  modalLikeText: {
    marginLeft: 5,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingTop: 50,
  },
  underArrow:{
    marginTop: 80
  },
  commentIcon: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Vertically center items
    justifyContent: 'flex-start', // Align items to the start (left)
    width: '100%', // Ensure the container spans the full width
    paddingLeft: 20
  }
});
