import React, { useEffect, useState } from "react";
import { View, FlatList, Image, TouchableOpacity } from "react-native";
import { Avatar, Text, Button } from "react-native-paper";
import { useUserContext } from "@/context/UserContext";
import { fetchUserPosts } from "@/api/post";
import { fetchFollowers, fetchFollowing, fetchUserByUsername } from "@/api/following";
import { Follower, Following } from "@/types/Following";
import { Post } from "@/types/post";
import { profileStyle } from "@/styles/profile";
import { router, useLocalSearchParams } from "expo-router";
import { fetchUserById } from "@/api/user";
import { User } from "@/types/user.interface";

const UserProfile = () => {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { user, signOut } = useUserContext();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [privatePosts, setPrivatePosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [subPage, setSubPage] = useState("posts");


  useEffect(() => {
    const getUserData = async () => {
      uid = id == null ? user != null ? user.id : 0 : parseInt(id);

      setProfileUser(await fetchUserById(uid));

      const p = await fetchUserPosts(uid);
      const f = await fetchFollowing(uid);
      const fs = await fetchFollowers(uid);

      setPosts(p);
      setFollowing(f);
      setFollowers(fs);

      setPosts(posts.filter(post => post.status == "PUBLIC"));
      setPrivatePosts(posts.filter(post => post.status == "PRIVATE"));
    };

    getUserData();
  }, [user]);

  const actionPress = async() => {
    if(user?.id === profileUser?.id) {
      router.replace(`/authenticated/profile/edit` as any);
    }
  }

  if (!user) {
    return (
      <View style={profileStyle.container}>
        <Text variant="titleLarge">User not signed in</Text>
      </View>
    );
  }

  return (
    <View style={profileStyle.container}>
      {/* Profile Header */}
      <View>
        <View style={profileStyle.profileContainer}>
          <View style={profileStyle.avatarContainer}>
            <Avatar.Image
              size={90}
              source={{ uri: `https://cdn.dripdropco.com/${profileUser?.profilePic}?format=png` }}
            />
          </View>
          <View>
            <View style={profileStyle.userHeader}>
              <Text style={profileStyle.username}>{profileUser?.username}</Text>
            </View>
            <View style={profileStyle.userDescription}>
              <Text style={profileStyle.bio}>{"Digital goodies collector 🌈✨"}</Text> {/*Replce with the user's bio once implemente*/}
            </View>
            <TouchableOpacity style={profileStyle.actionButton} onPress={actionPress}>
              <Text style={profileStyle.buttonLabel}>{user.id === profileUser?.id ? "Edit Profile" : "Follow"}</Text>
            </TouchableOpacity>
              <TouchableOpacity
                onPress={signOut} // Call the signOut function from context
              style={[profileStyle.actionButton, profileStyle.signOutButton]}
              >
                <Text style={profileStyle.buttonLabel}>Sign out</Text>
              </TouchableOpacity>

          </View>
        </View>

        <View style={profileStyle.statsContainer}>
          <View style={profileStyle.stat}>
            <Text style={profileStyle.statNumber}>{posts.length}</Text>
            <Text style={profileStyle.statLabel}>Posts</Text>
          </View>
          <View style={profileStyle.stat}>
            <Text style={profileStyle.statNumber}>{followers.length}</Text>
            <Text style={profileStyle.statLabel}>Followers</Text>
          </View>
          <View style={profileStyle.stat}>
            <Text style={profileStyle.statNumber}>{following.length}</Text>
            <Text style={profileStyle.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      {
        user.id === profileUser?.id &&
        <View style={profileStyle.subpageContainer}>
          <TouchableOpacity onPress={() => {setSubPage("posts")}}>
            <Text style={subPage === "posts" ? profileStyle.subpagePickerTextSelected : profileStyle.subpagePickerText}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {setSubPage("private")}}>
            <Text style={subPage !== "posts" ? profileStyle.subpagePickerTextSelected : profileStyle.subpagePickerText}>Drafts</Text>
          </TouchableOpacity>
        </View>
      }
      
      {
        subPage === "posts" ? <FlatList
          data={posts}
          keyExtractor={(item: Post) => item.postID.toString()}
          numColumns={3}
          contentContainerStyle={profileStyle.gridContainer}
          renderItem={({ item }) => (
            <TouchableOpacity style={profileStyle.postContainer}>
              <Image
                source={{ uri: `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png` }}
                style={profileStyle.postImage}
              />
            </TouchableOpacity>
          )}
        />
        :
        <FlatList
          data={privatePosts}
          keyExtractor={(item: Post) => item.postID.toString()}
          numColumns={3}
          contentContainerStyle={profileStyle.gridContainer}
          renderItem={({ item }) => (
            <TouchableOpacity style={profileStyle.postContainer}>
              <Image
                source={{ uri: `https://cdn.dripdropco.com/${item.images[0].imageURL}?format=png` }}
                style={profileStyle.postImage}
              />
            </TouchableOpacity>
          )}
        />
      }
    </View>
  );
};

export default UserProfile;