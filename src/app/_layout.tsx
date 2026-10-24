import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as DevClient from 'expo-dev-client';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = { initialRouteName: "index" };

export default function RootLayout() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            if (__DEV__)
                DevClient.registerDevMenuItems([
                    {
                        "name": "Sitemap",
                        "callback": () => router.push("/_sitemap"),
                        "shouldCollapse": true
                    }
                ]);

            await Font.loadAsync({
                "NanumSquareNeo-Light": require("@/assets/fonts/NanumSquareNeo-aLt.ttf"),
                "NanumSquareNeo-Regular": require("@/assets/fonts/NanumSquareNeo-bRg.ttf"),
                "NanumSquareNeo-Bold": require("@/assets/fonts/NanumSquareNeo-cBd.ttf"),
                "NanumSquareNeo-ExtraBold": require("@/assets/fonts/NanumSquareNeo-dEb.ttf"),
                "NanumSquareNeo-Heavy": require("@/assets/fonts/NanumSquareNeo-eHv.ttf"),
                "ParkDaHyeon": require("@/assets/fonts/ParkDaHyeon.ttf"), // 온글잎 박다현체
            });

            setFontsLoaded(true);
            await SplashScreen.hideAsync();
        })();
    }, []);

    if (!fontsLoaded) return null;

    return <Stack
        screenOptions={{
            "header": () => null
        }}
    />;
}
