import { Platform, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, DarkColors, LightColors } from "@/../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { router } from "expo-router";
import { haptics } from "@/modules/haptics";

import SvgBack from "@/assets/svg/back.svg";

export default function Page() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors, safeArea);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerBack}
                    hitSlop={7}
                    onPress={() => {
                        haptics.light();
                        router.back();
                    }}
                >
                    <SvgBack width={15} height={15} />
                </TouchableOpacity>
                <Text style={styles.headerText}>산책 기록</Text>
            </View>
            <View style={styles.form}></View>
        </View>
    );
}

const getStyles = (colors: Colors, safeArea: EdgeInsets) =>
    StyleSheet.create({
        "container": {
            "flex": 1,
            "flexDirection": "column",
            "backgroundColor": colors.background,
            "width": "100%",
            "paddingTop": Platform.select({
                "android": safeArea.top + 14,
                "ios": 76,
            }),
            "paddingLeft": safeArea.left,
            "paddingRight": safeArea.right,
        },
        "header": {
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "paddingHorizontal": 32,
        },
        "headerBack": {
            "position": "absolute",
            "left": 32,
        },
        "headerText": {
            "textAlign": "center",
            "fontFamily": "Ownglyph PDH",
            "fontSize": 20,
        },
        "form": {
            "flexDirection": "column",
            "gap": 13,
        },
    });
