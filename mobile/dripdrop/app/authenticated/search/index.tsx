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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchType, setSearchType] = useState<'accounts' | 'posts'>('accounts');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [initialIndex, setInitialIndex] = useState<number>(0);  // Track the initial index for the modal feed


  const fetchAllPosts = async (): Promise<Post[]> => {
    try {
      const response = await fetch('https://api.dripdropco.com/posts');
      const posts = await response.json();
      const updatedPosts = await Promise.all(posts.map(async (post: Post) => {
        const userResponse = await fetch(`https://api.dripdropco.com/users/${post.userID}`);
        const userData = await userResponse.json();
        return {
          ...post,
          username: userData.username,
        };
      }));
      return updatedPosts;
    } catch (error) {
      console.error('Error fetching all posts:', error);
      return [];
    }
  };

  const filterPosts = (posts: Post[], searchTerm: string): Post[] => {
    return posts.filter(post => {
      const usernameMatch = post.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const captionMatch = post.caption?.toLowerCase().includes(searchTerm.toLowerCase());
      return usernameMatch || captionMatch;
    });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://api.dripdropco.com/users");
        const data = await response.json();
        setUsers(data);
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

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredUsers([]);
      setFilteredPosts([]);
    } else if (searchType === 'accounts') {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      const filtered = filterPosts(posts, searchQuery);
      setFilteredPosts(filtered);
    }
  }, [searchQuery, searchType, users, posts]);

  const handleUserPress = (id: number) => {
    router.replace(`/authenticated/profile?id=${id}` as any);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    // Find the index of the clicked post in the filteredPosts array
    const index = filteredPosts.findIndex((p) => p.postID === post.postID);
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

  // Render a post in modal
  const renderPostInModal = ({ item }: { item: Post }) => {
    return (
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.backButton} onPress={closeModal}>
          <Icon name="arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Image
          source={{ uri: `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png` }}
          style={styles.modalImage}
        />
        <View style={styles.modalTextContainer}>
          <Text style={styles.modalUsername}>{item.username}</Text>
          <Text style={styles.modalCaption}>{item.caption}</Text>
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
              <Icon name="heart" size={30} color={item.numLikes > 0 ? "red" : "grey"} />
              <Text style={styles.modalLikeText}>{item.numLikes}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleComments}>
              <Icon name="comment" size={30} color="grey" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

 
  
    // Handle failure when scrolling to an index
    const onScrollToIndexFailed = (info: { index: number; averageItemLength: number }) => {
      const { index } = info;
      console.warn(`Error scrolling to index ${index}. Retrying...`);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: true });
      }, 500);
    };
  
    // Create a ref for FlatList
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
          style={[styles.toggleButton, searchType === 'accounts' && styles.activeToggle]}
          onPress={() => setSearchType('accounts')}
        >
          <Text style={styles.toggleText}>Accounts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, searchType === 'posts' && styles.activeToggle]}
          onPress={() => setSearchType('posts')}
        >
          <Text style={styles.toggleText}>Posts</Text>
        </TouchableOpacity>
      </View>

      {searchType === 'accounts' ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => handleUserPress(item.id)}>
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
              const imageURL =
                Array.isArray(post.images) && post.images.length > 0 && post.images[0].imageURL
                  ? `https://cdn.dripdropco.com/${post.images[0].imageURL}?format=png`
                  : 'default_image.png';
              return (
                <TouchableOpacity key={post.postID} style={styles.postCard} onPress={() => handlePostClick(post)}>
                  <Image source={{ uri: imageURL }} style={styles.postImage} />
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noResultsText}>No posts found</Text>
          )}
        </ScrollView>
      )}

       {/* Modal for the selected post */}
       <Modal visible={selectedPost !== null} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalBackdrop}></View>
          </TouchableWithoutFeedback>

          {selectedPost && (
            <FlatList
              ref={flatListRef}
              data={filteredPosts} // This will show the rest of the posts in the modal
              renderItem={renderPostInModal}
              keyExtractor={(item) => item.postID.toString()}
              horizontal={false}  // For vertical scrolling
              pagingEnabled={true}  // Enables one post per screen
              showsVerticalScrollIndicator={false}
              initialScrollIndex={initialIndex}  // Scroll to the index of the clicked post
              onScrollToIndexFailed={onScrollToIndexFailed} // Handle failures
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  activeToggle: {
    backgroundColor: '#5271ff',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingBottom: 20,  // Ensure scrolling works properly if there are many users
  },
  userItem: {
    fontSize: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  postCard: {
    width: '50%',
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: 200,  // Ensure the height of the image is uniform
    borderRadius: 5,
    resizeMode: 'cover',  // This will ensure the image covers the TouchableOpacity without stretching
  },
  postCaption: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  postUsername: {
    fontSize: 14,
    color: 'grey',
    marginTop: 4,
  },
  postActions: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    height: windowHeight,  // Make it take full height of the screen
    width: windowWidth,
    maxWidth: 500,
  },
  modalImage: {
    width: '100%',
    height: 500,
    marginTop: 120,  // Center the image vertically
    marginBottom: 20
  },
  modalTextContainer: {
    marginTop: 10,
  },
  modalUsername: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCaption: {
    fontSize: 16,
    marginTop: 10,
    color: 'grey',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalLikeText: {
    marginLeft: 5,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingTop: 50
  },
});
