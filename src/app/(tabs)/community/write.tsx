import { StyleSheet, View } from "react-native";

export default function Page() {
    return <View>

    </View>;
}

const styles = StyleSheet.create({
    "container": {
        "flex": 1,
        "flexDirection": "column"
    },
    "header": {
        "flexDirection": "row",
        "justifyContent": "space-between",
        "paddingHorizontal": 32
    },
    "headerText": {
        "fontFamily": "ParkDaHyeon",
        "color": "#2F3A2D",
        "fontSize": 28
    },
    "headerItems": {
        "flexDirection": "row",
        "gap": 19,
        "alignItems": "center"
    },
});
