import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Avatar, Text, Button } from "react-native-paper";
import { useUserContext } from "@/context/UserContext";
import { fetchUserPosts } from "@/api/post";
import {
  fetchFollowers,
  fetchFollowing,
  fetchUserByUsername,
  followUser,
  unfollowUser,
} from "@/api/following";
import { fetchUserById } from "@/api/user";
import { Follower, Following } from "@/types/Following";
import { Post } from "@/types/post";
import { User } from "@/types/user.interface";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { profileStyle } from "./_components/profileStyle";
import { PostGrid } from "./_components/PostGrid";

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
  const [settingsVisible, setSettingsVisible] = useState(false);

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
        <Avatar.Image
          size={90}
          source={{
            uri: `https://cdn.dripdropco.com/${profileUser?.profilePic}?format=png`,
          }}
          style={profileStyle.avatarContainer}
        />
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

      <PostGrid posts={posts} />

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
});

export default UserProfile;
