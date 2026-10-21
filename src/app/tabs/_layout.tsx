import { ReactNode, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../../app.config";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";

import SvgHome from "@/assets/svg/tabbar/home.svg";
import SvgCalendar from "@/assets/svg/tabbar/calendar.svg";
import SvgSiren from "@/assets/svg/tabbar/siren.svg";
import SvgMessageBox from "@/assets/svg/tabbar/messageBox.svg";
import SvgUser from "@/assets/svg/tabbar/user.svg";

type Screens = "home" | "walk" | "emergency" | "community" | "my";

export default function RootLayout() {
    const [screen, setScreen] = useState<Screens>("home");
    const safeArea = useSafeAreaInsets();
    const styles = getStyles(safeArea);

    return <View style={styles.container}>
        {(() => {
            switch (screen) {
                case "home": return;
                case "walk": return;
                case "emergency": return;
                case "community": return;
                case "my": return;
            }
        })()}
        <View style={[styles.tabbar, { "paddingBottom": safeArea.bottom }]}>
            <View style={styles.tabbarItems}>
                <TouchableOpacity hitSlop={15} style={styles.tabbarItem} onPress={() => setScreen("home")}>
                    <SvgHome width={30} height={30} color={screen === "home" ? COLORS.green_light2 : "#6e6e6e"} />
                    <Text style={[styles.tabbarItemText, { "color": screen === "home" ? COLORS.green_light2 : "#6e6e6e" }]}>홈</Text>
                </TouchableOpacity>
                <TouchableOpacity hitSlop={15} style={styles.tabbarItem} onPress={() => setScreen("walk")}>
                    <SvgCalendar width={30} height={30} color={screen === "walk" ? COLORS.green_light2 : "#6e6e6e"} />
                    <Text style={[styles.tabbarItemText, { "color": screen === "walk" ? COLORS.green_light2 : "#6e6e6e" }]}>산책</Text>
                </TouchableOpacity>
                <TouchableOpacity hitSlop={15} style={styles.tabbarItem} onPress={() => setScreen("emergency")}>
                    <SvgSiren width={30} height={30} color={screen === "emergency" ? COLORS.green_light2 : "#6e6e6e"} />
                    <Text style={[styles.tabbarItemText, { "color": screen === "emergency" ? COLORS.green_light2 : "#6e6e6e" }]}>긴급</Text>
                </TouchableOpacity>
                <TouchableOpacity hitSlop={15} style={styles.tabbarItem} onPress={() => setScreen("community")}>
                    <SvgMessageBox width={30} height={30} color={screen === "community" ? COLORS.green_light2 : "#6e6e6e"} />
                    <Text style={[styles.tabbarItemText, { "color": screen === "community" ? COLORS.green_light2 : "#6e6e6e" }]}>커뮤니티</Text>
                </TouchableOpacity>
                <TouchableOpacity hitSlop={15} style={styles.tabbarItem} onPress={() => setScreen("my")}>
                    <SvgUser width={30} height={30} color={screen === "my" ? COLORS.green_light2 : "#6e6e6e"} />
                    <Text style={[styles.tabbarItemText, { "color": screen === "my" ? COLORS.green_light2 : "#6e6e6e" }]}>마이</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>;
}

const getStyles = (safeArea: EdgeInsets) => StyleSheet.create({
    "container": {
        "flex": 1,
        "backgroundColor": COLORS.background,
        "width": "100%",
        "paddingTop": safeArea.top,
        "paddingLeft": safeArea.left,
        "paddingRight": safeArea.right
    },
    "tabbar": {
        "position": "absolute",
        "bottom": 0,
        "left": 0,
        "right": 0,
        "height": 75 + safeArea.bottom,
        "width": "100%",
        "borderColor": "#9CA3AF",
        "borderWidth": 0.3,
        "borderStyle": "solid",
        "borderTopLeftRadius": 15,
        "borderTopRightRadius": 15,
        "paddingBottom": safeArea.bottom
    },
    "tabbarItems": {
        "marginHorizontal": 36,
        "paddingVertical": 15,
        "flexDirection": "row",
        "gap": 40,
        "width": 322
    },
    "tabbarItem": {
        "gap": 3.5,
        "flexDirection": "column",
        "alignItems": "center"
    },
    "tabbarItemText": {
        "maxWidth": 42,
        "fontFamily": "NanumSquareNeo-Regular",
        "fontSize": 11,
    }
});

