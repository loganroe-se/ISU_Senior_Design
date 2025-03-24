import { router } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const saveProfile = () => {
    router.replace(`/authenticated/profile` as any);
}

const UserEditProfile = () => {
    return(
        <SafeAreaView style={{height: "100%"}}>
            <Text style={{textAlign: "center", marginTop: 24, fontWeight: "bold", fontSize: 16}}>Profile Settings</Text>
            <TouchableOpacity style={{position: "absolute", top: 24, right: 24}} onPress={saveProfile}>
                <Text style={{color: "#0073FF", fontSize: 16}}>Save</Text>
            </TouchableOpacity>
            <View style={{display: "flex", alignItems: "center"}}>
                <View style={editStyle.inputGroup}>
                    <Text>Username</Text>
                    <View style={editStyle.input}>
                        <Text>BobertBoy123</Text>
                    </View>
                </View>
                <View style={editStyle.inputGroup}>
                    <Text>Change Password</Text>
                    <View style={editStyle.input}>
                        <Text>************</Text>
                    </View>
                </View>
            </View>
            <View style={{display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", width: "100%", bottom: 24}}>
                <TouchableOpacity style={{display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 36, backgroundColor: "#FF3535", width: 250, height: 50}}>
                    <Text style={{color: "white"}}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const editStyle = StyleSheet.create({
    inputGroup: {
        width: "90%",
        marginVertical: 8
    },
    input: {
        borderWidth: 1,
        borderColor: "#BABABA",
        borderRadius: 4,
        backgroundColor: "#E5E5E5",
        padding: 8,
        marginTop: 4
    }
});

export default UserEditProfile;