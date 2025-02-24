import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]); // Store the fetched users
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]); // Store the filtered users

  // Fetch users from the API when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://api.dripdropco.com/users");
        const data = await response.json();
        setUsers(data); // Assuming the API returns an array of users
      } catch (error) {
        console.error("Error fetching users:", error);
        Alert.alert("Error", "Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  // Update filtered users as the search query changes
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredUsers([]);
    } else {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Handle user selection (optional)
  const handleUserPress = (username: string) => {
    Alert.alert("User Selected", `You selected ${username}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search Users</Text>

      {/* Search bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a username"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Display filtered results */}
      {filteredUsers.length > 0 ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()} // Assuming each user has a unique 'id'
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleUserPress(item.username)}>
              <Text style={styles.userItem}>{item.username}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noResultsText}>No results found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  searchBar: {
    height: 40,
    borderColor: "grey",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  userItem: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  noResultsText: {
    textAlign: "center",
    color: "grey",
    marginTop: 20,
  },
});
