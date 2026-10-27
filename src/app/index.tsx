import { View, StyleSheet, Dimensions, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, DarkColors, LightColors } from "../../app.config";
import Footstep from "@/assets/svg/balzaguk.svg";
import { useEffect } from "react";
import { router } from "expo-router";
import useChooseByScheme from "@/modules/useChooseByScheme";
import * as DevTools from 'expo-dev-client';
import userData from "@/modules/userData";
import * as Expo from 'expo';

export default function Loading() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors);

    useEffect(() => {
        __DEV__ && DevTools.registerDevMenuItems([
            {
                "name": "Save example data",
                "callback": async () => {
                    await userData.set({
                        "loggedIn": true,
                        "walkRecords": [{
                            "id": "",
                            "date": "",
                            "rate": 5,
                            "routes": [{
                                "latitude": 37.553881,
                                "longitude": 126.970488
                            }, {
                                "latitude": 36.7922,
                                "longitude": 127.1046
                            }],
                            "duration": 2400,
                            "distance": 415,
                            "destination": "아산역",
                            "weather": "cloudy",
                            "content": "오늘은 우리집 갱얼쥐를 대리고 아산역으로 산책을 갔다. 80km를 넘게 다니니까 평생 할 산책 오늘 한 번에 다한 것 같았다. 다음에는 용산역까지만 가야겠다.",
                        }]
                    });

                    await Expo.reloadAppAsync("Saved example data from DevClient");
                }
            },
            {
                "name": "sitemap",
                "callback": () => router.replace("/_sitemap")
            }
        ]);

        router.replace("/(tabs)/home");
    }, []);

    return <View
        style={[styles.container, {
            "paddingTop": safeArea.top,
            "paddingBottom": safeArea.bottom
        }]}
    >
        <Image style={styles.image} source={require("@/assets/images/icon.png")} />
        {/* Reference image includes padding; use the visible paw bounds for placement. */}
        <View style={styles.footsteps}>
            <Footstep
                width={32.3519}
                height={31.0057}
                style={[styles.footstep, {
                    left: 28.5508,
                    top: 23.6630,
                    transform: [{ rotate: "16.6543deg" }]
                }]}
            />
            <Footstep
                width={39.5955}
                height={37.9477}
                style={[styles.footstep, {
                    left: 118.9294,
                    top: 80.4127,
                    transform: [{ rotate: "-10.1388deg" }]
                }]}
            />
            <Footstep
                width={42.8043}
                height={41.0231}
                style={[styles.footstep, {
                    left: 35.2228,
                    top: 151.4171,
                    transform: [{ rotate: "9.48986deg" }]
                }]}
            />
            <Footstep
                width={45.4799}
                height={43.5873}
                style={[styles.footstep, {
                    left: 96.5385,
                    top: 244.5002,
                    transform: [{ rotate: "-19.2938deg" }]
                }]}
            />
        </View>
    </View>;
}

const getStyles = (colors: Colors) => StyleSheet.create({
    "container": {
        "backgroundColor": colors.background,
        "height": Dimensions.get("window").height,
        "flexDirection": "column",
        "alignItems": "center",
        "justifyContent": "center"
    },
    "image": {
        "width": 187,
        "height": 147,
        "marginBottom": 52,
        "marginTop": 104
    },
    "footsteps": {
        "flexDirection": "column",
        "width": 187,
        "height": 319
    },
    "footstep": {
        "position": "absolute",
        "transformOrigin": "top left"
    }
});
