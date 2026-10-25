import { Platform, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, DarkColors, LightColors } from "../../../../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";

import SvgSearch from '@/assets/svg/search.svg';
import SvgList from '@/assets/svg/list.svg';

export default function Page() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors, safeArea);

    return <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerText}>산책 기록</Text>
            <View style={styles.headerItems}>
                <TouchableOpacity hitSlop={7}>
                    <SvgSearch width={15} height={15} />
                </TouchableOpacity>
                <TouchableOpacity hitSlop={7}>
                    <SvgList width={15} height={15} />
                </TouchableOpacity>
            </View>
        </View>
    </View>;
}

const getStyles = (colors: Colors, safeArea: EdgeInsets) => StyleSheet.create({
    "container": {
        "flex": 1,
        "flexDirection": "column",
        "backgroundColor": colors.background,
        "width": "100%",
        "paddingTop": Platform.select({ "android": safeArea.top + 14, "ios": 76 }),
        "paddingLeft": safeArea.left,
        "paddingRight": safeArea.right
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