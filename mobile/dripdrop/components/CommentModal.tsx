import { Modal, SafeAreaView, KeyboardAvoidingView, Platform, Keyboard, View, Text, ActivityIndicator, Dimensions, Image, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import React, { RefObject, useEffect } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { createComment, fetchCommentsByPostID } from "@/api/comment";
import { Comment } from "@/types/Comment";
import { FeedPost } from "@/types/post";
import { sendComment } from "@/types/sendComment.interface";
import { Colors } from "@/constants/Colors"
import { GestureHandlerRootView, PanGestureHandler, TouchableWithoutFeedback } from "react-native-gesture-handler";

interface CommentModalProps {
    userID: string;
    commentInputRef: RefObject<TextInput>;
    commentText: string;
    setCommentText: React.Dispatch<React.SetStateAction<string>>;
    currentPostID: number | null;
    setCurrentPostID: React.Dispatch<React.SetStateAction<number | null>>;
    commentModalVisible: boolean;
    setCommentModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    loadingComments: boolean;
    setLoadingComments: React.Dispatch<React.SetStateAction<boolean>>;
    comments: Comment[];
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
    loadingAddComment: boolean;
    setLoadingAddComment: React.Dispatch<React.SetStateAction<boolean>>;
    setFeedData: React.Dispatch<React.SetStateAction<FeedPost[]>>;
}

const windowHeight = Dimensions.get('window').height;

const CommentModal = ({
    userID,
    commentInputRef,
    commentText,
    setCommentText,
    currentPostID,
    setCurrentPostID,
    commentModalVisible,
    setCommentModalVisible,
    loadingComments,
    setLoadingComments,
    comments,
    setComments,
    loadingAddComment,
    setLoadingAddComment,
    setFeedData
}: CommentModalProps) => {
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

    return (
        (commentModalVisible && <Modal 
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
        </Modal>)
    );
};

const styles = StyleSheet.create({
  commentContainer: {
    backgroundColor: Colors.light.background,
    padding: 10,
    borderTopLeftRadius: 20, // TODO: Can't get the radius to work 
    borderTopRightRadius: 20,
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
  }
});

export default CommentModal;