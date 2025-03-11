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
    },
    button: {
        width: "80%",
        marginVertical: 10,
    },
}); export const styles = StyleSheet.create({
    
    container: {
        flex: 1,
    },
    backButton: {
        top: '3%',
        left: 16,
        zIndex: 10,
        position: 'absolute'
    },
    cardContainer: {
        width: "100%",
        alignItems: "center",
        borderRadius: 12,
        elevation: 5,
        backgroundColor: '#fff'
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 10,
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginVertical: 10,
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
        width: Dimensions.get("window").width / 4 - 10,
        height: Dimensions.get("window").width / 4 - 10,
        margin: 5,
        borderRadius: 5,
    },
    button: {
        borderRadius: 8,
    },
    removeButton: {
        backgroundColor: Colors.redButtonColor,
    },
    input: {
        borderRadius: 8,
        marginBottom: 10,
        width: "90%",
        alignSelf: "center",
        backgroundColor:'#fff',
    },
    bottomContainer: {
        width: "90%",
        alignSelf: "center",
    },
    loadingContainer: {
        padding: 20,
        alignItems: "center",
    },
    
});

