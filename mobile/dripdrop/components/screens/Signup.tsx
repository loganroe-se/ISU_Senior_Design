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

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const showAlert = () => {
    Alert.alert("Alert Title", "My Alert Msg", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../public/dripdrop_logo.png")} // Replace with the actual image path
        style={styles.logo}
      />
      <Text style={styles.header}>dripdrop</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="grey"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="grey"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="grey"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="grey"
      />
      <Button title="Sign Up" onPress={showAlert}></Button>
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
  button: {
    marginBottom: 20,
    backgroundColor: "#5271ff",
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 4 }, // iOS shadow
    shadowOpacity: 0.3, // iOS shadow
    shadowRadius: 6, // iOS shadow
  },
  logo: {
    width: 100, // Adjust based on your image's dimensions
    height: 100, // Adjust based on your image's dimensions
    marginBottom: 10, // Space between the image and the text
    alignSelf: "center", // To center the image horizontally
  },
});

export default SignUpScreen;
