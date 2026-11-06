import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import * as DevTools from "expo-dev-client";
import userData from "@/modules/userData";
import session from "@/modules/session";
import { careData } from "@/modules/careData";
import * as Expo from "expo";
import dayjs from "dayjs";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = { "anchor": "index" };

export default function RootLayout() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            __DEV__ &&
                DevTools.registerDevMenuItems([
                    {
                        "name": "Save example data",
                        "callback": async () => {
                            const currentSession = await session.get();
                            await session.set({
                                ...currentSession,
                                "jwt": currentSession?.jwt ?? "dev-example-data",
                                "needsOnboarding": false,
                            });
                            await userData.set({
                                "loggedIn": true,
                                "walkRecords": [
                                    {
                                        "id": Math.random().toString(),
                                        "date": dayjs().format("YYYYMMDD"),
                                        "rate": 5,
                                        "routes": [
                                            {
                                                "latitude": 37.553881,
                                                "longitude": 126.970488,
                                            },
                                            {
                                                "latitude": 36.7922,
                                                "longitude": 127.1046,
                                            },
                                        ],
                                        "duration": 2400,
                                        "distance": 415,
                                        "destination": "아산역",
                                        "weather": "cloudy",
                                        "content":
                                            "오늘은 우리집 갱얼쥐를 대리고 아산역으로 산책을 갔다. 80km를 넘게 다니니까 평생 할 산책 오늘 한 번에 다한 것 같았다. 다음에는 용산역까지만 가야겠다.",
                                    },
                                    {
                                        "id": Math.random().toString(),
                                        "date": dayjs().subtract(1, "month").format("YYYYMMDD"),
                                        "rate": 4,
                                        "routes": [
                                            {
                                                "latitude": 37.553881,
                                                "longitude": 126.970488,
                                            },
                                            {
                                                "latitude": 36.7922,
                                                "longitude": 127.1046,
                                            },
                                        ],
                                        "duration": 2400,
                                        "distance": 415,
                                        "destination": "아산역",
                                        "weather": "cloudy",
                                        "content":
                                            "오늘은 우리집 갱얼쥐를 대리고 아산역으로 산책을 갔다. 80km를 넘게 다니니까 평생 할 산책 오늘 한 번에 다한 것 같았다. 다음에는 용산역까지만 가야겠다.",
                                    },
                                    {
                                        "id": Math.random().toString(),
                                        "date": dayjs().subtract(2, "month").format("YYYYMMDD"),
                                        "rate": 3,
                                        "routes": [
                                            {
                                                "latitude": 37.553881,
                                                "longitude": 126.970488,
                                            },
                                            {
                                                "latitude": 36.7922,
                                                "longitude": 127.1046,
                                            },
                                        ],
                                        "duration": 2400,
                                        "distance": 415,
                                        "destination": "아산역",
                                        "weather": "cloudy",
                                        "content":
                                            "오늘은 우리집 갱얼쥐를 대리고 아산역으로 산책을 갔다. 80km를 넘게 다니니까 평생 할 산책 오늘 한 번에 다한 것 같았다. 다음에는 용산역까지만 가야겠다.",
                                    },
                                    {
                                        "id": Math.random().toString(),
                                        "date": dayjs().add(1, "month").format("YYYYMMDD"),
                                        "rate": 2,
                                        "routes": [
                                            {
                                                "latitude": 37.553881,
                                                "longitude": 126.970488,
                                            },
                                            {
                                                "latitude": 36.7922,
                                                "longitude": 127.1046,
                                            },
                                        ],
                                        "duration": 2400,
                                        "distance": 415,
                                        "destination": "아산역",
                                        "weather": "cloudy",
                                        "content":
                                            "오늘은 우리집 갱얼쥐를 대리고 아산역으로 산책을 갔다. 80km를 넘게 다니니까 평생 할 산책 오늘 한 번에 다한 것 같았다. 다음에는 용산역까지만 가야겠다.",
                                    },
                                    {
                                        "id": Math.random().toString(),
                                        "date": dayjs().add(2, "month").format("YYYYMMDD"),
                                        "rate": 1,
                                        "routes": [
                                            {
                                                "latitude": 37.553881,
                                                "longitude": 126.970488,
                                            },
                                            {
                                                "latitude": 36.7922,
                                                "longitude": 127.1046,
                                            },
                                        ],
                                        "duration": 2400,
                                        "distance": 415,
                                        "destination": "아산역",
                                        "weather": "cloudy",
                                        "content":
                                            "오늘은 우리집 갱얼쥐를 대리고 아산역으로 산책을 갔다. 80km를 넘게 다니니까 평생 할 산책 오늘 한 번에 다한 것 같았다. 다음에는 용산역까지만 가야겠다.",
                                    },
                                ],
                            });

                            await Expo.reloadAppAsync("Saved example data from DevClient");
                        },
                    },
                    {
                        "name": "모든 데이터 삭제",
                        "shouldCollapse": true,
                        "callback": async () => {
                            try {
                                await careData.clearAll();
                                await Expo.reloadAppAsync("Cleared all local data from DevClient");
                            } catch (error) {
                                Alert.alert(
                                    "데이터 삭제 실패",
                                    error instanceof Error ? error.message : "다시 시도해주세요."
                                );
                            }
                        },
                    },
                    {
                        "name": "sitemap",
                        "callback": () => router.replace("/_sitemap"),
                    },
                ]);

            await Font.loadAsync({
                "NanumSquareNeo-Light": require("@/assets/fonts/NanumSquareNeo-aLt.ttf"),
                "NanumSquareNeo-Regular": require("@/assets/fonts/NanumSquareNeo-bRg.ttf"),
                "NanumSquareNeo-Bold": require("@/assets/fonts/NanumSquareNeo-cBd.ttf"),
                "NanumSquareNeo-ExtraBold": require("@/assets/fonts/NanumSquareNeo-dEb.ttf"),
                "NanumSquareNeo-Heavy": require("@/assets/fonts/NanumSquareNeo-eHv.ttf"),
                "Ownglyph PDH": require("@/assets/fonts/ParkDaHyeon.ttf"), // 온글잎 박다현체
            });

            setFontsLoaded(true);
            await SplashScreen.hideAsync();
        })();
    }, []);

    if (!fontsLoaded) return null;

    return (
        <Stack
            screenOptions={{
                "header": () => null,
            }}
        />
    );
}
