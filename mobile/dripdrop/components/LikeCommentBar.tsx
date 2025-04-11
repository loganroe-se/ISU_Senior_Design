import { Alert, View, Text, StyleSheet } from "react-native"
import React, { useCallback } from "react";
import { useUserContext } from "@/context/UserContext";
import { likePost, unlikePost } from "@/api/like";
import { Comment } from "@/types/Comment";
import { FeedPost } from "@/types/post";
import Icon from "react-native-vector-icons/FontAwesome";
import { Colors } from "@/constants/Colors"
import { fetchCommentsByPostID } from "@/api/comment";

interface LikeCommentBarProps {
    feedData: FeedPost[];
    setFeedData: React.Dispatch<React.SetStateAction<FeedPost[]>>;
    userID: string;
    item: FeedPost;
    setCurrentPostID: React.Dispatch<React.SetStateAction<number | null>>;
    setCommentModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setLoadingComments: React.Dispatch<React.SetStateAction<boolean>>;
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
    onLike?: () => void;
    onComment?: () => void;
}

const LikeCommentBar = ({ 
    feedData, 
    setFeedData, 
    userID, 
    item, 
    setCurrentPostID, 
    setCommentModalVisible,
    setLoadingComments,
    setComments,
    onLike, 
    onComment 
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