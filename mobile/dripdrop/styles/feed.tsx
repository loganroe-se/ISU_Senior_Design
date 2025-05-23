import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors"

const windowWidth = Dimensions.get('window').width * 0.95;

export const feedStyle = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    justifyContent: 'flex-start',
    paddingTop: 6,
    paddingLeft: 15,
    zIndex: 1,
    borderBottomWidth: 1,
    borderColor: "black",
  },
  headerText: {
    color: Colors.light.primary,
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  usernameInline: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  feedItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    width: '100%'
  },
  image: {
    borderRadius: 8,
    marginBottom: 10,
  },
  imageErrorBox: {
    width: windowWidth,
    height: windowWidth,
    backgroundColor: "#ccc",
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  imageErrorText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  caption: {
    fontSize: 16,
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: 'gray',
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
  noMorePostsMessage: {
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  noMorePostsMessageText: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  showMoreText: {
    color: "#a9a9a9",
  },
  markerToggleContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: "100%",
    borderWidth: 2,
    borderColor: "black",
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingProfileContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    zIndex: 999,
  },
  loadingProfileText: {
    fontSize: 14,
    color: Colors.light.primary,
    marginTop: 10,
  },
  profilePicture: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 10,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
});