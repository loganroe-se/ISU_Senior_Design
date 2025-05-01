import { deleteUser, fetchUserById, updateUser } from "@/api/user";
import { useUserContext } from "@/context/UserContext";
import { User, BasicUserData } from "@/types/user.interface";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { editStyle } from "./_components/editStyle";

const UserEditProfile = () => {
  const { user, signOut } = useUserContext();
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [newProfilePic, setNewProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [initialValues, setInitialValues] = useState({
    username: "",
    email: "",
    profilePic: "",
  });

  useEffect(() => {
    if (user?.uuid) {
      const getUser = async () => {
        const data = await fetchUserById(user.uuid);
        setProfileUser(data);
        setNewUsername(data?.username || "");
        setNewEmail(data?.email || "");
        setInitialValues({
          username: data?.username || "",
          email: data?.email || "",
          profilePic: data?.profilePic || "",
        });
      };
      getUser();
    }
  }, [user]);

  const handleChangePic = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64 = result.assets[0].base64;
      setNewProfilePic(`data:image/jpeg;base64,${base64}`);
    }
  };

  const saveProfile = async () => {
    if (!profileUser) return;

    const updatedUser: BasicUserData = {
      uuid: profileUser.uuid,
      email: newEmail || profileUser.email,
      username: newUsername || profileUser.username,
      profilePic: newProfilePic ? newProfilePic.split(",")[1] : "",
    };

    try {
      setLoading(true);
      await updateUser(updatedUser);
      Alert.alert("Success", "Profile updated");
      router.replace("../profile");
    } catch (error: any) {
      let errorMsg = "Failed to update profile";

      if (
        error?.response?.status === 409 ||
        error?.message?.includes("Username already exists")
      ) {
        errorMsg = "That username is already taken. Please try another.";
      }

      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };



  const isSaveDisabled =
    newUsername === initialValues.username &&
    newEmail === initialValues.email &&
    newProfilePic === null;

  return (
    <SafeAreaView style={editStyle.screen}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={editStyle.title}>Profile Settings</Text>

        <View style={editStyle.formContainer}>
          <View style={editStyle.profilePicWrapper}>
            <Image
              source={{
                uri:
                  newProfilePic ||
                  `https://cdn.dripdropco.com/${profileUser?.profilePic}?format=png`,
              }}
              style={editStyle.profilePic}
            />
            <TouchableOpacity
              style={editStyle.changePicButton}
              onPress={handleChangePic}
            >
              <Text style={editStyle.changePicText}>Change Profile Picture</Text>
            </TouchableOpacity>
          </View>

          <View style={editStyle.inputGroup}>
            <Text style={editStyle.label}>Username</Text>
            <TextInput
              placeholder="Username"
              value={newUsername}
              onChangeText={setNewUsername}
              style={editStyle.input}
            />
          </View>

          <View style={editStyle.inputGroup}>
            <Text style={editStyle.label}>Email</Text>
            <TextInput
              placeholder="Email"
              value={newEmail}
              onChangeText={setNewEmail}
              style={editStyle.input}
            />
          </View>

          <View style={editStyle.inputGroup}>
            <Text style={editStyle.label}>Password</Text>
            <TextInput
              placeholder="New password (optional)"
              secureTextEntry
              style={editStyle.input}
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <TouchableOpacity
            style={[
              editStyle.saveButton,
              isSaveDisabled && { opacity: 0.5 },
            ]}
            onPress={saveProfile}
            disabled={isSaveDisabled || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 12 }}
          >
            <Text style={{ color: "#007AFF", fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserEditProfile;
