import { Alert, View, Text, StyleSheet } from "react-native"
import React from "react";
import { likePost, unlikePost } from "@/api/like";
import { createBookmark, removeBookmark } from "@/api/bookmark";
import { Comment } from "@/types/Comment";
import { Post } from "@/types/post";
import { Colors } from "@/constants/Colors"
import { fetchCommentsByPostID } from "@/api/comment";
import Icon from "react-native-vector-icons/FontAwesome";

interface LikeCommentBarProps {
    feedData: Post[];
    setFeedData: React.Dispatch<React.SetStateAction<Post[]>>;
    userID: string;
    item: Post;
    setCurrentPostID: React.Dispatch<React.SetStateAction<number | null>>;
    setCommentModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setLoadingComments: React.Dispatch<React.SetStateAction<boolean>>;
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

const LikeCommentBar = ({ 
    feedData, 
    setFeedData, 
    userID, 
    item, 
    setCurrentPostID, 
    setCommentModalVisible,
    setLoadingComments,
    setComments
}: LikeCommentBarProps) => {
    // Handle a like
    const handleLike = (async (postID: number) => {
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
    });

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
    // Handle bookmarks
    const handleBookmark = (async (postID: number) => {
        if (!userID) return;

        try {
            // Check if it has already been saved
            const hasSaved = feedData.some((post) => post.postID === postID && post.userHasSaved);

            // If the post is already saved, unsave it, else save it
            if (hasSaved) {
                // Update local state
                setFeedData((prevFeedData) => 
                    prevFeedData.map((post) =>
                    post.postID === postID ? { ...post, userHasSaved: false } : post
                    )
                );

                // Unsave the post
                await removeBookmark(postID);
            } else {
                // Update local state
                setFeedData((prevFeedData) => 
                    prevFeedData.map((post) =>
                    post.postID === postID ? { ...post, userHasSaved: true } : post
                    )
                );

                // Save the post
                await createBookmark(postID);
            }
        } catch (error) {
            console.error('Error handling like: ', error);
            Alert.alert('Error', 'Failed to update like status')
        }
    });

    return (
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
            <Icon
                name={ item.userHasSaved ? 'bookmark' : 'bookmark-o' }
                size={30}
                color={ item.userHasSaved ? Colors.light.primary : Colors.light.contrast }
                onPress={() => handleBookmark(item.postID)}
                style={styles.icon}
            />
        </View>
    );
};

const styles = StyleSheet.create({
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
});

export default LikeCommentBar;