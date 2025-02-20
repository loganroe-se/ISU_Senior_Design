import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
interface SignUpProps {
  setIsSigningUp: (isSigningUp: boolean) => void;
  onSuccessfulSignUp: () => void; // New prop to indicate successful sign-up
}

const SignUpScreen: React.FC<SignUpProps> = ({ setIsSigningUp, onSuccessfulSignUp }) => {
  // Define state for each input field
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Function to handle the sign-up process
  const handleSignUp = async() => {
    // Check if any of the fields are empty
    if (!username || !email || !password || !confirmPassword) {
      // Show an alert if any field is empty
      Alert.alert("Incomplete Fields", "Please fill in all the fields", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return; // Stop execution if fields are not filled
    }
    if (password != confirmPassword) {
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
        onSuccessfulSignUp(); // Notify SignIn of successful sign-up
        Alert.alert("Success", "Account succesfully created", [
          { text: "OK", onPress: () => console.log("Ok pressed") },
        ]);
        setIsSigningUp(false);
      } else {
        if (response.status === 409) {
          // Handle the specific case of a duplicate entry
          Alert.alert("Error", "An account with this email or username already exists", [
            { text: "Try Again", onPress: () => console.log("Try again pressed") },
          ]);
          return; 
        } else {
          // Generic error handling for other status codes
          const errorData = await response.json();
          Alert.alert("Error", errorData.error, [
            { text: "Try Again", onPress: () => console.log("Try again pressed") },
          ]);
          return; 
        }
      }
    } catch (error) {
      if (error instanceof Error){
        Alert.alert("Error", "An unexpected error occured", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
        return; 
      }
  };
  };

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
    borderColor: "grey",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
    color: "black",
  },
  logo: {
    width: 100, // Adjust based on your image's dimensions
    height: 100, // Adjust based on your image's dimensions
    marginBottom: 10, // Space between the image and the text
    alignSelf: "center", // To center the image horizontally
  },
});

export default SignUpScreen;
