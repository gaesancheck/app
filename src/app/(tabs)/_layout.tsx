import { Redirect, Tabs, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, AppState, View } from "react-native";
import TabBar from "@/components/TabBar";
import { LightColors, DarkColors } from "../../../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import session from "@/modules/session";

export const unstable_settings = { "anchor": "home" };

export default function TabLayout() {
    const colors = useChooseByScheme(LightColors, DarkColors);
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);

    useFocusEffect(useCallback(() => {
        let active = true;
        let expiryTimer: ReturnType<typeof setTimeout> | undefined;
        const checkSession = async () => {
            const current = await session.get().catch(() => null);
            if (!active) return;
            clearTimeout(expiryTimer);
            setAuthenticated(Boolean(current));
            if (current?.expiresAt !== undefined) {
                expiryTimer = setTimeout(() => void checkSession(), Math.min(Math.max(0, current.expiresAt - Date.now()), 2_147_483_647));
            }
        };
        void checkSession();
        const subscription = AppState.addEventListener("change", state => {
            if (state === "active") void checkSession();
        });
        return () => {
            active = false;
            clearTimeout(expiryTimer);
            subscription.remove();
        };
    }, []));

    if (authenticated === null) return <View style={{ "flex": 1, "justifyContent": "center", "alignItems": "center", "backgroundColor": colors.background }}>
        <ActivityIndicator color={colors.green_light2} />
    </View>;
    if (!authenticated) return <Redirect href="/login" />;

    return <Tabs
        backBehavior="history"
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
    >
        <Tabs.Screen name="home" options={{ "title": "홈" }} />
        <Tabs.Screen name="walk" options={{ "title": "산책" }} />
        <Tabs.Screen name="emergency" options={{ "title": "긴급" }} />
        <Tabs.Screen name="community" options={{ "title": "커뮤니티" }} />
        <Tabs.Screen name="mypage" options={{ "title": "마이" }} />
    </Tabs>;
}
