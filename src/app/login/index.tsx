import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, DarkColors, LightColors } from "@/../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { signInWithOAuth } from "@/modules/oauth";
import type { OAuthProvider } from "@/modules/oauthConfig";
import session from "@/modules/session";
import { APIAuth } from "@/modules/rest/auth";
import { APIOnboarding } from "@/modules/rest/onboarding";

import SvgBG1 from "@/assets/svg/login/asset1.svg";
import SvgBG2 from "@/assets/svg/login/asset2.svg";
import SvgBG3 from "@/assets/svg/login/asset3.svg";
import SvgBG4 from "@/assets/svg/login/asset4.svg";
import SvgApple from "@/assets/icons/apple.svg";
import SvgGoogle from "@/assets/icons/google.svg";
import SvgKakao from "@/assets/icons/kakao.svg";
import SvgNaver from "@/assets/icons/naver.svg";

export default function Page() {
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors);
    const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);
    const loginPending = useRef(false);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            if (!(await session.get())) return;
            const result = await APIOnboarding.getStatus();
            if (active && result.success) {
                router.replace(result.data.needs_onboarding ? "/onboarding" : "/(tabs)/home");
            }
        })()
            .catch(error => {
                if (active)
                    Alert.alert("로그인 상태 확인 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
            })
            .finally(() => {
                if (active) setCheckingSession(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const loginWithProvider = async (provider: OAuthProvider) => {
        if (loginPending.current) return;
        loginPending.current = true;
        setPendingProvider(provider);
        try {
            const result = await signInWithOAuth(provider, false);
            if (result === "cancelled") return;
            const onboarding = await APIOnboarding.getStatus();
            if (!onboarding.success) throw new Error(onboarding.data.message);
            router.replace(onboarding.data.needs_onboarding ? "/onboarding" : "/(tabs)/home");
        } catch (error) {
            router.replace("/login");
            Alert.alert(
                "로그인 실패",
                error instanceof Error ? error.message : "로그인에 실패했습니다. 다시 시도해주세요."
            );
        } finally {
            loginPending.current = false;
            setPendingProvider(null);
        }
    };

    if (checkingSession)
        return (
            <View style={[styles.container, { "justifyContent": "center" }]}>
                <ActivityIndicator color={colors.green_light2} />
            </View>
        );

    return (
        <View style={styles.container}>
            <SvgBG1 style={styles.assetBg1} />
            <SvgBG2 style={styles.assetBg2} />
            <SvgBG3 style={styles.assetBg3} />
            <SvgBG4 style={styles.assetBg4} />
            <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
            <View style={styles.form}>
                <View style={styles.texts}>
                    <Text style={styles.text1}>간편 로그인 후</Text>
                    <Text style={styles.text1}>이용이 가능합니다.</Text>
                </View>
                <Text style={styles.text2}>지금 바로 로그인하고 개산책을 이용해보세요!</Text>
            </View>
            <View style={styles.login}>
                <View style={styles.hr}>
                    <View style={styles.hrLine} />
                    <Text style={styles.hrText}>간편 로그인</Text>
                    <View style={styles.hrLine} />
                </View>
                <View style={styles.options}>
                    {__DEV__ && process.env.EXPO_PUBLIC_ENABLE_DEV_AUTH === "true" && (
                        <Pressable disabled={loginPending.current} style={styles.signInButton} onPress={async () => {
                            if (loginPending.current) return;
                            loginPending.current = true;
                            setCheckingSession(true);
                            try {
                                const response = await APIAuth.devToken();
                                if (!response.success) throw new Error(response.data.message);
                                const data = response.data;
                                await session.set({ "jwt": data.access_token, "needsOnboarding": data.needs_onboarding,
                                    ...(data.expires_in === -1 ? {} : { "expiresAt": Date.now() + data.expires_in * 1000 }) });
                                router.replace(data.needs_onboarding ? "/onboarding" : "/(tabs)/home");
                            } catch (error) {
                                Alert.alert("개발 로그인 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
                            } finally { loginPending.current = false; setCheckingSession(false); }
                        }}><Text>개발 계정으로 로그인</Text></Pressable>
                    )}
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Google로 계속하기"
                        accessibilityState={{
                            "disabled": pendingProvider !== null,
                            "busy": pendingProvider === "google",
                        }}
                        disabled={pendingProvider !== null}
                        style={[
                            styles.signInButton,
                            {
                                "borderColor": "#F0F0F2",
                                "borderWidth": 1,
                                "opacity": pendingProvider !== null ? 0.5 : 1,
                            },
                        ]}
                        onPress={() => void loginWithProvider("google")}
                    >
                        {pendingProvider === "google" ? (
                            <ActivityIndicator color="#000000" />
                        ) : (
                            <SvgGoogle width={27} height={27} />
                        )}
                        <Text style={styles.signInText}>Google로 계속하기</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="카카오로 계속하기"
                        accessibilityState={{
                            "disabled": pendingProvider !== null,
                            "busy": pendingProvider === "kakao",
                        }}
                        disabled={pendingProvider !== null}
                        style={[
                            styles.signInButton,
                            {
                                "backgroundColor": "#FEE500",
                                "opacity": pendingProvider !== null ? 0.5 : 1,
                            },
                        ]}
                        onPress={() => void loginWithProvider("kakao")}
                    >
                        {pendingProvider === "kakao" ? (
                            <ActivityIndicator color="#191919" />
                        ) : (
                            <SvgKakao width={20} height={20} />
                        )}
                        <Text style={[styles.signInText, { "color": "#191919" }]}>카카오로 계속하기</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="네이버로 계속하기"
                        accessibilityState={{
                            "disabled": pendingProvider !== null,
                            "busy": pendingProvider === "naver",
                        }}
                        disabled={pendingProvider !== null}
                        style={[
                            styles.signInButton,
                            {
                                "backgroundColor": "#03C75A",
                                "opacity": pendingProvider !== null ? 0.5 : 1,
                            },
                        ]}
                        onPress={() => void loginWithProvider("naver")}
                    >
                        {pendingProvider === "naver" ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <SvgNaver width={30} height={32} />
                        )}
                        <Text style={[styles.signInText, { "color": "#fff" }]}>네이버로 계속하기</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Apple로 계속하기"
                        accessibilityState={{
                            "disabled": pendingProvider !== null,
                            "busy": pendingProvider === "apple",
                        }}
                        disabled={pendingProvider !== null}
                        style={[
                            styles.signInButton,
                            {
                                "backgroundColor": "#000000",
                                "opacity": pendingProvider !== null ? 0.5 : 1,
                            },
                        ]}
                        onPress={() => void loginWithProvider("apple")}
                    >
                        {pendingProvider === "apple" ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <SvgApple width={30} height={30} />
                        )}
                        <Text style={[styles.signInText, { "color": "#fff" }]}>Apple로 계속하기</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const getStyles = (colors: Colors) =>
    StyleSheet.create({
        "container": {
            "flex": 1,
            "flexDirection": "column",
            "backgroundColor": colors.background,
            "width": "100%",
            "alignItems": "center",
        },
        "assetBg1": {
            "position": "absolute",
            "top": 0,
            "right": -16,
        },
        "assetBg2": {
            "position": "absolute",
            "top": 150,
            "left": -20,
        },
        "assetBg3": {
            "position": "absolute",
            "bottom": -10.43,
            "left": 0,
        },
        "assetBg4": {
            "position": "absolute",
            "bottom": 22,
            "right": 17,
        },
        "logo": {
            "width": 187,
            "height": 147,
            "marginTop": 90,
        },
        "form": {
            "marginTop": 70,
            "flexDirection": "column",
        },
        "texts": {
            "flexDirection": "column",
            "alignItems": "center",
        },
        "text1": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 34,
            "color": "#2f3a2d",
        },
        "text2": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 18,
            "color": "#2f3a2d",
            "marginTop": 25,
        },
        "login": {
            "marginHorizontal": "auto",
            "width": 324,
            "flexDirection": "column",
            "marginTop": 30,
        },
        "hr": {
            "padding": 10,
            "gap": 11,
            "flexDirection": "row",
        },
        "hrLine": {
            "flex": 1,
            "height": 2,
            "backgroundColor": "#D9D9D9",
            "marginVertical": "auto",
        },
        "hrText": {
            "fontFamily": "NanumSquareNeo-Regular",
            "fontSize": 13,
            "color": "#595959",
        },
        "options": {
            "flexDirection": "column",
            "marginTop": 20,
            "gap": 15,
        },
        "signInButton": {
            "borderRadius": 5,
            "width": "100%",
            "flexDirection": "row",
            "gap": 5,
            "justifyContent": "center",
            "alignItems": "center",
            "paddingVertical": 6,
            "height": 41,
        },
        "signInText": {
            "fontFamily": "NanumSquareNeo-Bold",
            "fontSize": 12,
            "color": "#000",
            "height": 14,
        },
    });
