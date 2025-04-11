import React, { useEffect, useState } from "react";
import { Modal, View, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Avatar, Text, Button } from "react-native-paper";
import { useUserContext } from "@/context/UserContext";
import { fetchUserPosts } from "@/api/post";
import { fetchFollowers, fetchFollowing, fetchUserByUsername, followUser } from "@/api/following";
import { Follower, Following } from "@/types/Following";
import { Post } from "@/types/post";
import { profileStyle } from "@/styles/profile";
import { router, useLocalSearchParams } from "expo-router";
import { fetchUserById } from "@/api/user";
import { User, ProfileUser } from "@/types/user.interface";
import { Camera } from "expo-camera"; // For camera functionality
import * as MediaLibrary from "expo-media-library";

const UserProfile = () => {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { user, signOut } = useUserContext();

  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [subPage, setSubPage] = useState("PUBLIC");
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [followModalVisible, setFollowModalVisible] = useState(false);
  const [followModalType, setFollowModalType] = useState('Followers');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // Fetch photos from the media library
  const selectImage = () => {
    const fetchPhotos = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access media library is required!");
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        first: 40,
        mediaType: MediaLibrary.MediaType.photo,
      });

      const assetsWithFileUris = await Promise.all(
        media.assets.map(async (asset) => {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
          return { ...asset, uri: assetInfo.localUri || asset.uri };
        })
      );

      setPhotos(assetsWithFileUris);
    };

    fetchPhotos();
  };

  // Handle image selection from the gallery
  const handleImageSelect = async (selectedImage: MediaLibrary.Asset) => {
    const assetInfo = await MediaLibrary.getAssetInfoAsync(selectedImage.id);
    setSelectedImageUri(assetInfo.localUri || selectedImage.uri);
    setModalVisible(true); // Open the modal for gallery images
  };

  const getUserPosts = async (id: string) => {
    try {
      const p = await fetchUserPosts(id,subPage);
      setPosts(p);
    }
    catch {

    }
  }

  const redirectToUser = async (username: string) => {
    const fetchUser = async() => {
      let user = await fetchUserByUsername(username);

      if(user != null) {
        console.log(user);
        router.replace(`/authenticated/profile?id=${user.uuid}` as any);
      }
    }

    fetchUser();
  }

  useEffect(() => {
    const getUserData = async () => {
      try {
        let uid = id == null ? user != null ? user.id.toString() : -1 : id;
        if(user != null && user.id != null){
          uid = uid.toString();
          let userAwait = await fetchUserById(uid);
          if(userAwait != null) {
            setProfileUser(userAwait);
          }
          const f = await fetchFollowing(uid);
          const fs = await fetchFollowers(uid);
          setFollowing(f);
          setFollowers(fs);
          let userFollower: Following = {
            userID: user.id,
            username: user.username.toString(),
            email: user.email.toString()
          }

          if(fs.includes(userFollower)) {
            setIsFollowing(true);
          }


          getUserPosts(uid.toString());

        }
      }
      catch {
        //signOut();
      }
    };

    getUserData();
  }, [user]);

  useEffect(() => {
    if(profileUser) {
      getUserPosts(profileUser.id.toString());
    }
  }, [subPage])

  const actionPress = async() => {
    if(user?.id === profileUser?.id) {
      router.replace(`/authenticated/profile/edit` as any);
    }
    else {
      if(!isFollowing && user != null && profileUser != null) {
        console.log(user.id, profileUser.id);
        await followUser(user.id,profileUser.id);

        setIsFollowing(true);
      }
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
                <Text style={profileStyle.buttonLabel}>{user.username === profileUser?.username ? "Edit Profile" : !isFollowing ? "Follow" : "Following"}</Text>
              </TouchableOpacity>

                <TouchableOpacity
                  onPress={signOut} // Call the signOut function from context
                  style={[profileStyle.actionButton, profileStyle.signOutButton, {marginLeft: 8}]}
                >
                  <Text style={profileStyle.buttonLabel}>Sign out</Text>
                </TouchableOpacity>
              
            </View>

          </View>
        </View>

        <View style={profileStyle.statsContainer}>
          <View style={profileStyle.stat}>
            <Text style={profileStyle.statNumber}>{posts.length}</Text>
            <Text style={profileStyle.statLabel}>Posts</Text>
          </View>
          <TouchableOpacity onPress={() => {setFollowModalVisible(true); setFollowModalType("Followers")}}>
            <View style={profileStyle.stat}>
              <Text style={profileStyle.statNumber}>{followers.length}</Text>
              <Text style={profileStyle.statLabel}>Followers</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {setFollowModalVisible(true); setFollowModalType("Following")}}>
            <View style={profileStyle.stat}>
              <Text style={profileStyle.statNumber}>{following.length}</Text>
              <Text style={profileStyle.statLabel}>Following</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {
        user.username === profileUser?.username &&
        <View style={profileStyle.subpageContainer}>
          <TouchableOpacity onPress={() => {setSubPage("PUBLIC")}}>
            <Text style={subPage === "PUBLIC" ? profileStyle.subpagePickerTextSelected : profileStyle.subpagePickerText}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {setSubPage("PRIVATE")}}>
            <Text style={subPage === "PRIVATE" ? profileStyle.subpagePickerTextSelected : profileStyle.subpagePickerText}>Drafts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {setSubPage("REVIEW")}}>
            <Text style={subPage === "REVIEW" ? profileStyle.subpagePickerTextSelected : profileStyle.subpagePickerText}>Review</Text>
          </TouchableOpacity>
        </View>
      }
      
      {
        subPage === "PUBLIC" && posts.length > 0 ? <FlatList
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
        : subPage === "PRIVATE" && posts.length > 0 ?
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
      <Modal
        transparent={true}
        visible={followModalVisible}
        onRequestClose={() => setFollowModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: "space-between", alignItems: 'center'}}>
              <Text style={{color: 'black', fontWeight: 'bold'}}>{followModalType}</Text>
              <Button onPress={() => setFollowModalVisible(false)}><Text style={{color: 'black'}}>x</Text></Button>
            </View>
            {
              followModalType == "Followers" ? followers.map((follower) => 
                <TouchableOpacity key={follower.userID} onPress={() => {redirectToUser(follower.username)}}>
                  <Text style={{color: 'black'}}>{follower.username}</Text>
                </TouchableOpacity>
              )
              :
              following.map((following) => 
                <TouchableOpacity key={following.userID} onPress={() => {redirectToUser(following.username)}}>
                  <Text style={{color: 'black'}}>{following.username}</Text>
                </TouchableOpacity>
              )
            }
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    elevation: 5,
    width: '80%',
  },
});

export default UserProfile;