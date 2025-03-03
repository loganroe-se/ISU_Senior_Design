import { StyleSheet } from "react-native";

export const profileStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    profileContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 16,
    },
    avatarContainer: {
      borderWidth: 2,
      borderColor: "#e0e0e0",
      borderRadius: 50,
      padding: 3,
    },
    userInfo: {
      flex: 1,
      marginLeft: 20,
    },
    username: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 4,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 12,
      marginRight: 20,
    },
    stat: {
      alignItems: "center",
    },
    statNumber: {
      fontSize: 18,
      fontWeight: "bold",
    },
    statLabel: {
      fontSize: 14,
      color: "#666",
    },
    editButton: {
      borderRadius: 8,
      borderColor: "#ddd",
      marginBottom: 12,
    },
    buttonLabel: {
      fontSize: 14,
      fontWeight: "500",
    },
    displayName: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    bio: {
      fontSize: 14,
      color: "#333",
      lineHeight: 18,
    },
    gridContainer: {
      marginHorizontal: -0.5,
    },
    postContainer: {
      width: 150,  // Set a fixed width
      height: 200, // Set a fixed height
      margin: 2,   // Adjust spacing between images
    },
    postImage: {
      width: "100%",
      height: "100%",
      backgroundColor: "#f0f0f0",
    },
  });