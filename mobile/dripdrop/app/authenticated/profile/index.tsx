import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Linking, ActivityIndicator } from "react-native";
import { Avatar, Text } from "react-native-paper";
import { useUserContext } from "@/context/UserContext";
import { fetchUserPosts, updatePost } from "@/api/post";
import {
  fetchFollowerCount,
  fetchFollowingCount,
  followUser,
  unfollowUser,
} from "@/api/following";
import { fetchUserById } from "@/api/user";
import { Post } from "@/types/post";
import { User } from "@/types/user.interface";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { profileStyle } from "./_components/profileStyle";
import { PostGrid } from "./_components/PostGrid";
import { Colors } from "@/constants/Colors";

const UserProfile = () => {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { user, signOut } = useUserContext();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pubPosts, setPubPosts] = useState<Post[]>([]);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const tab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const [subPage, setSubPage] = useState(tab || "PUBLIC");
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [isBottomLoading, setIsBottomLoading] = useState(true);


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
    setIsBottomLoading(true);

    const p = (await fetchUserPosts(id, subPage)).reverse();
    setPosts(p);
    setIsBottomLoading(false);

    if(subPage === "PUBLIC") {
      setPubPosts(p);
    }
  };

  const handleNavigateToImageMarker = (post:Post) => {
    let caption = post.caption;
    let image = `https://cdn.dripdropco.com/${post.images[0].imageURL}?format=png`;
    let postId = post.postID;

    // Navigate to the ImageMarker screen with the current caption and image data
    router.push({
      pathname: "/authenticated/posts/image_marker",
      params: { caption, image, postId }, // Pass caption and image as parameters
    });
    console.log("Passed the following POSTID: " + postId)
  };

  const updateFollows = async (id: string) => {
    if (!user) return;
  
    const [fCount, followingCheck] = await Promise.all([
      fetchFollowerCount(id),
      fetchFollowingCount(id, true), // checkFollow=true
    ]);
  
    // Follower count is always a number
    setFollowerCount(fCount);
  
    // Extract count again using non-check version
    const fwingCount = await fetchFollowingCount(id);
    if (typeof fwingCount === "number") {
      setFollowingCount(fwingCount);
    }
  
    // Only update if checking follow status
    if (typeof followingCheck !== "number") {
      setIsFollowing(followingCheck.is_following);
    }
  };

  const actionPress = async () => {
    if (!user || !profileUser) return;

    if (user.uuid === profileUser.uuid) {
      router.push("../authenticated/profile/edit");
    } else {
      setLoadingFollow(true);
      try {
        if (!isFollowing) {
          await followUser(user.uuid, profileUser.uuid);
        } else {
          await unfollowUser(user.uuid, profileUser.uuid);
        }
        await updateFollows(profileUser.uuid);
      } catch (err) {
        console.error(err);
      }
      setLoadingFollow(false);
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
          disabled={loadingFollow}
        >
          {loadingFollow ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <Text style={profileStyle.buttonLabel}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          )}
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
      <View style={profileStyle.profileHeader}>
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
            ["Posts", pubPosts.length],
            ["Followers", followerCount],
            ["Following", followingCount],
          ].map(([label, count]) => (
            <TouchableOpacity
              key={label.toString()}
              onPress={() => {
                if (label === "Followers" || label === "Following") {
                  router.push({
                    pathname: "../authenticated/profile/followers",
                    params: {
                      type: label.toLowerCase(),
                      id: profileUser?.uuid,
                    },
                  });
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

        {profileUser?.link && (
          <TouchableOpacity onPress={() => Linking.openURL(profileUser.link!)}>
            <Text style={profileStyle.linkText}>{profileUser.link}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={profileStyle.editButtonWrapper}>{renderActionButton()}</View>

      {user.uuid === profileUser?.uuid ? (
        <View style={profileStyle.subpageContainer}>
          {["PUBLIC", "NEEDS_REVIEW"].map((tab) => (
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
                  : "Drafts"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={profileStyle.postDivider} />
      )}


      {isBottomLoading ? (
        <ActivityIndicator size="large" style={{ marginVertical: 30 }} color={Colors.light.primary} />
      ) : (
        <PostGrid
          posts={posts}
          onPressPost={(post) => {
            if(subPage === "NEEDS_REVIEW") {
              handleNavigateToImageMarker(post);
            }
            else {
              router.push({
                pathname: "../authenticated/posts/viewposts",
                params: {
                  postID: post.postID.toString(),
                  tab: subPage,
                  userID: profileUser?.uuid,
                  header: subPage === "PUBLIC" ? "Posts" : subPage === "PRIVATE" ? "Drafts" : "Needs Review",
                },
              });
            }
          }}
        />
      )}
    </View>
  );
};

export default UserProfile;