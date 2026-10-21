import { Dimensions, StyleSheet, View } from "react-native";
import { COLORS } from "@/../app.config";

export default function Index() {
    return <View style={styles.container}>

    </View>;
}

const styles = StyleSheet.create({
    "container": {
        "backgroundColor": COLORS.background,
        "width": "100%",
        "height": "100%"
    }
});