import { Stack } from "expo-router";
import { DarkColors, LightColors } from "../../../../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";

export const unstable_settings = { "anchor": "index" };

export default function WalkLayout() {
    const colors = useChooseByScheme(LightColors, DarkColors);

    return <Stack screenOptions={{
        "headerShown": false,
        "contentStyle": {
            "backgroundColor": colors.background
        }
    }}>
        <Stack.Screen name="index" options={{ "headerShown": false }} />
    </Stack>;
}
