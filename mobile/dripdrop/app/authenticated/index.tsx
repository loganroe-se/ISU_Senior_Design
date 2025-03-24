import { Text, StyleSheet, View, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

const Page = () => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const user = await AsyncStorage.getItem("user");

        // Set them to state if they exist
        if (user) {
          setUser(user);
        } else {
          Alert.alert("No user data", "User is not logged in.");
        }
      } catch (error) {
        console.error("Error retrieving data", error);
        Alert.alert("Error", "Failed to load user data.");
      }
    };

    getUserData();
  }, []); // Empty array ensures this effect runs only once when the component mounts

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to the Home Page</Text>

      {/* Display the email and username */}
      {user ? (
        <View>
          <Text style={styles.text}>User Info: {user}</Text>
        </View>
      ) : (
        <Text style={styles.text}>Loading user data...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default Page;
