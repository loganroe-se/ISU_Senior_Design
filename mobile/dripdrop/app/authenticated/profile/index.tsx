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
import { launchImageLibrary } from 'react-native-image-picker';

const UserProfile = () => {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { user, signOut } = useUserContext();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [subPage, setSubPage] = useState("posts");

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        let profile = profileUser;
        if(profile && response.assets) {
          console.log(response.assets[0].uri);
          //profile.profilePic = response.assets?[0];
        }
      }
    });
  };

  let uid = -1;

  useEffect(() => {
    const getUserData = async () => {
      uid = id == null ? user != null ? user.id : -1 : parseInt(id);

      if(uid != -1) {
        let userAwait = await fetchUserById(uid);

        if(userAwait != null) {
          setProfileUser(userAwait);
        }

        const f = await fetchFollowing(uid);
        const fs = await fetchFollowers(uid);
        //const p = await fetchUserPosts(uid);

        setFollowing(f);
        setFollowers(fs);
        //setPosts(p);
      }
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
            <TouchableOpacity onPress={selectImage}>
              <Avatar.Image
                size={90}
                source={{ uri: `https://cdn.dripdropco.com/${profileUser?.profilePic}?format=png` }}
              />
            </TouchableOpacity>
          </View>
          <View style={{marginLeft: 8}}>
            <View style={profileStyle.userHeader}>
              <Text style={profileStyle.username}>{profileUser?.username}</Text>
            </View>
            <View style={{display: "flex", flexDirection: "row"}}>
              <TouchableOpacity style={profileStyle.actionButton} onPress={actionPress}>
                <Text style={profileStyle.buttonLabel}>{user.id === profileUser?.id ? "Edit Profile" : "Follow"}</Text>
              </TouchableOpacity>

              {user.id === profileUser?.id &&
                <TouchableOpacity
                  onPress={signOut} // Call the signOut function from context
                  style={[profileStyle.actionButton, profileStyle.signOutButton, {marginLeft: 8}]}
                >
                  <Text style={profileStyle.buttonLabel}>Sign out</Text>
                </TouchableOpacity>
              }
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

      {
        user.id === profileUser?.id &&
        <View style={profileStyle.subpageContainer}>
          <TouchableOpacity onPress={() => {setSubPage("posts")}}>
            <Text style={subPage === "posts" ? profileStyle.subpagePickerTextSelected : profileStyle.subpagePickerText}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {setSubPage("private")}}>
            <Text style={subPage === "private" ? profileStyle.subpagePickerTextSelected : profileStyle.subpagePickerText}>Drafts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {setSubPage("review")}}>
            <Text style={subPage === "review" ? profileStyle.subpagePickerTextSelected : profileStyle.subpagePickerText}>Review</Text>
          </TouchableOpacity>
        </View>
      }
      
      {
        subPage === "posts" && posts.length > 0 ? <FlatList
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
        : subPage === "private" && posts.length > 0 ?
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
        :
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
      }
    </View>
  );
};

export default UserProfile;