import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
});
