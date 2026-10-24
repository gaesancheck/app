import { Tabs } from "expo-router";
import TabBar from "@/components/TabBar";
import { LightColors, DarkColors } from "../../../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";

export const unstable_settings = { "anchor": "home" };

export default function TabLayout() {
    const colors = useChooseByScheme(LightColors, DarkColors);

    return <Tabs
        backBehavior="history"
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
    >
        <Tabs.Screen name="home" options={{ title: "홈" }} />
        <Tabs.Screen name="walk" options={{ title: "산책" }} />
        <Tabs.Screen name="emergency" options={{ title: "긴급" }} />
        <Tabs.Screen name="community" options={{ title: "커뮤니티" }} />
        <Tabs.Screen name="mypage" options={{ title: "마이" }} />
    </Tabs>;
}
