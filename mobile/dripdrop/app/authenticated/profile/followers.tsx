import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchFollowersList, fetchFollowingList } from "@/api/following";
import { fetchUserById } from "@/api/user";
import { BasicUserData } from "@/types/user.interface";
import { Avatar } from "react-native-paper";

const tabs = ["followers", "following"];

const FollowersPage = () => {
  const { type = "followers", id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<string>(type as string);
  const [followers, setFollowers] = useState<BasicUserData[] | null>(null);
  const [following, setFollowing] = useState<BasicUserData[] | null>(null);
  const [filteredList, setFilteredList] = useState<BasicUserData[]>([]);
  const [searchText, setSearchText] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const userID = id as string;

  useEffect(() => {
    const loadUsername = async () => {
      const user = await fetchUserById(userID);
      if (user) setUsername(user.username);
    };

    loadUsername();
  }, [userID]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (activeTab === "followers" && followers === null) {
        const data = await fetchFollowersList(userID);
        setFollowers(data);
        setFilteredList(filterResults(data, searchText));
      } else if (activeTab === "following" && following === null) {
        const data = await fetchFollowingList(userID);
        setFollowing(data);
        setFilteredList(filterResults(data, searchText));
      } else {
        const currentList = activeTab === "followers" ? followers : following;
        setFilteredList(filterResults(currentList || [], searchText));
      }
      setLoading(false);
    };

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const currentList = activeTab === "followers" ? followers : following;
    setFilteredList(filterResults(currentList || [], searchText));
  }, [searchText]);

  const filterResults = (list: BasicUserData[], query: string): BasicUserData[] => {
    if (!query) return list;
    return list.filter((user) =>
      user.username?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const renderUser = ({ item }: { item: BasicUserData }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() => router.replace(`/authenticated/profile?id=${item.uuid}`)}
    >
      <Avatar.Image
        size={40}
        source={{
          uri: `https://cdn.dripdropco.com/${item.profilePic}?format=png`,
        }}
      />
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{username || "Profile"}</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.uuid}
          renderItem={renderUser}
        />
      )}
    </View>
  );
};

export default FollowersPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 10,
    flex: 1,
    alignItems: "center",
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  tabText: {
    fontSize: 16,
    color: "#888",
  },
  tabTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
  searchInput: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  
  username: {
    fontSize: 16,
  },
  
});
