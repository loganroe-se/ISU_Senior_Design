import { StyleSheet } from "react-native";

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
        width: 300,
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
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#5271ff" },
    input: { height: 40, width: 300, borderColor: "grey", borderWidth: 1, marginBottom: 15, paddingLeft: 10, borderRadius: 5, color: "black", alignSelf: "center" },
    logo: { width: 100, height: 100, marginBottom: 10, alignSelf: "center" },
    signInText: { color: "blue", textAlign: "center", marginTop: 20, fontSize: 14 },
    modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center" },
    modalText: { fontSize: 18, marginBottom: 10 },
    datePicker: { width: "80%", marginBottom: 20 },
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
});
