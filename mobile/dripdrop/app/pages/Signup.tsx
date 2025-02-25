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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";

const SignUpScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      console.log("Incomplete fields");
      Alert.alert("Incomplete Fields", "Please fill in all the fields", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return;
    }
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      Alert.alert("Invalid Input", "Passwords do not match", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return;
    }

    try {
      const response = await fetch("https://api.dripdropco.com/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        console.log("Sign up successful");
        Alert.alert("Success", "Account successfully created", [
          { text: "OK", onPress: () => console.log("Ok pressed") },
        ]);
        router.push("/pages/Login");
      } else {
        if (response.status === 409) {
          console.log("409 error: account already exists");
          Alert.alert(
            "Error",
            "An account with this email or username already exists",
            [{ text: "Try Again", onPress: () => console.log("Try again pressed") }]
          );
        } else {
          const errorData = await response.json();
          console.log("Error" + errorData.error);
          Alert.alert("Error", errorData.error, [
            { text: "Try Again", onPress: () => console.log("Try again pressed") },
          ]);
        }
      }
    } catch (error) {
      console.log("Unexpected error");
      Alert.alert("Error", "An unexpected error occurred", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    }
  };

  const onGoToSignIn = () => {
    console.log("User already has an account, go to login page");
    router.push("/pages/Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Image source={require("../../public/dripdrop_logo.png")} style={styles.logo} />
            <Text style={styles.header}>dripdrop</Text>

            <TextInput style={styles.input} placeholder="Username" placeholderTextColor="grey" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="grey" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="grey" value={password} secureTextEntry onChangeText={setPassword} />
            <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="grey" value={confirmPassword} secureTextEntry onChangeText={setConfirmPassword} />

            <Button title="Sign Up" onPress={handleSignUp} />

            <TouchableOpacity onPress={onGoToSignIn}>
              <Text style={styles.signInText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  signInText: {
    color: "blue",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});

export default SignUpScreen;
