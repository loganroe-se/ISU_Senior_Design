import React, { useState } from "react";
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
} from "react-native";
import { Post } from "@/types/post";
import { Ionicons } from "@expo/vector-icons";
import { createComment, fetchCommentsByPostID } from "@/api/comment";
import { Comment } from "@/types/Comment";
import { useUserContext } from "@/context/UserContext";

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [liked, setLiked] = useState(post.userHasLiked || false);
  const { user } = useUserContext();
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleLike = () => setLiked(!liked);

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
        style={styles.image}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleLike}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={28}
            color={liked ? "red" : "black"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={openComments}>
          <Ionicons
            name="chatbubble-outline"
            size={26}
            color="black"
            style={{ marginLeft: 10 }}
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
  image: { width: "100%", height: 400 },
  actions: { flexDirection: "row", padding: 10 },
  caption: { paddingHorizontal: 10, marginTop: 5 },
  viewComments: { paddingHorizontal: 10, color: "gray", marginTop: 4 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
});
