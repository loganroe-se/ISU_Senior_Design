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
        color: 'black'
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 10,
        marginBottom: 15,
    },
    caption: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
        paddingHorizontal: 10,
        color: 'black'
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
        position: 'relative',
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
        alignSelf: 'center'
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

        alignSelf: 'center',
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
        borderRadius: 4
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
    disabledButton: {
        backgroundColor: "#d3d3d3", // Grey out the button when disabled
    },
    disabledText: {
        color: "#a1a1a1", // Lighter color for the text when disabled
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


export const image_marker_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.light.primary,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        color: Colors.light.primary,
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: "60%", // Adjust height to center the image vertically
        justifyContent: "center", // Center the image vertically
        alignItems: "center", // Center the image horizontally
        marginBottom: 16,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "contain", // Ensure the image fits within the container
        borderRadius: 8,
    },
    marker: {
        position: "absolute",
        width: '8%',
        height: '8%',
        borderRadius: '100%', // Circular marker
        backgroundColor: "grey", // Default color for unverified markers
        opacity: 0.7, // Semi-transparent
    },
    caption: {
        fontSize: 16,
        textAlign: "center",
        color: Colors.light.text,
        marginBottom: 20, // Add margin to separate from the Post button
    },
    helpButton: {
        position: "absolute",
        top: '10%', // Adjust top position
        right: '4%', // Adjust right position
        zIndex: 1, // Ensure the button is above other elements
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        alignItems: "center",
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
    },
    modalButton: {
        width: "100%",
        marginTop: 10,
    },
    postButton: {
        position: "absolute",
        bottom: '2%',
        width: "100%",
        paddingVertical: 8,
        borderRadius: 8, // Rounded corners
        shadowOpacity: 0.2,
    },
    deleteIcon: {
        position: "absolute",
        top: -8,
        right: -8,
    },
    confirmationDialog: {
        position: "absolute",
        bottom: 100,
        width: "80%",
        alignSelf: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        elevation: 5,
    },
    confirmationText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 16,
    },
    confirmationButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    confirmButton: {
        flex: 1,
        marginRight: 8,
    },
    cancelButton: {
        flex: 1,
        marginLeft: 8,
    },
    editButton: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 1,
    },
    editModeButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 16,
    },
    addButton: {
        flex: 1,
        marginRight: 8,
        paddingVertical: 8,
        borderRadius: 8,
    },
    deleteButton: {
        flex: 1,
        marginLeft: 8,
        paddingVertical: 8,
        borderRadius: 8,
    },

});



export const item_details_styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: '10%', // Add padding to avoid overlap with buttons
        justifyContent: 'space-evenly',
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        position: "absolute", // Position the buttons absolutely
        alignSelf: 'center',
        bottom: '-.1%'
    },
    backButton: {
        borderWidth: 1.5,
        borderColor: "black",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        marginRight: 8, // Add spacing between buttons
        backgroundColor: "#0",
    },
    saveButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        marginLeft: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000", // Black text color for back button
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333", // Dark gray text color
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
        color: "#555", // Medium gray text color
    },
    input: {
        height: 50,
        marginBottom: 16,
        backgroundColor: "#fff", // White background for inputs

    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },

});

