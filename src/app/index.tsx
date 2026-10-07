import { View, StyleSheet, Platform, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../app.config";

export default function Loading() {
    const safeArea = useSafeAreaInsets();

    return <View
        style={[styles.container, {
            "paddingTop": safeArea.top,
            "paddingBottom": safeArea.bottom
        }]}
    >

    </View>;
}

const styles = StyleSheet.create({
    "container": {
        "backgroundColor": COLORS.background,
        "height": Dimensions.get("window").height
    }
});