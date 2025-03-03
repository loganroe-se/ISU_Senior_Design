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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Importing icons

// Define types for Post
interface Post {
  postID: number;
  userID: number;
  images: { imageURL: string }[];
  username: string;
  caption: string;
  createdDate: string;
  clothesUrl: string;
  numLikes: number;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]); // Store the fetched users
  const [posts, setPosts] = useState<Post[]>([]); // Store the fetched posts
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]); // Store the filtered users
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]); // Store filtered posts
  const [searchType, setSearchType] = useState<"accounts" | "posts">(
    "accounts"
  ); // State to track search type
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // State for the modal content

  // Fetching posts function
  const fetchAllPosts = async (): Promise<Post[]> => {
    try {
      const response = await fetch("https://api.dripdropco.com/posts");
      const posts = await response.json();

      // Now, we need to map userID to username
      const updatedPosts = await Promise.all(
        posts.map(async (post: Post) => {
          const userResponse = await fetch(
            `https://api.dripdropco.com/users/${post.userID}`
          );
          const userData = await userResponse.json();
          return {
            ...post,
            username: userData.username, // Attach the username to the post object
          };
        })
      );

      return updatedPosts;
    } catch (error) {
      console.error("Error fetching all posts:", error);
      return [];
    }
  };

  // Helper function to filter posts based on search term (username or caption)
  const filterPosts = (posts: Post[], searchTerm: string): Post[] => {
    return posts.filter((post) => {
      const usernameMatch = post.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const captionMatch = post.caption
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return usernameMatch || captionMatch;
    });
  };

  // Fetch users and posts from the API when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://api.dripdropco.com/users");
        const data = await response.json();
        setUsers(data); // Assuming the API returns an array of users
      } catch (error) {
        console.error("Error fetching users:", error);
        Alert.alert("Error", "Failed to fetch users");
      }
    };

    const fetchPosts = async () => {
      try {
        const allPosts = await fetchAllPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchUsers();
    fetchPosts();
  }, []);

  // Update filtered results based on search query and search type
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredUsers([]);
      setFilteredPosts([]);
    } else if (searchType === "accounts") {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      const filtered = filterPosts(posts, searchQuery);
      setFilteredPosts(filtered);
    }
  }, [searchQuery, searchType, users, posts]);

  // Handle user selection (optional)
  const handleUserPress = (username: string) => {
    Alert.alert("User Selected", `You selected ${username}`);
  };

  // Handle post click to open the modal with the selected post details
  const handlePostClick = (post: Post) => {
    console.log("post clicked");
    setSelectedPost(post);
  };

  // Handle closing the modal
  const closeModal = () => {
    setSelectedPost(null);
  };

  // Handle liking a post
  const handleLike = () => {
    if (selectedPost) {
      setSelectedPost({
        ...selectedPost,
        numLikes: selectedPost.numLikes + 1,
      });
    }
  };

  // Handle comments click
  const handleComments = () => {
    // You can handle comments interaction here
    Alert.alert("Comments", "View all comments for this post.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>

      {/* Search bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a username or post"
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search" // Changes the return key to 'Search'
      />

      {/* Toggle search type (Accounts / Posts) */}
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

      {/* Display filtered results based on search type */}
      {searchType === "accounts" ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((item) => (
              <TouchableOpacity
                key={item.id}
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
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              // Extracting the image URL
              const imageURL =
                Array.isArray(post.images) &&
                post.images.length > 0 &&
                post.images[0].imageURL
                  ? `https://cdn.dripdropco.com/${post.images[0].imageURL}?format=png`
                  : "default_image.png";

              return (
                <TouchableOpacity
                  key={post.postID}
                  onPress={() => handlePostClick(post)}
                  style={styles.postCard}
                >
                  <Image source={{ uri: imageURL }} style={styles.postImage} />
                  <Text style={styles.postCaption}>{post.caption}</Text>
                  <Text style={styles.postUsername}>{post.username}</Text>
                  <View style={styles.postActions}>
                    <Icon name="heart" size={20} color="#e74c3c" />
                    <Text style={styles.likeText}>{post.numLikes}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noResultsText}>No posts found</Text>
          )}
        </ScrollView>
      )}

      {/* Modal for the selected post */}
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
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.backButton} onPress={closeModal}>
                <Icon name="arrow-left" size={30} color="black" />
              </TouchableOpacity>
              <Image
                source={{
                  uri: `https://cdn.dripdropco.com/${selectedPost.images[0].imageURL}?format=png`,
                }}
                style={styles.modalImage}
              />
              <View style={styles.modalTextContainer}>
                <Text style={styles.modalUsername}>
                  {selectedPost.username}
                </Text>
                <Text style={styles.modalCaption}>{selectedPost.caption}</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={handleLike}
                    style={styles.likeButton}
                  >
                    <Icon
                      name="heart"
                      size={30}
                      color={selectedPost.numLikes > 0 ? "red" : "grey"}
                    />
                    <Text style={styles.modalLikeText}>
                      {selectedPost.numLikes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleComments}>
                    <Icon name="comment" size={30} color="grey" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
    flexGrow: 1, // Ensures the content takes full height
  },
  userItem: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20, // Add padding at the bottom to avoid cutoff of last post
  },
  postCard: {
    width: "48%",
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  postCaption: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  postUsername: {
    fontSize: 14,
    color: "grey",
    marginTop: 4,
  },
  postActions: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  likeText: {
    fontSize: 16,
    marginLeft: 5,
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
    paddingTop: 50,
    borderRadius: 8,
    width: "80%",
    maxWidth: 500,
    maxHeight: 500,
  },
  modalImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
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
    marginTop: 20,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalLikeText: {
    fontSize: 16,
    marginLeft: 5,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
  },
});
