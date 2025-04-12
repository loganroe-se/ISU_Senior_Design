import { deleteUser, fetchUserById, updateUser } from "@/api/user";
import { useUserContext } from "@/context/UserContext";
import { User, NewUser } from "@/types/user.interface";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserEditProfile = () => {
    const { user, signOut } = useUserContext();
    const [newUsername, setNewUsername] = useState("");
    const [newEmail, setNewEmail] = useState("");

    const [profileUser, setProfileUser] = useState<User | null>(null);


    let newUser: NewUser = {
        uuid: "",
        email: "",
        username: "",
        profilePic: "",
    };

    if (user != null) {

        let uid = user?.uuid;
        useEffect(() => {
            const getUser = async () => {
                setProfileUser(await fetchUserById(uid));
            };

            getUser();
        }, [user]);
    }

    console.log(profileUser);

    const saveProfile = async () => {
        if (profileUser) {
            newUser = profileUser;
            newUser.username = newUsername;
            newUser.email = newEmail;

            await updateUser(newUser).then((response) => {
                signOut;
                router.replace(`/authenticated/profile` as any);
            });
        } else {
            router.replace(`/authenticated/profile` as any);
        }
    };

    const deleteProfile = async () => {
        if (profileUser) {
            await deleteUser(profileUser.uuid).then((response) => {
                router.replace(`/authenticated/profile` as any);
            });
        } else {
            router.replace(`/authenticated/profile` as any);
        }
    };

    return (
        <SafeAreaView style={{ height: "100%" }}>
            <Text
                style={{
                    textAlign: "center",
                    marginTop: 24,
                    fontWeight: "bold",
                    fontSize: 16,
                }}
            >
                Profile Settings
            </Text>
            <TouchableOpacity
                style={{ position: "absolute", top: 24, right: 24 }}
                onPress={saveProfile}
            >
                <Text style={{ color: "#0073FF", fontSize: 16 }}>Save</Text>
            </TouchableOpacity>
            <View style={{ display: "flex", alignItems: "center" }}>
                <View style={editStyle.inputGroup}>
                    <Text>Username</Text>
                    <View style={editStyle.input}>
                        <TextInput
                            placeholder={profileUser?.username}
                            value={newUsername}
                            onChangeText={setNewUsername}
                        />
                    </View>
                </View>
                <View style={editStyle.inputGroup}>
                    <Text>Email</Text>
                    <View style={editStyle.input}>
                        <TextInput
                            placeholder={profileUser?.email}
                            value={newEmail}
                            onChangeText={setNewEmail}
                        />
                    </View>
                </View>
                <View style={editStyle.inputGroup}>
                    <Text>Change Password</Text>
                    <View style={editStyle.input}>
                        <Text>************</Text>
                    </View>
                </View>
            </View>
            <View
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    width: "100%",
                    bottom: 24,
                }}
            >
                <TouchableOpacity
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 36,
                        backgroundColor: "#FF3535",
                        width: 250,
                        height: 50,
                    }}
                >
                    <Text style={{ color: "white" }}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const editStyle = StyleSheet.create({
    inputGroup: {
        width: "90%",
        marginVertical: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#BABABA",
        borderRadius: 4,
        backgroundColor: "#E5E5E5",
        padding: 8,
        marginTop: 4,
    },
});

export default UserEditProfile;
