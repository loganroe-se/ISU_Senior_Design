import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Image, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons'
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
  const [confirmation_code, setconfirmation_code] = useState(""); // State for confirmation code
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false); // Modal for entering confirmation code

  // Timer states
  const [timeLeft, setTimeLeft] = useState(60); // Time left in seconds
  const [isExpired, setIsExpired] = useState(false); // Flag for expiration

  useEffect(() => {
    // Start the countdown timer when confirmation code modal is visible
    if (isConfirmationModalVisible && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1); // Decrease time left by 1 second
      }, 1000);

      // Cleanup the interval when timer ends or modal is closed
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsExpired(true); // Mark as expired when timer reaches 0
    }
  }, [timeLeft, isConfirmationModalVisible]);

  const handleSignUp = async () => {
    // Sign-up form validation
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Incomplete Fields", "Please fill in all the fields", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return;
    }

    // Email and password validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert("Password Requirements", 
        "Password must be at least 8 characters long and include:\n" +
        "• One uppercase letter\n" +
        "• One lowercase letter\n" +
        "• One number\n" +
        "• One special character (e.g., !, @, #, $, etc.)", [
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

    // Show the date picker
    setIsDatePickerVisible(true);
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
          Alert.alert("Success", "Account successfully created. A confirmation code has been sent to your email.", [
            { text: "OK", onPress: () => setIsConfirmationModalVisible(true) }, // Show confirmation code input modal
          ]);
        } else {
          const errorData = await response.json();
          Alert.alert("Error", errorData.error || "Unknown error occurred", [
            { text: "Try Again", onPress: () => console.log("Try again pressed") },
          ]);
        }
      } catch (error) {
        console.error("Error during signup:", error);
        Alert.alert("Error", "An unexpected error occurred: " + (error as { message: string }).message, [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
      }
      setIsLoading(false);
    } else {
      Alert.alert("Error", "You must be at least 13 years old to create an account.", [
        { text: "OK", onPress: () => console.log("OK pressed") },
      ]);
    }
  };

  const handleconfirmation_codeSubmit = async () => {
    if (!confirmation_code) {
      Alert.alert("Incomplete Code", "Please enter the confirmation code sent to your email", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const formattedBirthday = birthday.toISOString().split('T')[0]; // Re-format the birthday in case it's needed
      const response = await fetch('https://api.dripdropco.com/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, dob: formattedBirthday, confirmation_code }),
      });

      if (response.ok) {
        console.log("Confirmation successful");
        Alert.alert("Success", "Your account has been confirmed and activated.", [
          { text: "OK", onPress: () => router.replace("/auth/signin") }, // Navigate to the login page
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Unknown error occurred", [
          { text: "Try Again", onPress: () => console.log("Try again pressed") },
        ]);
      }
    } catch (error) {
      console.error("Error during confirmation:", error);
      Alert.alert("Error", "An unexpected error occurred: " + (error as { message: string }).message, [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    }
    setIsLoading(false);
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

      <View style={styles_signup.signUpText}>
        <Button title="Sign Up" onPress={handleSignUp} />
      </View>
      <TouchableOpacity onPress={onGoToSignIn}>
        <Text style={styles_signup.signInText}>Already have an account? Sign In</Text>
      </TouchableOpacity>

      {/* Birthday Selection Modal */}
      {isDatePickerVisible && <DateTimePicker
        style={styles_signup.datePicker}
        value={birthday}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          console.log(event.type, selectedDate);
          // Close the DateTimePicker if cancel is chosen
          if (event.type === "dismissed") {
            setIsDatePickerVisible(false);
            return;
          }

          const currentDate = selectedDate || birthday;
          setBirthday(currentDate); // Update state with selected date
          setIsDatePickerVisible(false);
          // Open the confirmation modal
          setModalVisible(true);
        }}
      />}

      {/* Birthday Confirmation Modal */}
      <Modal isVisible={isModalVisible}>
        <View style={styles_signup.modalContent}>
          <Text style={styles_signup.modalText}>Confirm Your Selected Birthday</Text>

          {/* Display current date */}
          <Text style={styles_signup.currentDate}>
            Selected: {birthday.toDateString()}
          </Text>

          <View style={styles_signup.confirmationButtons}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
            <Button title="Confirm" onPress={handleBirthdaySelect} />
          </View>
        </View>
      </Modal>

      {/* Confirmation Code Modal */}
      <Modal isVisible={isConfirmationModalVisible}>
        <View style={styles_signup.modalContent}>
          <Text style={styles_signup.modalText}>Enter Confirmation Code</Text>
          <TextInput
            style={styles_signup.input}
            placeholder="Confirmation Code"
            placeholderTextColor="grey"
            value={confirmation_code}
            onChangeText={setconfirmation_code}
          />
          <View style={styles_signup.confirmationButtons}>
            <Button title="Cancel" onPress={() => setIsConfirmationModalVisible(false)} />
            <Button title="Submit" onPress={handleconfirmation_codeSubmit} />
          </View>

          {/* Timer for Code Expiration */}
          {isConfirmationModalVisible && !isExpired && (
            <Text style={styles_signup.timerText}>
              Time until code expires: {timeLeft}s
            </Text>
          )}
          {isExpired && (
            <Text style={styles_signup.expiredText}>
              Code has expired. Please request a new one.
            </Text>
          )}
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
