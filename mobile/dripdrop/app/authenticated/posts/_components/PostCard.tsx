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
  Switch,
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
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { fetchUserByUsername } from "@/api/following";
import { Marker } from "@/types/Marker";
import { router } from "expo-router";
import DraggableItemModal from "@/components/DraggableItemModal";
import { Item } from "@/types/Item";
import { format, parseISO } from "date-fns";

const windowWidth = Dimensions.get("window").width * 0.95;
const IMAGE_ASPECT_RATIO = 4 / 3; // Aspect ratio of 4:3

export const PostCard: React.FC<{
  post: Post;
  itemDetailsMap: Record<number, Item>;
  markersMap: Record<number, Marker[]>;
}> = ({ post, itemDetailsMap, markersMap }) => {
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
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [areMarkersVisible, setAreMarkersVisible] = useState<{
    [postID: number]: boolean;
  }>({});
  const [visibleItemModal, setVisibleItemModal] = useState<{
    postID: number;
    clothingItemID: number;
  } | null>(null);
  const [activeClothingItemID, setActiveClothingItemID] = useState<number>(0);

  // Ensure the image maintains a 4:3 aspect ratio
  useEffect(() => {
    setImageHeight(windowWidth * IMAGE_ASPECT_RATIO);
  }, [windowWidth]);

  const toggleLike = async () => {
    if (liked) {
      unlikePost(post.postID);
      setNumLikes(numLikes - 1);
    } else {
      likePost(post.postID);
      setNumLikes(numLikes + 1);
    }

    setLiked(!liked);
  };

  const toggleBookmark = async () => {
    saved ? removeBookmark(post.postID) : createBookmark(post.postID);
    setSaved(!saved);
  };

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

  // Toggle markers on/off for a given post
  const toggleMarkers = (postID: number) => {
    setAreMarkersVisible((prev) => ({
      ...prev,
      [postID]: !prev[postID],
    }));
  };

  // Show the clothing item details
  const showItemDetails = async (postID: number, clothingItemID: number) => {
    if (itemDetailsMap[clothingItemID]) {
      setVisibleItemModal({ postID, clothingItemID });
      setActiveClothingItemID(clothingItemID);
    }
  };

  // Render the date
  const renderDate = (createdDate: string) => {
    const postDate = parseISO(createdDate);
    const now = new Date();
    const minuteDiff = now.getTime() - postDate.getTime();
    const dayDiff = Math.floor(minuteDiff / (1000 * 60 * 60 * 24));

    if (dayDiff < 1) {
      return "Today";
    } else if (dayDiff === 1) {
      return "Yesterday";
    } else if (dayDiff <= 7) {
      return `${dayDiff} day${dayDiff > 1 ? "s" : ""} ago`;
    } else if (dayDiff <= 365) {
      return format(postDate, "MMMM d");
    } else {
      return format(postDate, "MMMM d, yyyy");
    }
  };

  // Handle navigating to a user's profile page
  const handleProfileNavigation = async (username: string) => {
    setLoadingProfile(true);
    const user = await fetchUserByUsername(username);
    if (user) {
      router.replace(`/authenticated/profile?id=${user.uuid}`);
    }
    setLoadingProfile(false);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => handleProfileNavigation(post.user.username)}
        style={styles.header}
      >
        <Image
          source={{
            uri: `https://cdn.dripdropco.com/${post.user.profilePic}?format=png`,
          }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{post.user.username}</Text>
      </TouchableOpacity>

      {/* Image */}
      <View style={{ position: "relative" }}>
        <Image
          source={{
            uri: `https://cdn.dripdropco.com/${post.images[0].imageURL}?format=png`,
          }}
          style={styles.image}
        />

        {/* Toggle Markers Button */}
        {markersMap[post.postID] && (
          <View style={styles.markerToggleContainer}>
            <Switch
              value={!!areMarkersVisible[post.postID]}
              onValueChange={() => toggleMarkers(post.postID)}
              trackColor={{ false: "black", true: "blue" }}
            />
          </View>
        )}

        {/* Display the markers on each post */}
        {areMarkersVisible[post.postID] &&
          markersMap[post.postID]
            ?.filter((marker) => itemDetailsMap[marker.clothingItemID])
            .map((marker) => {
              const scaleX = windowWidth;
              const scaleY = imageHeight || 1;

              const x = marker.xCoord * scaleX;
              const y = marker.yCoord * scaleY;

              return (
                <TouchableOpacity
                  key={`${post.postID}-${marker.clothingItemID}`}
                  onPress={() => {
                    showItemDetails(post.postID, marker.clothingItemID);
                  }}
                  style={[
                    styles.marker,
                    {
                      left: x,
                      top: y,
                      backgroundColor:
                        marker.clothingItemID === activeClothingItemID
                          ? Colors.light.primary
                          : "rgba(255, 255, 255, 0.8)",
                    },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>•</Text>
                </TouchableOpacity>
              );
            })}
      </View>

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
        <Text
          style={styles.username}
          onPress={() => handleProfileNavigation(post.user.username)}
        >
          {post.user.username}{" "}
        </Text>
        {post.caption}
      </Text>

      {/* View Comments */}
      <TouchableOpacity onPress={openComments}>
        <Text style={styles.viewComments}>
          View all {post.numComments} comments
        </Text>
      </TouchableOpacity>

      {/* Display the post date */}
      <Text style={styles.date}>{renderDate(post.createdDate)}</Text>

      {/* Comments Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <GestureHandlerRootView style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {/* Header - Swipe down indicator */}
                <PanGestureHandler
                  onGestureEvent={(event) => {
                    if (event.nativeEvent.translationY > 50) {
                      setModalVisible(false);
                    }
                  }}
                >
                  <View style={styles.modalHeader}>
                    <View style={styles.swipeIndicator} />
                    <Text style={styles.commentsText}>Comments</Text>
                  </View>
                </PanGestureHandler>
                {loadingComments ? (
                  <ActivityIndicator
                    size="large"
                    color="#999"
                    style={{ marginTop: 20 }}
                  />
                ) : comments.length > 0 ? (
                  <FlatList
                    data={comments}
                    keyExtractor={(item) => item.commentID.toString()}
                    style={styles.commentList}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                      <View style={styles.commentItem}>
                        <TouchableOpacity
                          onPress={() => handleProfileNavigation(item.username)}
                        >
                          <Image
                            source={{
                              uri: `https://cdn.dripdropco.com/${item.profilePic}?format=png`,
                            }}
                            style={styles.commentAvatar}
                          />
                        </TouchableOpacity>
                        <View>
                          <Text
                            style={styles.commentUser}
                            onPress={() =>
                              handleProfileNavigation(item.username)
                            }
                          >
                            {item.username}
                          </Text>
                          <Text style={styles.commentText}>{item.content}</Text>
                        </View>
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.noCommentsText}>
                    No comments yet. Be the first!
                  </Text>
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
            </View>
          </GestureHandlerRootView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Draggable Item Modal */}
      <DraggableItemModal
        visibleItemModal={visibleItemModal}
        onClose={() => {
          setVisibleItemModal(null);
          setActiveClothingItemID(0);
        }}
        onChangeIndex={(newClothingItemID) => {
          setActiveClothingItemID(newClothingItemID);
          setVisibleItemModal((prev) =>
            prev
              ? { postID: prev.postID, clothingItemID: newClothingItemID }
              : null
          );
        }}
        markersMap={markersMap}
        itemDetailsMap={itemDetailsMap}
        onAISuggestions={(aiSuggestions) => {
          setVisibleItemModal(null);
          setActiveClothingItemID(0);
          router.push({
            pathname: "../authenticated/posts/viewpostsuggestions",
            params: {
              suggestions: encodeURIComponent(JSON.stringify(aiSuggestions)),
              userID: user?.uuid,
            },
          });
        }}
      />

      {loadingProfile && (
        <View style={styles.loadingProfileContainer}>
          <ActivityIndicator size="small" color={Colors.light.primary} />
          <Text style={styles.loadingProfileText}>Loading profile...</Text>
        </View>
      )}
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
  noCommentsText: {
    textAlign: "center",
    color: "gray",
    fontStyle: "italic",
    fontSize: 16,
  },
  modalHeader: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
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
    textAlign: "center",
  },
  markerToggleContainer: {
    position: "absolute",
    bottom: 0,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  marker: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: "100%",
    borderWidth: 2,
    borderColor: "black",
    zIndex: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingProfileContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    zIndex: 999,
  },
  loadingProfileText: {
    fontSize: 14,
    color: Colors.light.primary,
    marginTop: 10,
  },
  commentUser: { fontWeight: "bold" },
  commentText: { flexShrink: 1 },
  card: { paddingBottom: 20, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingLeft: 12,
  },
  avatar: { width: 35, height: 35, borderRadius: 20, marginRight: 10 },
  username: { fontWeight: "bold" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,
  },
  caption: { paddingHorizontal: 10 },
  viewComments: { paddingHorizontal: 10, color: "gray", marginTop: 4 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  iconCount: { fontSize: 12, color: Colors.light.contrast, marginRight: 20 },
  date: { paddingHorizontal: 10, fontSize: 14, color: "gray", marginTop: 4 },
  postImage: {
    width: windowWidth,
    borderRadius: 8,
  },
  image: {
    width: windowWidth,
    height: windowWidth * IMAGE_ASPECT_RATIO,
    resizeMode: "cover", // Ensures the image fills the container
    borderRadius: 8,
    marginLeft: "2.5%",
  },
});
