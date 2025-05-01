import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const styles_signin = StyleSheet.create({
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
    width: "80%",
    maxWidth: 400,
    borderColor: "grey",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
    color: "black",
    alignSelf: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    alignSelf: "center",
  },
  signInText: {
    width: "80%",
    maxWidth: 400,
    borderRadius: 5,
    alignSelf: "center",
  },
  signUpText: {
    color: "blue",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 1,
  },
  
});
export const styles_signup = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#5271ff",
  },
  input: {
    height: 40,
    width: "80%",
    maxWidth: 400,
    borderColor: "grey",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
    color: "black",
    alignSelf: "center",
  },
  logo: { width: 100, height: 100, marginBottom: 10, alignSelf: "center" },
  signInText: {
    color: "blue",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
  signUpText: {
    width: "80%",
    maxWidth: 400,
    borderRadius: 5,
    alignSelf: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  currentDate: {
    marginVertical: 10,
    fontSize: 16
  },
  modalText: { 
    fontSize: 18, 
    marginBottom: 4, 
    textAlign: "center", 
    fontWeight: "bold" 
  },
  datePicker: { 
    width: "80%", 
    marginBottom: 20 
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 40,
    marginTop: 20,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Optional: semi-transparent background to dim rest of the screen
    zIndex: 1, // Ensure it's above all other content
  },
  timerText: {
    fontSize: 18,
    color: "#ff5733", // Red/orange color to make it noticeable
    marginTop: 20,
    fontWeight: "bold",
  },
  expiredText: {
    fontSize: 16,
    color: "red", // Red to indicate expiration
    marginTop: 10,
    fontWeight: "bold",
  },
  loadingButton: {
    backgroundColor: '#5271ff',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginTop: 10,
  },

});
