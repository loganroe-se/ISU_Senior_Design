import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";

export default function Login() {
  const router = useRouter();
  const { signIn, loading } = useUserContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Incomplete Fields", "Please fill in all the fields");
      return;
    }
    try {
      await signIn(email, password);
      router.replace("/authenticated");
    } catch (error) {
      Alert.alert("Login Failed", "Invalid email or password");
    }
  };

  const handleAutoLogin = () => {
    setEmail("test");
    setPassword("test");
  };

  const onGoToSignUp = () => {
    router.replace("/auth/signup");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/dripdrop_logo.png")}
        style={styles.logo}
      />
      <Text style={styles.header}>dripdrop</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="grey"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="grey"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <Button title="Sign In" onPress={handleSignIn} disabled={loading} />

      <TouchableOpacity onPress={onGoToSignUp}>
        <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAutoLogin}>
        <Text style={styles.signUpText}>Push to Auto Login as Test user</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5271ff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#5271ff",
  },
  input: {
    height: 40,
    width: 300,
    borderColor: "grey",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
    color: "black",
    alignSelf: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    alignSelf: "center",
  },
  signUpText: {
    color: "blue",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 1,
  },
});