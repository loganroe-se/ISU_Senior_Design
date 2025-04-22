import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useUserContext } from "@/context/UserContext";
import { styles } from "./_components/SettingStyles";

export default function SettingsScreen() {
  const { signOut } = useUserContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={20} color="#007AFF" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.replace("../authenticated/profile/edit")}>
        <Text style={styles.optionText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

