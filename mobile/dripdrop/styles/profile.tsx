import { StyleSheet } from "react-native";

export const profileStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    profileContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 16,
      marginBottom: 8,
      marginLeft: 8
    },
    avatarContainer: {
      borderWidth: 2,
      borderColor: "#e0e0e0",
      borderRadius: 50,
      padding: 3,
    },
    feedContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
    },
    userHeader: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 4
    },
    userDescription: {
      marginTop: 4,
      marginLeft: 4
    },
    username: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 4,
      marginRight: 8,
      color: "#000"
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 12,
    },
    stat: {
      alignItems: "center",
    },
    statNumber: {
      fontSize: 18,
      color: "#000",
      fontWeight: "bold",
    },
    statLabel: {
      fontSize: 14,
      color: "#666",
    },
    actionButton: {
      borderRadius: 12,
      backgroundColor: "#0073FF",
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginTop: 8
    },
    buttonLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: "white",
      textAlign: "center"
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
    },
    postContainer: {
      width: 120,  // Set a fixed width
      height: 160, // Set a fixed height
      margin: 2.5,   // Adjust spacing between images
      display: "flex",
      alignItems: "center"
    },
    postImage: {
      width: "100%",
      height: "100%",
      backgroundColor: "#f0f0f0",
    },
  signOutButton: {
    backgroundColor: "#FF3B30", // Red color for sign-out button
  },
  });