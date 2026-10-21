import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../../app.config";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from 'expo-haptics';

import SvgHome from "@/assets/svg/tabbar/home.svg";
import SvgCalendar from "@/assets/svg/tabbar/calendar.svg";
import SvgSiren from "@/assets/svg/tabbar/siren.svg";
import SvgMessageBox from "@/assets/svg/tabbar/messageBox.svg";
import SvgUser from "@/assets/svg/tabbar/user.svg";

import Community from "./Community";

type Screens = "home" | "walk" | "emergency" | "community" | "my";

const svgs = {
    "home": SvgHome,
    "walk": SvgCalendar,
    "emergency": SvgSiren,
    "community": SvgMessageBox,
    "my": SvgUser
};

const names = {
    "home": "홈",
    "walk": "산책",
    "emergency": "긴급",
    "community": "커뮤니티",
    "my": "마이"
};

function TabBarItem({
    currentScreen,
    screen,
    styles,
    setScreen
}: {
    currentScreen: Screens,
    screen: Screens,
    styles: Record<string, any>,
    setScreen: React.Dispatch<React.SetStateAction<Screens>>
}) {
    const CurrentSvg = svgs[screen];

    return <TouchableOpacity
        hitSlop={15}
        style={styles.tabbarItem}
        onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setScreen(screen);
        }}
    >
        <CurrentSvg
            width={30}
            height={30}
            color={currentScreen === screen ? COLORS.green_light2 : "#6e6e6e"}
        />
        <Text
            style={[styles.tabbarItemText, { "color": currentScreen === screen ? COLORS.green_light2 : "#6e6e6e" }]}
        >{names[screen]}</Text>
    </TouchableOpacity>;
}

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
                case "community": return <Community />;
                case "my": return;
            }
        })()}
        <View style={[styles.tabbar, { "paddingBottom": safeArea.bottom }]}>
            <View style={styles.tabbarItems}>
                <TabBarItem setScreen={setScreen} currentScreen={screen} styles={styles} screen={"home"} />
                <TabBarItem setScreen={setScreen} currentScreen={screen} styles={styles} screen={"walk"} />
                <TabBarItem setScreen={setScreen} currentScreen={screen} styles={styles} screen={"emergency"} />
                <TabBarItem setScreen={setScreen} currentScreen={screen} styles={styles} screen={"community"} />
                <TabBarItem setScreen={setScreen} currentScreen={screen} styles={styles} screen={"my"} />
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

