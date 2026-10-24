import { Stack } from "expo-router";
import { COLORS } from "../../../../app.config";

export const unstable_settings = { initialRouteName: "index" };

export default function CommunityLayout() {
    return <Stack screenOptions={{
        "contentStyle": {
            "backgroundColor": COLORS.background
        }
    }}>
        <Stack.Screen name="index" options={{ "headerShown": false }} />
        <Stack.Screen name="write" options={{ "headerShown": false }} />
    </Stack>;
}
