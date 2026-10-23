import { Tabs } from "expo-router";
import TabBar from "@/components/TabBar";
import { COLORS } from "../../../app.config";

export const unstable_settings = { initialRouteName: "home" };

export default function TabLayout() {
    return <Tabs
        backBehavior="history"
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: COLORS.background } }}
    >
        <Tabs.Screen name="home" options={{ title: "홈" }} />
        <Tabs.Screen name="walk" options={{ title: "산책" }} />
        <Tabs.Screen name="emergency" options={{ title: "긴급" }} />
        <Tabs.Screen name="community" options={{ title: "커뮤니티" }} />
        <Tabs.Screen name="mypage" options={{ title: "마이" }} />
    </Tabs>;
}
