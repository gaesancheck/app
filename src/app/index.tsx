import { View, StyleSheet, Dimensions, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../app.config";
import Footstep from "@/assets/svg/balzaguk.svg";
import { useEffect } from "react";
import { router } from "expo-router";
import session from "@/modules/session";

export default function Loading() {
    const safeArea = useSafeAreaInsets();

    useEffect(() => {
        let cancelled = false;

        const restoreSession = async () => {
            let loggedIn = false;
            try {
                const savedSession = await session.get();
                loggedIn = savedSession?.userData.loggedIn === true;
            } catch {
                // A session that cannot be read requires signing in again.
            }

            if (!cancelled) {
                router.replace(loggedIn ? "/(tabs)" : "/login");
            }
        };

        void restoreSession();
        return () => { cancelled = true; };
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

const styles = StyleSheet.create({
    "container": {
        "backgroundColor": COLORS.background,
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
