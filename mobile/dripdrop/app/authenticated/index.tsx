import { Text, StyleSheet, View, Alert, Image, FlatList, ActivityIndicator, Dimensions, TouchableOpacity, TextInput, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent, Button, AppState } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useUserContext } from "@/context/UserContext";
import { getFeed } from "@/api/feed";
import { markPostsAsSeen, resetSeenPosts } from "@/api/has_seen";
import { FeedPost } from "@/types/post";
import { Comment } from "@/types/Comment";
import { Colors } from "@/constants/Colors"
import { profileStyle } from "@/styles/profile";
import LikeCommentBar from "@/components/LikeCommentBar";
import CommentModal from "@/components/CommentModal";

const windowWidth = Dimensions.get('window').width * 0.95;
const windowHeight = Dimensions.get('window').height;
const navbarHeight = 40; // TODO: change this to either dynamic or change it when the navbar is changed
const headerHeight = 40;

const Page = () => {
  const { user } = useUserContext();
  const [userID, setUserID] = useState<string | null>(null);
  const [feedData, setFeedData] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [loadingAddComment, setLoadingAddComment] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ [key: number]: number }>({});
  const [imageErrors, setImageErrors] = useState< { [key: number]: boolean }>({});
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentPostID, setCurrentPostID] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<TextInput | null>(null);
  const [seenPosts, setSeenPosts] = useState(new Set<number>());
  const [postPositions, setPostPositions] = useState<{ [postID: number]: { y: number; height: number} }>({});
  const [isFetching, setIsFetching] = useState(false);
  const [hasSeenPosts, setHasSeenPosts] = useState(false);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const [expandedCaptions, setExpandedCaptions] = useState<{ [key: number]: boolean }>({});


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
      setLoading(true);
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

  // // Ensure posts get marked as seen once the app is closed/minimized --- TODO: Does not properly track posts seen so this does not work yet
  // useEffect(() => {
  //   const appStateListener = AppState.addEventListener('change', (nextAppState) => {
  //     console.log(nextAppState);
  //     if (nextAppState === 'background' || nextAppState === 'inactive') {
  //       if (seenPosts.size > 0) {
  //         console.log(Array.from(seenPosts));
  //         markPostsAsSeen({ userID: Number(userID), postIDs: Array.from(seenPosts) });
  //       }
  //     }
  //   });

  //   return () => {
  //     appStateListener.remove();
  //   };
  // }, [seenPosts]);

  // See more/less of a caption
  const toggleCaption = (postID: number) => {
    setExpandedCaptions(prev => ({
      ...prev,
      [postID]: !prev[postID]
    }));
  };

  // Keep track of seen posts
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const screenHeight = event.nativeEvent.layoutMeasurement.height;

    Object.entries(postPositions).forEach(([postID, { y, height }]) => {
      const postBottom = y + height;
      if (postBottom <= scrollY + screenHeight) {
        setSeenPosts((prev) => new Set(prev).add(Number(postID)));
      }
    });

    // Check if at the bottom
    const contentHeight = event.nativeEvent.contentSize.height;
    if (scrollY + screenHeight >= contentHeight - 50 && !isFetching && !hasSeenPosts) {
      if (seenPosts.size > 0 && userID) {
        markPostsAsSeen({ postIDs: Array.from(seenPosts) });
        setHasSeenPosts(true);
      }
      getNewPosts();
    }
  };

  // Get new posts
  const getNewPosts = async () => {
    if (isFetching) return;
    if ((userID ?? 0) === 0) return;

    setIsFetching(true);

    try {
      if (userID) {
        getFeed(userID)
          .then((data) => {
            if (data) {
              setFeedData((prev) => {
                const newPostIDs = data.map((p) => p.postID);
                const existingPostIDs = prev.map((p) => p.postID);
                if (newPostIDs.length > 0 && !newPostIDs.every(id => existingPostIDs.includes(id))) {
                  setNoMorePosts(false);
                  setHasSeenPosts(false)
                } else {
                  setNoMorePosts(true);
                }
                const uniquePosts = [
                  ...prev,
                  ...data.filter((newPost) => !existingPostIDs.includes(newPost.postID)),
                ];
                return uniquePosts
              });
              setLoading(false);
            } else {
              setError('Failed to fetch feed');
            }
          }).catch(() => {
            setError('Failed to fetch feed');
          });
      }
    } catch (error) {
      console.error("Error fetching new posts:", error);
    }

    setIsFetching(false);
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
    }, () => {
      // If it fails to get a size, there was an error
      setImageErrors(prevState => ({
        ...prevState,
        [postID]: true,
      }));
    });
  };

  // Define an onImageError function
  const onImageError = (postID: number) => {
    setImageErrors(prevState => ({
      ...prevState,
      [postID]: true,
    }));
  };

  // Handle the post layout
  const handleLayout = (postID: number, event: LayoutChangeEvent) => {
    event.persist();
    if (!event.nativeEvent.layout) return;

    setPostPositions((prev) => ({
      ...prev,
      [postID]: {
        y: event.nativeEvent.layout.y,
        height: event.nativeEvent.layout.height,
      },
    }));
  };

  // Reset feed
  const resetFeed = async () => {
    if (!userID) return;
    setFeedData([]);
    setHasSeenPosts(false);
    setNoMorePosts(false);
    setLoading(true);

    try {
      await resetSeenPosts(userID);
      setSeenPosts(new Set());
      setPostPositions({});

      getNewPosts();
    } catch (error) {
      console.error("Error resetting feed:", error);
    }
  };

  return (
    <View style={profileStyle.feedContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>dripdrop</Text>
      </View>

      {loading  ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.text}>{error}</Text>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList 
            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: navbarHeight }}
            data={feedData}
            keyExtractor={(item) => item.postID.toString()}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const imageHeight = imageDimensions[item.postID];
              const imageURL = item.images && item.images[0]?.imageURL ? `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png`: "";
  
              return (
                <View style={styles.feedItem} onLayout={(event) => handleLayout(item.postID, event)}>
                  {/* Display the poster's username */}
                  <Text style={styles.username}>{item.username}</Text>
  
                  {/* Display the post's image */}
                  {imageErrors[item.postID] || !(item.images && item.images[0]?.imageURL) ? (
                    <View style={styles.imageErrorBox}>
                      <Text style={styles.imageErrorText}>There was an error loading the image.</Text>
                    </View>
                  ) : (
                    item.images && item.images[0]?.imageURL && (
                      <Image
                        source={{ uri: imageURL }}
                        style={[styles.image, { width: windowWidth, height: imageHeight || undefined, resizeMode: 'contain' }]}
                        onLoad={() => onImageLayout(item.postID, imageURL)}
                        onError={() => onImageError(item.postID)}
                      />
                    )
                  )}
  
                  {/* Buttons for liking and commenting */}
                  <LikeCommentBar 
                    feedData={feedData}
                    setFeedData={setFeedData}
                    userID={userID ? userID : ""}
                    item={item}
                    setCurrentPostID={setCurrentPostID}
                    setCommentModalVisible={setCommentModalVisible}
                    setLoadingComments={setLoadingComments}
                    setComments={setComments}
                  />
  
                  {/* Display the username & caption */}
                  <Text style={styles.caption} numberOfLines={expandedCaptions[item.postID] ? undefined : 3} ellipsizeMode="tail">
                    <Text style={styles.usernameInline}>{item.username}</Text> {item.caption}
                  </Text>
                  {item.caption.length > 100 && (
                    <TouchableOpacity onPress={() => toggleCaption(item.postID)}>
                      <Text style={styles.showMoreText}>
                        {expandedCaptions[item.postID] ? "Show less" : "Show more"}
                      </Text>
                    </TouchableOpacity>
                  )}
  
                  {/* Display the post date */}
                  <Text style={styles.date}>{item.createdDate}</Text>
                </View>
              );
            }}
            ListFooterComponent={
              noMorePosts ? (
                <View style={styles.noMorePostsMessage}>
                  <Text style={styles.noMorePostsMessageText}>There are no more new posts to view. Would you like to reset your feed?</Text>
                  <Button title="Reset Feed" onPress={resetFeed} />
                </View>
              ) : null
            }
          />

          {/* There are no posts, ask if the user wants to reset feed */}
          {feedData.length === 0 && <View
            style={{ justifyContent: "center", alignItems: "center", minHeight: windowHeight }}
          >
            <Text style={styles.noMorePostsMessageText}>There are no more new posts to view. Would you like to reset your feed?</Text>
            <Button title="Reset Feed" onPress={resetFeed} />
          </View>}

          {/* Comment Modal */}
          <CommentModal 
            userID={userID ? userID : ""}
            commentInputRef={commentInputRef}
            commentText={commentText}
            setCommentText={setCommentText}
            currentPostID={currentPostID}
            setCurrentPostID={setCurrentPostID}
            commentModalVisible={commentModalVisible}
            setCommentModalVisible={setCommentModalVisible}
            loadingComments={loadingComments}
            setLoadingComments={setLoadingComments}
            comments={comments}
            setComments={setComments}
            loadingAddComment={loadingAddComment}
            setLoadingAddComment={setLoadingAddComment}
            setFeedData={setFeedData}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  imageErrorBox: {
    width: windowWidth,
    height: windowWidth,
    backgroundColor: "#ccc",
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  imageErrorText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  caption: {
    fontSize: 16,
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: 'gray',
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
  noMorePostsMessage: {
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  noMorePostsMessageText: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  showMoreText: {
    color: "#a9a9a9",
  }
});

export default Page;