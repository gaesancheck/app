import { View, StyleSheet, Dimensions, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, DarkColors, LightColors } from "../../app.config";
import { useEffect } from "react";
import { router } from "expo-router";
import useChooseByScheme from "@/modules/useChooseByScheme";

import Footstep from "@/assets/svg/balzaguk.svg";

export default function Loading() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors);

    useEffect(() => {
        router.replace("/login");
    }, []);

    return (
        <View
            style={[
                styles.container,
                {
                    "paddingTop": safeArea.top,
                    "paddingBottom": safeArea.bottom,
                },
            ]}
        >
            <Image style={styles.image} source={require("@/assets/images/icon.png")} />
            {/* Reference image includes padding; use the visible paw bounds for placement. */}
            <View style={styles.footsteps}>
                <Footstep
                    width={32.3519}
                    height={31.0057}
                    style={[
                        styles.footstep,
                        {
                            "left": 28.5508,
                            "top": 23.663,
                            "transform": [{ "rotate": "16.6543deg" }],
                        },
                    ]}
                />
                <Footstep
                    width={39.5955}
                    height={37.9477}
                    style={[
                        styles.footstep,
                        {
                            "left": 118.9294,
                            "top": 80.4127,
                            "transform": [{ "rotate": "-10.1388deg" }],
                        },
                    ]}
                />
                <Footstep
                    width={42.8043}
                    height={41.0231}
                    style={[
                        styles.footstep,
                        {
                            "left": 35.2228,
                            "top": 151.4171,
                            "transform": [{ "rotate": "9.48986deg" }],
                        },
                    ]}
                />
                <Footstep
                    width={45.4799}
                    height={43.5873}
                    style={[
                        styles.footstep,
                        {
                            "left": 96.5385,
                            "top": 244.5002,
                            "transform": [{ "rotate": "-19.2938deg" }],
                        },
                    ]}
                />
            </View>
        </View>
    );
}

const getStyles = (colors: Colors) =>
    StyleSheet.create({
        "container": {
            "backgroundColor": colors.background,
            "height": Dimensions.get("window").height,
            "flexDirection": "column",
            "alignItems": "center",
            "justifyContent": "center",
        },
        "image": {
            "width": 187,
            "height": 147,
            "marginBottom": 52,
            "marginTop": 104,
        },
        "footsteps": {
            "flexDirection": "column",
            "width": 187,
            "height": 319,
        },
        "footstep": {
            "position": "absolute",
            "transformOrigin": "top left",
        },
    });
