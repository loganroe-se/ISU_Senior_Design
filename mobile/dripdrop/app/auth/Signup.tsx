import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles_signup } from "@/styles/auth";

const SignUpScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthday, setBirthday] = useState(new Date()); // Store birthday as Date object
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); //Loading state

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Incomplete Fields", "Please fill in all the fields", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Invalid Input", "Passwords do not match", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return;
    }

    setModalVisible(true); // Show the modal to select birthday
  };

  const handleBirthdaySelect = async () => {
    const formattedBirthday = birthday.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'

    const birthDate = new Date(formattedBirthday);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const monthDifference = new Date().getMonth() - birthDate.getMonth();

    if (age > 13 || (age === 13 && monthDifference >= 0)) {
      setModalVisible(false);
      setIsLoading(true);
      try {
        const response = await fetch('https://api.dripdropco.com/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, dob: formattedBirthday }),
        });

        if (response.ok) {
          console.log("Sign up successful");
          Alert.alert("Success", "Account successfully created", [
            { text: "OK", onPress: () => console.log("Ok pressed") },
          ]);
          router.replace("/auth/signin"); // Navigate to the login page
        } else {
          const errorData = await response.json();
          Alert.alert("Error", errorData.error, [
            { text: "Try Again", onPress: () => console.log("Try again pressed") },
          ]);
        }
      } catch (error) {
        Alert.alert("Error", "An unexpected error occurred", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
      }
      setIsLoading(false);

    } else {
      Alert.alert("Age Restriction", "Must be 13 years or older to use this application", [
        { text: "OK", onPress: () => setModalVisible(false) },
      ]);
    }
  };

  const onGoToSignIn = () => {
    console.log("User already has an account, go to login page");
    router.replace("/auth/signin");
  };

  return (
    <View style={styles_signup.container}>
      <Image source={require("@/assets/images/dripdrop_logo.png")} style={styles_signup.logo} />
      <Text style={styles_signup.header}>dripdrop</Text>

      <TextInput style={styles_signup.input} placeholder="Username" placeholderTextColor="grey" value={username} onChangeText={setUsername} />
      <TextInput style={styles_signup.input} placeholder="Email" placeholderTextColor="grey" value={email} onChangeText={setEmail} />
      <TextInput style={styles_signup.input} placeholder="Password" placeholderTextColor="grey" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles_signup.input} placeholder="Confirm Password" placeholderTextColor="grey" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <Button title="Sign Up" onPress={handleSignUp} />
      <TouchableOpacity onPress={onGoToSignIn}>
        <Text style={styles_signup.signInText}>Already have an account? Sign In</Text>
      </TouchableOpacity>

      <Modal isVisible={isModalVisible}>
        <View style={styles_signup.modalContent}>
          <Text style={styles_signup.modalText}>Select Your Birthday</Text>
          <DateTimePicker
            style={styles_signup.datePicker}
            value={birthday}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || birthday;
              setBirthday(currentDate); // Update state with selected date
            }}
          />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
          <Button title="Confirm" onPress={handleBirthdaySelect} />
        </View>
      </Modal>
      {/* Loading Spinner */}
      {isLoading && (
        <View style={styles_signup.loadingContainer}>
          <ActivityIndicator size="large" color="#5271ff" />
        </View>
      )}
    </View>
  );
};

export default SignUpScreen;
