import { router, Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useEffect(() => {
        (async () => {
            await Font.loadAsync({
                "NanumSquareNeo-Light": require("@/assets/fonts/NanumSquareNeo-aLt.ttf"),
                "NanumSquareNeo-Regular": require("@/assets/fonts/NanumSquareNeo-aLt.ttf"),
                "NanumSquareNeo-Bold": require("@/assets/fonts/NanumSquareNeo-aLt.ttf"),
                "NanumSquareNeo-ExtraBold": require("@/assets/fonts/NanumSquareNeo-aLt.ttf"),
                "NanumSquareNeo-Heavy": require("@/assets/fonts/NanumSquareNeo-aLt.ttf"),
                "온글잎 박다현체": require("@/assets/fonts/ParkDaHyeon.ttf"),
            });

            await SplashScreen.hideAsync();
        })();
    }, []);

    return <Stack
        screenOptions={{
            "header": () => null
        }}
    />;
}
