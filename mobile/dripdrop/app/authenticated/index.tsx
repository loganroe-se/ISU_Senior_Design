import { Text, StyleSheet, View, Alert, Image, FlatList, ActivityIndicator, Dimensions } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useUserContext } from "@/context/UserContext";
import { getFeed } from "@/api/feed";
import { likePost, unlikePost } from "@/api/like"
import { FeedPost } from "@/types/types";
import { Colors } from "@/constants/Colors"
import { profileStyle } from "@/styles/profile";
import Icon from "react-native-vector-icons/FontAwesome";

const windowWidth = Dimensions.get('window').width * 0.95;
const navbarHeight = 60; // TODO: change this to either dynamic or change it when the navbar is changed
const headerHeight = 40;

const Page = () => {
  const { user } = useUserContext();
  const [userID, setUserID] = useState<number | null>(null);
  const [feedData, setFeedData] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUserID = user?.id;

        // Set them to state if they exist
        if (storedUserID) {
          setUserID(storedUserID);
        } else {
          Alert.alert("No user data", "User is not logged in.");
        }
      } catch (error) {
        console.error("Error retrieving data", error);
        Alert.alert("Error", "Failed to load user data.");
      }
    };

    getUserData();
  }, []); // Empty array ensures this effect runs only once when the component mounts

  // Get the feed data
  useEffect(() => {
    if (userID) {
      getFeed(userID)
        .then((data) => {
          if (data) {
            setFeedData(data);
          } else {
            setError('Failed to fetch feed');
          }
          setLoading(false);
        }).catch(() => {
          setError('Failed to fetch feed');
          setLoading(false);
        });
    }
  }, [userID]);

  // Set the loading symbol
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Set the error if there is one
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{error}</Text>
      </View>
    );
  }

  // Handle a like
  const handleLike = useCallback(async (postID: number) => {
    if (!userID) return;

    try {
      // Check if it has already been liked
      const hasLiked = feedData.some((post) => post.postID === postID && post.userHasLiked);

      // If the post is already called, unlike it, else like it
      if (hasLiked) {
        // Update local state
        setFeedData((prevFeedData) => 
          prevFeedData.map((post) =>
            post.postID === postID ? { ...post, userHasLiked: false, numLikes: post.numLikes - 1 } : post
          )
        );

        // Unlike the post
        await unlikePost(userID, postID);
      } else {
        // Update local state
        setFeedData((prevFeedData) => 
          prevFeedData.map((post) =>
            post.postID === postID ? { ...post, userHasLiked: true, numLikes: post.numLikes + 1 } : post
          )
        );

        // Like the post
        await likePost(userID, postID);
      }
    } catch (error) {
      console.error('Error handling like: ', error);
      Alert.alert('Error', 'Failed to update like status')
    }
  }, [feedData, userID]);

  // Handle a comment
  const handleComment = (postID: number) => {
    // TODO
  };

  // Get image dimensions dynamically
  const onImageLayout = (postID: number, imageURL: string) => {
    Image.getSize(imageURL, (width, height) => {
      const ratio = windowWidth / width;
      const calculatedHeight = height * ratio;

      setImageDimensions(prevState => ({
        ...prevState,
        [postID]: calculatedHeight,
      }));
    });
  };

  return (
    <View style={styles.container}>
        {/* Animated header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>dripdrop</Text>
        </View>

        {/* Render the feed */}
        <FlatList 
          contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: navbarHeight }}
          data={feedData}
          keyExtractor={(item) => item.postID.toString()}
          renderItem={({ item }) => {
            const imageHeight = imageDimensions[item.postID];

            return (
              <View style={styles.feedItem}>
                {/* Display the poster's username */}
                <Text style={styles.username}>{item.username}</Text>

                {/* Display the post's image */}
                {item.images && item.images[0]?.imageURL && (
                  <Image
                    source={{ uri: `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png` }}
                    style={[styles.image, { width: windowWidth, height: imageHeight || undefined, resizeMode: 'contain' }]}
                    onLoad={() => onImageLayout(item.postID, `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png`)}
                  />
                )}

                {/* Buttons for liking and commenting */}
                <View style={styles.iconContainer}>
                  <Icon 
                    name={ item.userHasLiked ? 'heart' : 'heart-o' }
                    size={30}
                    color={ item.userHasLiked ? 'red' : Colors.light.contrast }
                    onPress={() => handleLike(item.postID)}
                    style={styles.icon}
                  />
                  <Text style={styles.iconCount}>{item.numLikes}</Text>
                  <Icon 
                    name="comment-o"
                    size={30}
                    color={Colors.light.contrast}
                    onPress={() => handleComment(item.postID)}
                    style={styles.icon}
                  />
                  <Text style={styles.iconCount}>{item.numComments}</Text>
                </View>

                {/* Display the username & caption */}
                <Text style={styles.caption}><Text style={styles.usernameInline}>{item.username}</Text> {item.caption}</Text>

                {/* Display the post date */}
                <Text style={styles.date}>{item.createdDate}</Text>
              </View>
            );
          }}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: headerHeight,
    backgroundColor: Colors.light.background,
    justifyContent: 'flex-start',
    paddingTop: 5,
    paddingLeft: 15,
    zIndex: 1,
  },
  headerText: {
    color: Colors.light.primary,
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  usernameInline: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  feedItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    width: '100%'
  },
  image: {
    borderRadius: 8,
    marginBottom: 10,
  },
  caption: {
    fontSize: 16,
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: 'gray',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  iconCount: {
    fontSize: 12,
    color: Colors.light.contrast,
    marginRight: 20,
  }
});

export default Page;