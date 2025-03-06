import React, { useEffect, useState } from "react";
import { View, FlatList, Image, TouchableOpacity } from "react-native";
import { Avatar, Text, Button } from "react-native-paper";
import { useUserContext } from "@/context/UserContext";
import { fetchUserPosts } from "@/api/post";
import { fetchFollowers, fetchFollowing } from "@/api/following";
import { Follower, Following, Post } from "@/types/types";
import { profileStyle } from "@/styles/profile";
import { useLocalSearchParams } from "expo-router";

const UserProfile = () => {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { user } = useUserContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);

  let uid=0;

  useEffect(() => {
    const getUserData = async () => {
      uid=id == null ? user != null ? user.id : 0 : parseInt(id);

      if (user) {
        const p = await fetchUserPosts(uid);
        const f = await fetchFollowing(uid);
        const fs = await fetchFollowers(uid);

        setPosts(p);
        setFollowing(f);
        setFollowers(fs);
      }
    };

    getUserData();
  }, [user]);

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
              source={{ uri: `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}` }}
            />
          </View>
          <View>
            <View style={profileStyle.userHeader}>
              <Text style={profileStyle.username}>{user.username}</Text>
              
              <TouchableOpacity style={profileStyle.editButton}>
                <Text style={profileStyle.buttonLabel}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
            <View style={profileStyle.userDescription}>
              <Text style={profileStyle.bio}>{ "Digital goodies collector 🌈✨"}</Text> {/*Replce with the user's bio once implemente*/}
            </View>
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
      
      {/* Post Grid */}
      <FlatList
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
    </View>
  );
};

export default UserProfile;