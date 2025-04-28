import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { Post } from "@/types/post";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { createComment, fetchCommentsByPostID } from "@/api/comment";
import { Comment } from "@/types/Comment";
import { useUserContext } from "@/context/UserContext";
import { Colors } from "@/constants/Colors";
import { likePost, unlikePost } from "@/api/like";
import { createBookmark, removeBookmark } from "@/api/bookmark";

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [liked, setLiked] = useState(post.userHasLiked || false);
  const [numLikes, setNumLikes] = useState(post.numLikes);
  const [saved, setSaved] = useState(post.userHasSaved || false);
  const { user } = useUserContext();
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [numComments, setNumComments] = useState(post.numComments);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageHeight, setImageHeight] = useState(400);

  useEffect(() => {
    Image.getSize(`https://cdn.dripdropco.com/${post.images[0].imageURL}?format=png`, (width, height) => {
      const ratio = windowWidth / width;
      const calculatedHeight = height * ratio;
      setImageHeight(calculatedHeight < windowHeight * 0.65 ? calculatedHeight : windowHeight * 0.65);
    });
  }, []);

  const toggleLike = (async () => {
    if (liked) {
      unlikePost(post.postID);
      setNumLikes(numLikes - 1);
    } else {
      likePost(post.postID);
      setNumLikes(numLikes + 1);
    }

    setLiked(!liked);
  });

  const toggleBookmark = (async () => {
    saved ? removeBookmark(post.postID) : createBookmark(post.postID);
    setSaved(!saved);
  });

  const openComments = async () => {
    setModalVisible(true);
    setLoadingComments(true);
    try {
      const c = await fetchCommentsByPostID(post.postID);
      setComments(c);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!input.trim() || !user) return;
    setComments((prev) => [
      ...prev,
      {
        commentID: Date.now(),
        postID: post.postID,
        content: input,
        createdDate: new Date().toISOString(),
        username: user.username,
        profilePic: user.profilePic!,
      },
    ]);
    setNumComments(numComments + 1);
    setInput("");
    setSubmitting(true);
    try {
      await createComment({ postId: post.postID, content: input.trim() });
    } catch (err) {
      console.error("Failed to submit comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: `https://cdn.dripdropco.com/${post.user.profilePic}?format=png`,
          }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{post.user.username}</Text>
      </View>

      {/* Image */}
      <Image
        source={{
          uri: `https://cdn.dripdropco.com/${post.images[0].imageURL}?format=png`,
        }}
        style={{ width: windowWidth, height: imageHeight || undefined, resizeMode: 'contain', borderRadius: 8 }}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleLike}>
          <Icon
            name={liked ? "heart" : "heart-o"}
            size={30}
            color={liked ? "red" : "black"}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
        <Text style={styles.iconCount}>{numLikes}</Text>
        <TouchableOpacity onPress={openComments}>
          <Icon
            name="comment-o"
            size={30}
            color="black"
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
        <Text style={styles.iconCount}>{numComments}</Text>
        <TouchableOpacity onPress={toggleBookmark}>
          <Icon
            name={saved ? "bookmark" : "bookmark-o"}
            size={30}
            color={saved ? Colors.light.primary : Colors.light.contrast}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <Text style={styles.caption}>
        <Text style={styles.username}>{post.user.username} </Text>
        {post.caption}
      </Text>

      {/* View Comments */}
      <TouchableOpacity onPress={openComments}>
        <Text style={styles.viewComments}>
          View all {post.numComments} comments
        </Text>
      </TouchableOpacity>

      {/* Comments Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Comments</Text>
                {loadingComments ? (
                  <ActivityIndicator
                    size="large"
                    color="#999"
                    style={{ marginTop: 20 }}
                  />
                ) : (
                  <FlatList
                    data={comments}
                    keyExtractor={(item) => item.commentID.toString()}
                    style={styles.commentList}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                      <View style={styles.commentItem}>
                        <Image
                          source={{
                            uri: `https://cdn.dripdropco.com/${item.profilePic}?format=png`,
                          }}
                          style={styles.commentAvatar}
                        />
                        <View>
                          <Text style={styles.commentUser}>
                            {item.username}
                          </Text>
                          <Text style={styles.commentText}>{item.content}</Text>
                        </View>
                      </View>
                    )}
                  />
                )}
              </View>

              {/* Input Bar */}
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Add a comment..."
                  value={input}
                  onChangeText={setInput}
                  style={styles.textInput}
                  editable={!submitting}
                />
                <TouchableOpacity
                  onPress={handleSubmitComment}
                  disabled={!input.trim() || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#007aff" />
                  ) : (
                    <Ionicons
                      name="send"
                      size={22}
                      color={input.trim() ? "#007aff" : "#ccc"}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* Close */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeIcon}
              >
                <Ionicons name="close" size={20} color="#444" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    minHeight: "80%",
    position: "relative",
  },
  modalContent: {
    flex: 1,
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    marginRight: 10,
  },
  commentList: {
    flexGrow: 0,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentUser: { fontWeight: "bold" },
  commentText: { flexShrink: 1 },
  card: { paddingBottom: 20, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontWeight: "bold" },
  actions: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", padding: 10 },
  caption: { paddingHorizontal: 10 },
  viewComments: { paddingHorizontal: 10, color: "gray", marginTop: 4 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  iconCount: { fontSize: 12, color: Colors.light.contrast, marginRight: 20 },
});
