import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from 'expo-haptics';
import { COLORS } from "../../app.config";
import { Tabs } from "expo-router";

import SvgHome from "@/assets/svg/tabbar/home.svg";
import SvgSelectedHome from "@/assets/svg/tabbar/selectedHome.svg";
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

export type Screens = keyof typeof names;

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>>[0];

export default function TabBar({ state, emitter, navigateToTab, insets }: TabBarProps) {
    return <View style={[styles.tabbar, { paddingBottom: insets.bottom, height: 60 + insets.bottom }]}>
        <View style={styles.tabbarItems}>
            {state.routes.map((route, index) => {
                if (!(route.name in names)) return null;
                const [label, Icon] = names[route.name as Screens];
                const selected = state.index === index;
                const color = selected ? COLORS.green_light2 : "#6e6e6e";

                return <TouchableOpacity
                    key={route.key}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    accessibilityLabel={label}
                    hitSlop={15}
                    style={styles.tabbarItem}
                    onPress={() => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const event = emitter.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true
                        });
                        if (!selected && !event.defaultPrevented) {
                            navigateToTab(route.key);
                        }
                    }}
                    onLongPress={() => emitter.emit({ type: "tabLongPress", target: route.key })}
                >
                    {selected && route.name === "home" ? <SvgSelectedHome width={30} height={30} color={color} /> : <Icon width={30} height={30} color={color} />}
                    <Text style={[styles.tabbarItemText, { color }]}>{label}</Text>
                </TouchableOpacity>;
            })}
        </View>
    </View>;
}

const styles = StyleSheet.create({
    "tabbar": {
        "backgroundColor": COLORS.background,
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
