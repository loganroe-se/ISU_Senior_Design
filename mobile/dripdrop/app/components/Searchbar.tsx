import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]); // Store the fetched users
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]); // Store the filtered users
  const [searchType, setSearchType] = useState<'accounts' | 'posts'>('accounts'); // State to track search type

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
    } else if (searchType === 'accounts') {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      // Empty list for posts, as it's not implemented
      setFilteredUsers([]);
    }
  }, [searchQuery, searchType, users]);

  // Handle user selection (optional)
  const handleUserPress = (username: string) => {
    Alert.alert("User Selected", `You selected ${username}`);
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    if (searchQuery.trim() === "") {
      Alert.alert("Search", "Please enter a search query.");
    } else {
      // You can add any custom logic here for when the user submits the search
      console.log("Search submitted:", searchQuery);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>

      {/* Search bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a username or post"
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search" // Changes the return key to 'Search'
        onSubmitEditing={handleSearchSubmit} // Trigger search when 'Search' is pressed
      />

      {/* Toggle search type (Accounts / Posts) */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, searchType === 'accounts' && styles.activeToggle]} 
          onPress={() => setSearchType('accounts')}
        >
          <Text style={styles.toggleText}>Accounts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, searchType === 'posts' && styles.activeToggle]} 
          onPress={() => setSearchType('posts')}
        >
          <Text style={styles.toggleText}>Posts</Text>
        </TouchableOpacity>
      </View>

      {/* Display filtered results based on search type */}
      {searchType === 'accounts' ? (
        filteredUsers.length > 0 ? (
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
          <Text style={styles.noResultsText}>No accounts found</Text>
        )
      ) : (
        <Text style={styles.noResultsText}>Post search functionality is not implemented yet</Text>
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
    width: 300,
    borderColor: "grey",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
    alignSelf: "center",

  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  activeToggle: {
    backgroundColor: '#5271ff',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
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

