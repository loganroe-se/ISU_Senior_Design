import React, { useState } from "react";
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Incomplete Fields", "Please fill in all the fields");
      return;
    }

    setLoading(true); // Set loading to true before API call

    try {
      const response = await fetch("https://api.dripdropco.com/users/signIn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      setLoading(false); // Set loading to false after the API call finishes

      if (response.ok) {
        console.log("Login Successful");
        router.push("/pages/Home");
      } else {
        const errorData = await response.json();
        Alert.alert("Login Failed", errorData.error);
      }
    } catch (error) {
      setLoading(false); // Set loading to false if there's an error
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const handleAutoLogin = async () => {
    setEmail("test");
    setPassword("test");
    await handleSignIn();
  };

  const onGoToSignUp = () => {
    router.push("/pages/Signup");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <Image
              source={require("../../public/dripdrop_logo.png")}
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

            {/* Show loading indicator when API is being called */}
            {loading ? (
              <ActivityIndicator size="large" color="#5271ff" style={styles.loadingIndicator} />
            ) : (
              <Button title="Sign In" onPress={handleSignIn} disabled={loading} />
            )}

            <TouchableOpacity onPress={onGoToSignUp}>
              <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAutoLogin}>
              <Text style={styles.signUpText}>Push to Auto Login as Test user</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  scrollView: {
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
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
    width: "80%",
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
  loadingIndicator: {
    marginBottom: 20, // Add spacing between the loader and buttons
  },
});
