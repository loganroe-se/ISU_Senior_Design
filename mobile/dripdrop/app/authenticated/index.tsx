import { Text, StyleSheet, View, Alert, Image, FlatList, ActivityIndicator, Dimensions, Modal, KeyboardAvoidingView, Platform, Keyboard, TouchableOpacity, TextInput, SafeAreaView } from "react-native";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useUserContext } from "@/context/UserContext";
import { getFeed } from "@/api/feed";
import { likePost, unlikePost } from "@/api/like"
import { createComment, fetchCommentsByPostID } from "@/api/comment";
import { FeedPost } from "@/types/post";
import { Comment } from "@/types/Comment";
import { sendComment } from "@/types/sendComment.interface";
import { Colors } from "@/constants/Colors"
import { profileStyle } from "@/styles/profile";
import { GestureHandlerRootView, PanGestureHandler, TouchableWithoutFeedback } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome";

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

  // Get comments on comment open
  const handleComment = async (postID: number) => {
    setCurrentPostID(postID);
    setCommentModalVisible(true);
    setLoadingComments(true);

    try {
      const comments = await fetchCommentsByPostID(postID);
      comments.length === 0 ? setComments([]): setComments(comments);
    } catch (error) {
      console.error("Error fetching comments: ", error)
    } finally {
      setLoadingComments(false);
    }
  };

  // Add a new comment
  const handleAddComment = async () => {
    if (!commentText.trim() || currentPostID === null) return;
    if (userID == null) return;

    setLoadingAddComment(true);

    const newComment: sendComment = {
      postId: currentPostID,
      userId: userID,
      content: commentText,
    };

    try {
      await createComment(newComment);
      setCommentText("");
      setFeedData((prevFeedData) => 
        prevFeedData.map((post) => 
          post.postID === currentPostID ? { ...post, numComments: post.numComments + 1} : post
        )
      );
      handleComment(currentPostID);
      setLoadingAddComment(false);
    } catch (error) {
      console.error("Error adding a new comment: ", error);
    }
  };

  // Focus the input when the modal opens
  useEffect(() => {
    if (commentModalVisible) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    }
  }, [commentModalVisible]);

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
      // If the it failes to get a size, there was an error
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
              renderItem={({ item }) => {
                const imageHeight = imageDimensions[item.postID];
                const imageURL = `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png`
    
                return (
                  <View style={styles.feedItem}>
                    {/* Display the poster's username */}
                    <Text style={styles.username}>{item.username}</Text>
    
                    {/* Display the post's image */}
                    {imageErrors[item.postID] ? (
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

            {/* Comment Modal */}
            {commentModalVisible && <Modal 
              animationType="slide"
              transparent={false}
              visible={commentModalVisible}
              onRequestClose={() => setCommentModalVisible(false)}
            >
              <SafeAreaView style={{ flex: 1 }}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                      <View style={styles.commentContainer}>
                        {/* Header - Swipe down indicator */}
                        <PanGestureHandler
                          onGestureEvent={(event) => {
                            if (event.nativeEvent.translationY > 50) {
                              setCommentModalVisible(false);
                            }
                          }}
                        >
                          <View style={styles.modalHeader}>
                            <View style={styles.swipeIndicator}/>
                            <Text style={styles.commentsText}>Comments</Text>
                          </View>
                        </PanGestureHandler>

                        {/* Comments List */}
                        <KeyboardAwareScrollView style={[styles.commentList, { maxHeight: windowHeight - 150 }]} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }} onScroll={Keyboard.dismiss} scrollEnabled={true}>
                          {loadingComments ? (
                            <ActivityIndicator size="large" color={Colors.light.primary}/>
                          ) : comments.length > 0 ? (
                            comments.map((comment) => (
                              <View key={comment.commentID} style={styles.commentItem}>
                                <Image 
                                  source={{ uri: `https://cdn.dripdropco.com/${comment.profilePic !== "default" ? comment.profilePic : "profilePics/default.jpg" }?format=png` }}
                                  style={styles.profilePicture}
                                />
                                <View style={styles.commentTextContainer}>
                                  <View style={styles.commentHeader}>
                                    <Text style={styles.commentUsername}>{comment.username}</Text>
                                    <Text style={styles.commentDate}>{comment.createdDate}</Text>
                                  </View>
                                  <Text>{comment.content}</Text>
                                </View>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.noCommentsText}>No comments yet. Be the first!</Text>
                          )}
                        </KeyboardAwareScrollView>

                        {/* Comment Input */}
                        <View style={styles.inputContainer}>
                          <TextInput 
                            ref={commentInputRef}
                            style={styles.commentInput}
                            placeholder="Add a comment..."
                            value={commentText}
                            onChangeText={setCommentText}
                            autoFocus={true}
                            multiline={true}
                            numberOfLines={5}
                            scrollEnabled={true}
                          />
                          <TouchableOpacity onPress={handleAddComment}>
                            {loadingAddComment ? (
                              <ActivityIndicator size="small" color={Colors.light.primary}/>
                            ) : (
                              <Text style={styles.sendButton}>Post</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                    </TouchableWithoutFeedback>
                  </KeyboardAvoidingView>
                </GestureHandlerRootView>
              </SafeAreaView>
            </Modal>}
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
  },
  commentContainer: {
    backgroundColor: Colors.light.background,
    padding: 10,
    borderTopLeftRadius: 20, // TODO: Can't get the radius to work 
    borderTopRightRadius: 20,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
  modalHeader: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  commentsText: {
    marginVertical: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  commentList: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  profilePicture: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 10,
    marginTop: 5,
  },
  commentTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  commentDate: {
    marginLeft: 5,
    fontSize: 14,
    color: 'gray',
  },
  noCommentsText: {
    textAlign: 'center',
    color: 'gray',
    fontStyle: 'italic',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.contrast,
  },
  commentInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    fontSize: 18,
    color: Colors.light.primary,
    fontWeight: 'bold',
  }
});

export default Page;