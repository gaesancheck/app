import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from 'expo-haptics';
import { COLORS } from "../../app.config";

import SvgHome from "@/assets/svg/tabbar/home.svg";
import SvgCalendar from "@/assets/svg/tabbar/calendar.svg";
import SvgSiren from "@/assets/svg/tabbar/siren.svg";
import SvgMessageBox from "@/assets/svg/tabbar/messageBox.svg";
import SvgUser from "@/assets/svg/tabbar/user.svg";

const names = {
    "home": ["홈", SvgHome] as const,
    "walk": ["산책", SvgCalendar] as const,
    "emergency": ["긴급", SvgSiren] as const,
    "community": ["커뮤니티", SvgMessageBox] as const,
    "mypage": ["마이", SvgUser] as const,
};

type Screens = keyof typeof names;

function TabBarItem({
    selected,
    screen,
    setScreen
}: {
    selected: boolean,
    screen: Screens,
    setScreen: React.Dispatch<React.SetStateAction<Screens>>
}) {
    const CurrentSvg = names[screen][1];

    return <TouchableOpacity
        hitSlop={15}
        style={styles.tabbarItem}
        onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setScreen(screen);
        }}
    >
        <CurrentSvg
            width={30}
            height={30}
            color={selected ? COLORS.green_light2 : "#6e6e6e"}
        />
        <Text
            style={[styles.tabbarItemText, { "color": selected ? COLORS.green_light2 : "#6e6e6e" }]}
        >{names[screen][0]}</Text>
    </TouchableOpacity>;
}

export default function TabBar() {
    const [screen, setScreen] = useState<Screens>("home");
    const safeArea = useSafeAreaInsets();

    return <View style={[styles.tabbar, { "paddingBottom": safeArea.bottom }]}>
        <View style={styles.tabbarItems}>
            <TabBarItem setScreen={setScreen} selected={screen.includes("home")} screen={"home"} />
            <TabBarItem setScreen={setScreen} selected={screen.includes("walk")} screen={"walk"} />
            <TabBarItem setScreen={setScreen} selected={screen.includes("emergency")} screen={"emergency"} />
            <TabBarItem setScreen={setScreen} selected={screen.includes("community")} screen={"community"} />
            <TabBarItem setScreen={setScreen} selected={screen.includes("mypage")} screen={"mypage"} />
        </View>
    </View>;
}

const styles = StyleSheet.create({
    "tabbar": {
        "position": "absolute",
        "bottom": 0,
        "left": 0,
        "right": 0,
        "height": 75,
        "width": "100%",
        "borderColor": "#9CA3AF",
        "borderWidth": 0.3,
        "borderStyle": "solid",
        "borderTopLeftRadius": 15,
        "borderTopRightRadius": 15
    },
    "tabbarItems": {
        "marginHorizontal": "auto",
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
