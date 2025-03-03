import React, { useEffect, useState } from "react";
import { View, FlatList, Image, TouchableOpacity } from "react-native";
import { Avatar, Text, Button } from "react-native-paper";
import { useUserContext } from "@/context/UserContext";
import { fetchUserPosts } from "@/api/post";
import { Post } from "@/types/types";
import { profileStyle } from "@/styles/profile";

const UserProfile = () => {
  const { user } = useUserContext();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const getUserPosts = async () => {
      if (user) {
        const p = await fetchUserPosts(user.id);
        setPosts(p);
      }
    };
    getUserPosts();
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
      <View style={profileStyle.profileContainer}>
        <View style={profileStyle.avatarContainer}>
          <Avatar.Image
            size={90}
            source={{ uri: `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}` }}
          />
        </View>
        <View style={profileStyle.userInfo}>
          <Text style={profileStyle.username}>{user.username}</Text>
          
          <View style={profileStyle.statsContainer}>
            <View style={profileStyle.stat}>
              <Text style={profileStyle.statNumber}>{posts.length}</Text>
              <Text style={profileStyle.statLabel}>Posts</Text>
            </View>
            <View style={profileStyle.stat}>
              <Text style={profileStyle.statNumber}>1.2K</Text>
              <Text style={profileStyle.statLabel}>Followers</Text>
            </View>
            <View style={profileStyle.stat}>
              <Text style={profileStyle.statNumber}>530</Text>
              <Text style={profileStyle.statLabel}>Following</Text>
            </View>
          </View>

          <Button 
            mode="outlined" 
            style={profileStyle.editButton}
            labelStyle={profileStyle.buttonLabel}
          >
            Edit Profile
          </Button>

          <Text style={profileStyle.bio}>{user.bio || "Digital goodies collector 🌈✨"}</Text>
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