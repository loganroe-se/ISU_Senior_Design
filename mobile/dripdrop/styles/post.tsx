import { Colors } from "@/constants/Colors";
import { Dimensions, StyleSheet } from "react-native";




export const preview_post_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: '#000'
    },
    image: {
        width: 250,
        height: 250,
        borderRadius: 10,
        marginBottom: 15,
    },
    caption: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
        paddingHorizontal: 10,
        color: '#000'
    },
    button: {
        width: "80%",
        marginVertical: 10,
    },
});
export const post_styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    cardContainer: {
        borderRadius: 12,
        elevation: 5,
        backgroundColor: '#f2f2f2'
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 10,
        position:'relative',
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginVertical: 10,
        objectFit: 'contain',
    },
    removeIconContainer: {
        position: "absolute", // Position the X icon absolutely
        top: 10, // Distance from the top
        right: 10, // Distance from the right

        borderRadius: 12, // Rounded corners
        padding: 4, // Padding around the icon
    },
    placeholderContainer: {
        alignItems: "center",
        justifyContent: "center",
        height: 200,
    },
    placeholderText: {
        fontSize: 16,
    },
    thumbnail: {
        width: Dimensions.get("window").width / 4,
        height: Dimensions.get("window").width / 4,
        justifyContent: "center",
        padding: 5,
        borderRadius: 5,
    },
    removeButton: {
        backgroundColor: Colors.redButtonColor,
        alignSelf:'center'
    },
    input: {
        borderRadius: 8,
        marginBottom: 10,
        width: "90%",
        alignSelf: "center",
        backgroundColor: '#fff',
    },
    bottomContainer: {
        width: "90%",
        alignSelf: "center",
    },
    loadingContainer: {
        padding: 20,
        alignItems: "center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    frame: {
        width: 300,
        height: 300,
        borderWidth: 2,
        borderColor: "#fff",
        overflow: "hidden",
    },
    adjustableImage: {
        width: "100%",
        height: "100%",
    },
    modal_button: {
        width: 200, // Fixed width for both buttons
        height: 40, // Fixed height for both buttons
        justifyContent: "center", // Center text horizontally

        alignSelf:'center',
        marginTop: 10, // Space between buttons
    },
    saveButton: {
        backgroundColor: Colors.light.primary,
    },
    cancelButton: {
        borderColor: 'red',
    },
    
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    backButton: {
        padding: 8,
    },
    continueButton: {
        padding: 8,
    },
    continueText: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.light.primary,
    },
    loadingText: {
        color: 'grey', 
        opacity: 0.7, 
    },
    takePhotoButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.light.primary,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 16,
    },
    cameraIcon: {
        marginRight: 8,
    },
    takePhotoText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

