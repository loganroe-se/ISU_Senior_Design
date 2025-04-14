import React, { useEffect, useState, useRef } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FeedPost } from "@/types/post";
import { useUserContext } from "@/context/UserContext";
import { profileStyle } from "@/styles/profile";
import { Colors } from "@/constants/Colors";
import LikeCommentBar from "@/components/LikeCommentBar";
import CommentModal from "@/components/CommentModal";
import { Comment } from "@/types/Comment";
import { useRouter } from "expo-router";

const windowWidth = Dimensions.get("window").width * 0.95;
const windowHeight = Dimensions.get("window").height;
const headerHeight = 40;
const navbarHeight = 40;

const SearchFeed = () => {
  const { user } = useUserContext();
  const { posts, initialIndex } = useLocalSearchParams<{ posts: string; initialIndex: string }>();
  const [feedData, setFeedData] = useState<FeedPost[]>([]);
  const [imageDimensions, setImageDimensions] = useState<{ [key: number]: number }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [expandedCaptions, setExpandedCaptions] = useState<{ [key: number]: boolean }>({});
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentPostID, setCurrentPostID] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<TextInput | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (posts) {
      try {
        const parsedPosts: FeedPost[] = JSON.parse(decodeURIComponent(posts));
        const selectedIndexNum = parseInt(initialIndex ?? "0", 10);

        // Rearrange the feed so that the selected post is first, followed by the rest
        const rearrangedPosts = [
          ...parsedPosts.slice(selectedIndexNum),
          ...parsedPosts.slice(0, selectedIndexNum),
        ];

        setFeedData(rearrangedPosts);
      } catch (error) {
        console.error("Failed to parse posts:", error);
      }
    }
  }, [posts, initialIndex]);

  const toggleCaption = (postID: number) => {
    setExpandedCaptions((prev) => ({
      ...prev,
      [postID]: !prev[postID],
    }));
  };

  const onImageLayout = (postID: number, imageURL: string) => {
    Image.getSize(
      imageURL,
      (width, height) => {
        const ratio = windowWidth / width;
        const calculatedHeight = height * ratio;

        setImageDimensions((prev) => ({
          ...prev,
          [postID]: calculatedHeight,
        }));
      },
      () => {
        setImageErrors((prev) => ({
          ...prev,
          [postID]: true,
        }));
      }
    );
  };

  const onImageError = (postID: number) => {
    setImageErrors((prev) => ({
      ...prev,
      [postID]: true,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[profileStyle.feedContainer, styles.preventOverflow]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>search results</Text>
        </View>

        <FlatList
          contentContainerStyle={{
            paddingTop: headerHeight,
            paddingBottom: navbarHeight,
          }}
          data={feedData}
          keyExtractor={(item) => item.postID.toString()}
          renderItem={({ item }) => {
            const imageHeight = imageDimensions[item.postID];
            const imageURL = item.images?.[0]?.imageURL
              ? `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png`
              : "";

            return (
              <View style={styles.feedItem}>
                <Text style={styles.username}>{item.username}</Text>

                {imageErrors[item.postID] || !imageURL ? (
                  <View style={styles.imageErrorBox}>
                    <Text style={styles.imageErrorText}>
                      There was an error loading the image.
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: imageURL }}
                    style={[styles.image, { width: windowWidth, height: imageHeight || undefined }]}
                    onLoad={() => onImageLayout(item.postID, imageURL)}
                    onError={() => onImageError(item.postID)}
                  />
                )}

                <LikeCommentBar
                  feedData={feedData}
                  setFeedData={setFeedData}
                  userID={user?.uuid ?? ""}
                  item={item}
                  setCurrentPostID={setCurrentPostID}
                  setCommentModalVisible={setCommentModalVisible}
                  setLoadingComments={() => {}}
                  setComments={setComments}
                />

                <Text
                  style={styles.caption}
                  numberOfLines={expandedCaptions[item.postID] ? undefined : 3}
                  ellipsizeMode="tail"
                >
                  <Text style={styles.usernameInline}>{item.username}</Text>{" "}
                  {item.caption}
                </Text>
                {item.caption.length > 100 && (
                  <TouchableOpacity onPress={() => toggleCaption(item.postID)}>
                    <Text style={styles.showMoreText}>
                      {expandedCaptions[item.postID] ? "Show less" : "Show more"}
                    </Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.date}>{item.createdDate}</Text>
              </View>
            );
          }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.text}>Loading posts...</Text>
            </View>
          )}
          scrollEnabled={true}
          horizontal={false}
        />

        <CommentModal
          userID={user?.uuid ?? ""}
          commentInputRef={commentInputRef}
          commentText={commentText}
          setCommentText={setCommentText}
          currentPostID={currentPostID}
          setCurrentPostID={setCurrentPostID}
          commentModalVisible={commentModalVisible}
          setCommentModalVisible={setCommentModalVisible}
          loadingComments={false}
          setLoadingComments={() => {}}
          comments={comments}
          setComments={setComments}
          loadingAddComment={false}
          setLoadingAddComment={() => {}}
          setFeedData={setFeedData}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.light.background,
  },
  preventOverflow: {
    overflow: "hidden", // Prevent any horizontal overflow
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: headerHeight,
    backgroundColor: Colors.light.background,
    justifyContent: "flex-start",
    paddingTop: 5,
    paddingLeft: 15,
    zIndex: 1,
  },
  headerText: {
    color: Colors.light.primary,
    marginLeft: 20,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "italic",
  },
  feedItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    width: "100%",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  usernameInline: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
  caption: {
    fontSize: 16,
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "gray",
  },
  image: {
    borderRadius: 8,
    marginBottom: 10,
  },
  imageErrorBox: {
    width: windowWidth,
    height: windowWidth,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
  },
  imageErrorText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  showMoreText: {
    color: "#a9a9a9",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: windowHeight * 0.3,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: 5,
    zIndex: 2,
    paddingRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.primary,
  },
});

export default SearchFeed;
