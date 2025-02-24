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
} from "react-native";
import { useRouter } from 'expo-router';

const SignUpScreen = () => {
  // Define state for each input field
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Function to handle the sign-up process
  const handleSignUp = async() => {
    // Check if any of the fields are empty
    if (!username || !email || !password || !confirmPassword) {
      // Show an alert if any field is empty
      console.log("Incomplete fields");
      Alert.alert("Incomplete Fields", "Please fill in all the fields", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return; // Stop execution if fields are not filled
    }
    if (password != confirmPassword) {
      console.log("Passwords do not match");
      Alert.alert("Invalid Input", "Passwords do not match", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return; // Stop execution if fields are not filled
    }

    try {
      const response = await fetch('https://api.dripdropco.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        console.log("Sign up successful");
        Alert.alert("Success", "Account succesfully created", [
          { text: "OK", onPress: () => console.log("Ok pressed") },
        ]);
        router.push("/pages/Login");
      } else {
        if (response.status === 409) {
          console.log("409 error: account already exists");
          // Handle the specific case of a duplicate entry
          Alert.alert("Error", "An account with this email or username already exists", [
            { text: "Try Again", onPress: () => console.log("Try again pressed") },
          ]);
          return; 
        } else {
          // Generic error handling for other status codes
          const errorData = await response.json();
          console.log("Error" + errorData.error);
          Alert.alert("Error", errorData.error, [
            { text: "Try Again", onPress: () => console.log("Try again pressed") },
          ]);
          return; 
        }
      }
    } catch (error) {
      if (error instanceof Error){
        console.log("Unexpected error");
        Alert.alert("Error", "An unexpected error occured", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
        return; 
      }
  };
  };
  const onGoToSignIn = async() => {
    console.log("User already has account, go to login page");
    router.push('/pages/Login');
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
        placeholder="Username" 
        placeholderTextColor="grey"
        value={username}
        onChangeText={setUsername} // Update username state
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="grey"
        value={email}
        onChangeText={setEmail} // Update email state
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="grey"
        value={password}
        secureTextEntry
        onChangeText={setPassword} // Update password state
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="grey"
        value={confirmPassword}
        secureTextEntry
        onChangeText={setConfirmPassword} // Update confirmPassword state
      />

      {/* Sign-up Button */}
      <Button title="Sign Up" onPress={handleSignUp} />


      {/* Clickable Text for Existing Users */}
      <TouchableOpacity onPress={onGoToSignIn}>
        <Text style={styles.signInText}>Already have an account? Sign In</Text>
      </TouchableOpacity>

    </View>
  );
};

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
    width: 100, // Adjust based on your image's dimensions
    height: 100, // Adjust based on your image's dimensions
    marginBottom: 10, // Space between the image and the text
    alignSelf: "center", // To center the image horizontally
  },
  signInText: {
    color: "blue",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  }
});

export default SignUpScreen;
