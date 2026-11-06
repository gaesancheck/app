import { Stack } from "expo-router";
import { DarkColors, LightColors } from "../../../../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";

export const unstable_settings = { "anchor": "index" };

export default function CommunityLayout() {
    const colors = useChooseByScheme(LightColors, DarkColors);

    return (
        <Stack
            screenOptions={{
                "headerShown": false,
                "contentStyle": {
                    "backgroundColor": colors.background,
                },
            }}
        >
            <Stack.Screen name="index" options={{ "headerShown": false, "animation": "none" }} />
            <Stack.Screen name="reports" options={{ "animation": "none" }} />
            <Stack.Screen name="start" options={{ "animation": "none" }} />
        </Stack>
    );
}
