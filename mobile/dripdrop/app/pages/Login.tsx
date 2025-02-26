import React, { useState } from "react";
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  ActivityIndicator
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
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

      setLoading(false); // Set loading to false after the API call finishes

      if (response.ok) {
        console.log("Login Successful");

         // Save email and username (assuming you get a username as part of the response)
         const responseData = await response.json(); 
         const username = responseData.username; // Adjust this based on actual response structure
 
         // Store email and username in AsyncStorage
         await AsyncStorage.setItem('email', email);
         await AsyncStorage.setItem('username', username);

        router.push('/pages/Home');
      } else {
        const errorData = await response.json();
        Alert.alert("Login Failed", errorData.error);
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
