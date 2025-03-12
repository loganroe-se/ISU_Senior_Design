import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { styles_signin } from "@/styles/auth";

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
    <View style={styles_signin.container}>
      <Image
        source={require("@/assets/images/dripdrop_logo.png")}
        style={styles_signin.logo}
      />
      <Text style={styles_signin.header}>dripdrop</Text>

      <TextInput
        style={styles_signin.input}
        placeholder="Email"
        placeholderTextColor="grey"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles_signin.input}
        placeholder="Password"
        placeholderTextColor="grey"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <Button title="Sign In" onPress={handleSignIn} disabled={loading} />

      <TouchableOpacity onPress={onGoToSignUp}>
        <Text style={styles_signin.signUpText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAutoLogin}>
        <Text style={styles_signin.signUpText}>Push to Auto Login as Test user</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles_signin.loadingContainer}>
          <ActivityIndicator size="large" color="#5271ff" />
        </View>
      )}
    </View>
  );
}

