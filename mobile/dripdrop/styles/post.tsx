import { Colors } from "@/constants/Colors";
import { Dimensions, StyleSheet } from "react-native";




export const processing_post_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,

    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: 'black'
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
        paddingHorizontal: 20,
        color: 'gray',
        lineHeight: 24
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 10,
        marginBottom: 15,
        resizeMode: 'contain',
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
        backgroundColor: 'white',
        width: '100%',
        alignSelf: 'center',
        borderRadius: 0
    },
    imageContainer: {
        alignItems: "center",
        position: 'relative',
    },
    image: {
        width: "100%",
        height: 300,
        marginVertical: 10,
        resizeMode: 'contain'
    },
    removeIconContainer: {
        position: "absolute", // Position the X icon absolutely
        top: 10,
        right: 10,
        borderRadius: 12,
        padding: 4,
    },
    placeholderContainer: {
        alignItems: "center",
        justifyContent: "center",
        height: 300,
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
        width: '90%',
        height: '60%',
        borderWidth: 1,
        borderColor: '#ccc',
        overflow: 'hidden',
        marginBottom: 20,
    },
    adjustableImage: {
        width: "100%",
        height: "100%",
    },
    modal_button: {
        marginVertical: 5,
        width: '80%',
    },
    saveButton: {
        backgroundColor: Colors.light.primary,
    },
    cancelButton: {
        borderColor: 'red',
    },
    resetButton: {
        borderColor: 'blue',
    },
    buttonGroup: {
        width: '100%',
        alignItems: 'center',
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

    androidImageUpload: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center", // Center content horizontally
        padding: 6, // Increase padding for height
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        backgroundColor: Colors.light.primary,
        marginTop: "80%",
        alignSelf: "center", // Center the button itself
    },

    androidCameraIcon: {
        marginRight: 8,
        padding: 10
    },
    androidTakePhotoText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    takePhotoText: {
        color: "#fff",
        fontSize: 18,
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
        opacity: 0.9, // Semi-transparent
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
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
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
    },

    confirmationDialog: {
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 16,
        width: "80%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },

    confirmationTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center",
        color: "#222",
    },

    confirmationText: {
        fontSize: 16,
        textAlign: "center",
        color: "#444",
        marginBottom: 20,
    },

    confirmationButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },

    button: {
        flex: 1,
        marginHorizontal: 8,
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

        position: "absolute", // Position the buttons absolutely
        alignSelf: 'center',
        bottom: '-.1%'
    },
    backButton: {
        borderWidth: 1.5,
        borderColor: "black",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        margin: 8,
        backgroundColor: "#0",
    },
    saveButton: {
        backgroundColor: Colors.light.primary,
        borderWidth: 1.5,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        margin: 8,
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

