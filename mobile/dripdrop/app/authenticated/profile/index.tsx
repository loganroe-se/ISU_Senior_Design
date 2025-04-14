import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  Dimensions
} from "react-native";
import { Avatar, Text, Button } from "react-native-paper";
import { useUserContext } from "@/context/UserContext";
import { fetchUserPosts, updatePost } from "@/api/post";
import {
  fetchFollowers,
  fetchFollowing,
  fetchUserByUsername,
  followUser,
  unfollowUser,
} from "@/api/following";
import { fetchUserById, updateUser } from "@/api/user";
import { Follower, Following } from "@/types/Following";
import { Post } from "@/types/post";
import { User } from "@/types/user.interface";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { profileStyle } from "./_components/profileStyle";
import { PostGrid } from "./_components/PostGrid";
import { Colors } from "@/constants/Colors";

const windowWidth = Dimensions.get('window').width * 0.95;
const windowHeight = Dimensions.get('window').height;
const headerHeight = 40;

const UserProfile = () => {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { user, signOut } = useUserContext();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profilePic, setProfilePic] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [subPage, setSubPage] = useState("PUBLIC");
  const [followModalVisible, setFollowModalVisible] = useState(false);
  const [followModalType, setFollowModalType] = useState("Followers");
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [postModal, setPostModal] = useState<Post>();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [expandedCaptions, setExpandedCaptions] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const getUserData = async () => {
      const uid = id ?? user?.uuid;
      if (!uid) return;

      const profile = await fetchUserById(uid);
      if (profile) {
        setProfileUser(profile);
        updateFollows(uid);
        getUserPosts(uid);
      }
    };
    getUserData();
  }, [user]);

  useEffect(() => {
    if (profileUser) {
      getUserPosts(profileUser.uuid);
    }
  }, [subPage]);

  const getUserPosts = async (id: string) => {
    const p = await fetchUserPosts(id, subPage);
    setPosts(p);
  };

  const updateFollows = async (id: string) => {
    if (!user) return;

    const f = await fetchFollowing(id);
    const fs = await fetchFollowers(id);

    setFollowing(f);
    setFollowers(fs);

    const isUserFollowing = fs.some((follower) => follower.uuid === user.uuid);
    setIsFollowing(isUserFollowing);
  };

  const setModalPost = (post:Post) => {
    setPostModal(post);
    setPostModalVisible(true);
  };

  const setPostVisibility = async () => {
    let post = postModal;

    if(post) {
      if(post.status != "PUBLIC") {
        post.status = "PUBLIC";
      }
      else {
        post.status = "PRIVATE";
      }

      await updatePost(post);

      console.log("Post updating");
    }
  }

  const toggleCaption = (postID: number) => {
    setExpandedCaptions(prev => ({
      ...prev,
      [postID]: !prev[postID]
    }));
  };

  const actionPress = async () => {
    if (!user || !profileUser) return;

    if (user.uuid === profileUser.uuid) {
      router.push("../authenticated/profile/edit");
    } else {
      if (!isFollowing) {
        await followUser(user.uuid, profileUser.uuid);
      } else {
        await unfollowUser(user.uuid, profileUser.uuid);
      }
      updateFollows(profileUser.uuid);
    }
  };

  const redirectToUser = async (username: string) => {
    const targetUser = await fetchUserByUsername(username);
    if (targetUser) {
      router.replace(`/authenticated/profile?id=${targetUser.uuid}` as any);
    }
  };

  const renderActionButton = () => {
    const isCurrentUser = user?.uuid === profileUser?.uuid;

    if (isCurrentUser) {
      return (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={actionPress}
            style={profileStyle.followedActionButton}
          >
            <Text style={profileStyle.buttonLabel}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => console.log("Share profile")}
            style={profileStyle.followedActionButton}
          >
            <Text style={profileStyle.buttonLabel}>Share Profile</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={actionPress}
          style={
            isFollowing
              ? profileStyle.followedActionButton
              : profileStyle.actionButton
          }
        >
          <Text style={profileStyle.buttonLabel}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      );
    }
  };

  if (!user) {
    return (
      <View style={profileStyle.container}>
        <Text variant="titleLarge">User not signed in</Text>
      </View>
    );
  }

  return (
    <View style={profileStyle.container}>
      <View style={profileStyle.topHeader}>
        <Text style={profileStyle.username}>{profileUser?.username}</Text>
        <TouchableOpacity
          onPress={() => router.push("../authenticated/settings")}
        >
          <Ionicons name="menu-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={profileStyle.profileContainer}>
        <View style={profileStyle.avatarContainer}>
          {
            <Avatar.Image
              size={90}
              source={{ uri: `https://cdn.dripdropco.com/${profileUser?.profilePic}?format=png` }}
            />
          }
        </View>
        <View style={profileStyle.statsContainer}>
          {[
            ["Posts", posts.length],
            ["Followers", followers.length],
            ["Following", following.length],
          ].map(([label, count]) => (
            <TouchableOpacity
              key={label.toString()}
              onPress={() => {
                if (label !== "Posts") {
                  setFollowModalVisible(true);
                  setFollowModalType(label.toString());
                }
              }}
            >
              <View style={profileStyle.stat}>
                <Text style={profileStyle.statNumber}>{count}</Text>
                <Text style={profileStyle.statLabel}>{label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bio Section */}
      <View style={profileStyle.bioSection}>
        <Text style={profileStyle.nameText}>{profileUser?.username}</Text>
        <Text style={profileStyle.bioText}>
          {profileUser?.bio ||
            "NYC-based photographer 📸\nLover of light, coffee, and good vibes.\nLet's create something beautiful."}
        </Text>

        {profileUser?.link && (
          <TouchableOpacity onPress={() => Linking.openURL(profileUser.link!)}>
            <Text style={profileStyle.linkText}>{profileUser.link}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={profileStyle.editButtonWrapper}>{renderActionButton()}</View>

      {user.uuid === profileUser?.uuid && (
        <View style={profileStyle.subpageContainer}>
          {["PUBLIC", "PRIVATE", "NEEDS_REVIEW"].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setSubPage(tab)}>
              <Text
                style={
                  subPage === tab
                    ? profileStyle.subpagePickerTextSelected
                    : profileStyle.subpagePickerText
                }
              >
                {tab === "PUBLIC"
                  ? "Posts"
                  : tab === "PRIVATE"
                    ? "Drafts"
                    : "Review"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <PostGrid posts={posts} onPressPost={setModalPost} />

      {/* Settings Modal */}
      <Modal
        transparent
        visible={settingsVisible}
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={profileStyle.modalOverlay}>
          <View style={profileStyle.modalSheet}>
            <Text style={profileStyle.modalTitle}>Account Settings</Text>

            <TouchableOpacity
              style={profileStyle.modalOption}
              onPress={() => {
                setSettingsVisible(false);
                router.push("../authenticated/profile/edit");
              }}
            >
              <Text style={profileStyle.modalOptionText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={profileStyle.modalOption}
              onPress={() => {
                setSettingsVisible(false);
                signOut();
              }}
            >
              <Text style={[profileStyle.modalOptionText, { color: "red" }]}>
                Sign Out
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSettingsVisible(false)}>
              <Text style={profileStyle.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Follow Modal */}
      <Modal
        transparent={true}
        visible={followModalVisible}
        onRequestClose={() => setFollowModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>{followModalType}</Text>
              <Button onPress={() => setFollowModalVisible(false)}>
                <Text>x</Text>
              </Button>
            </View>
            {(followModalType === "Followers" ? followers : following).map(
              (u) => (
                <TouchableOpacity
                  key={u.uuid}
                  onPress={() => redirectToUser(u.username)}
                >
                  <Text>{u.username}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </Modal>
      
      {/* Post Modal */}
      <Modal
        transparent={true}
        visible={postModalVisible}
        onRequestClose={() => setPostModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Button onPress={() => setPostModalVisible(false)}>
                <Text style={{color: "black"}}>x</Text>
              </Button>
            </View>
            <View style={styles.feedItem}>
              {postModal &&
                <>
                  {/* Display the poster's username */}
                  <View style={{display: "flex", alignItems: "center", flexDirection: "row", width: "100%", borderBottomColor: "lightgray", borderBottomWidth: 1, padding: 5}}>
                    <View style={profileStyle.avatarContainer}>
                      {
                        <Avatar.Image
                          size={25}
                          source={{ uri: `https://cdn.dripdropco.com/${profileUser?.profilePic}?format=png` }}
                        />
                      }
                    </View>
                    <Text style={styles.username}>{postModal.user.username}</Text>
                  </View>

                  {/* Display the post's image */}
                  {(
                    postModal.images && postModal.images[0]?.imageURL && (
                      <Image
                        source={{ uri: `https://cdn.dripdropco.com/${postModal?.images[0].imageURL}?format=png` }}
                        style={[styles.image, { width: 200, height: 300, resizeMode: 'contain' }]}
                      />
                    )
                  )}

                  {/* Display the username & caption */}
                  <Text style={styles.caption} numberOfLines={expandedCaptions[postModal.postID] ? undefined : 3} ellipsizeMode="tail">
                    <Text style={styles.usernameInline}>{postModal.username}</Text> {postModal.caption}
                  </Text>
                  {postModal.caption.length > 100 && (
                    <TouchableOpacity onPress={() => toggleCaption(postModal.postID)}>
                      <Text style={styles.showMoreText}>
                        {expandedCaptions[postModal.postID] ? "Show less" : "Show more"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Display the post date */}
                  <Text style={styles.date}>{postModal.createdDate}</Text>

                  <Button style={{backgroundColor: 'rgba(0, 122, 255, 1.00)', marginTop: 16, width: '100%'}} onPress={setPostVisibility}>
                    <Text style={{color: "white"}}>Make {postModal.status !== "PUBLIC" ? "Public" : "Private"}</Text>
                  </Button>
                </>
              }
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    elevation: 5,
    width: "80%",
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
    color: "black",
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 5
  },
  usernameInline: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  feedItem: {
    marginBottom: 15,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    width: '100%',
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    borderRadius: 8,
    marginBottom: 10,
  },
  caption: {
    fontSize: 16,
    marginBottom: 5,
    color: "black"
  },
  date: {
    fontSize: 14,
    color: '#848484',
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
  showMoreText: {
    color: "#a9a9a9",
  }
});

export default UserProfile;