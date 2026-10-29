import { Stack } from "expo-router";
import { DarkColors, LightColors } from "../../../../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";

export const unstable_settings = { "anchor": "index" };

export default function CommunityLayout() {
    const colors = useChooseByScheme(LightColors, DarkColors);

    return <Stack screenOptions={{
        "contentStyle": {
            "backgroundColor": colors.background
        }
    }}>
        <Stack.Screen name="index" options={{ "headerShown": false }} />
        <Stack.Screen name="write" options={{ "headerShown": false }} />
        <Stack.Screen name="archives" options={{ "headerShown": false }} />
    </Stack>;
}
