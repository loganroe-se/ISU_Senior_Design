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
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); //Loading state


  const handleSignIn = async () => {
    if (!email || !password) {
      // Show an alert if any field is empty
      console.log("Incomplete fields");
      Alert.alert("Incomplete Fields", "Please fill in all the fields", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return; // Stop execution if fields are not filled
    }
    setIsLoading(true);
    try {
      const response = await fetch("https://api.dripdropco.com/users/signIn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        console.log("Login Successful");

        // Save email and username (assuming you get a username as part of the response)
        const responseData = await response.json();
        const username = responseData.username; // Adjust this based on actual response structure

        // Store email and username in AsyncStorage
        await AsyncStorage.setItem('email', email);
        await AsyncStorage.setItem('username', username);

        router.replace('/authenticated');
      } else {
        // Generic error handling for other status codes
        const errorData = await response.json();
        console.log("Error" + errorData.error);
        Alert.alert("Login Failed", errorData.error, [
          {
            text: "Try Again",
            onPress: () => console.log("Try again pressed"),
          },
        ]);
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log("Unexpected error");
        Alert.alert("Error", "An unexpected error occured", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoLogin = async () => {
    setEmail("test");
    setPassword("test");
  };
  const onGoToSignUp = async () => {
    console.log("User wants to create new account");
    router.replace("/auth/Signup");
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../../public/dripdrop_logo.png")} // Replace with the actual image path
        style={styles.logo}
      />
      <Text style={styles.header}>dripdrop</Text>

      {/* Input fields with state handling */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="grey"
        value={email}
        onChangeText={setEmail} // Update username state
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="grey"
        value={password}
        secureTextEntry
        onChangeText={setPassword} // Update password state
      />

      {/* Sign-up Button */}
      <Button title="Sign In" onPress={handleSignIn} />

      <TouchableOpacity onPress={onGoToSignUp}>
        <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAutoLogin}>
        <Text style={styles.signUpText}>Push to Auto Login as Test user</Text>
      </TouchableOpacity>

      {/* Loading Spinner */}
      {isLoading && (
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
    width: 100, // Adjust based on your image's dimensions
    height: 100, // Adjust based on your image's dimensions
    marginBottom: 10, // Space between the image and the text
    alignSelf: "center", // To center the image horizontally
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
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Optional: semi-transparent background to dim rest of the screen
    zIndex: 1, // Ensure it's above all other content
  },
});
