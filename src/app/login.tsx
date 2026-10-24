import { Dimensions, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Colors, DarkColors, LightColors } from "../../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { router } from "expo-router";
import { useState } from "react";


import SvgBG1 from '@/assets/svg/login/asset1.svg';
import SvgBG2 from '@/assets/svg/login/asset2.svg';
import SvgBG3 from '@/assets/svg/login/asset3.svg';
import SvgBG4 from '@/assets/svg/login/asset4.svg';
import SvgBack from '@/assets/svg/back.svg';
import SvgEmail from '@/assets/svg/login/email.svg';
import SvgPassword from '@/assets/svg/login/password.svg';
import CheckBox from "@/components/CheckBox";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
export default function Page() {
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors);

    const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(false);

    const [isLoggingIn, setIsLoggingIn] = useState(false);

    return <View style={styles.container}>
        <SvgBG1 style={styles.assetBg1} />
        <SvgBG2 style={styles.assetBg2} />
        <SvgBG3 style={styles.assetBg3} />
        <SvgBG4 style={styles.assetBg4} />
        <Image source={require("@/assets/images/icon.png")} style={styles.logo} />

        <TouchableOpacity style={styles.backButton} hitSlop={7} onPress={() => router.back()}>
            <SvgBack width={15} height={15} />
        </TouchableOpacity>

        <View style={styles.form}>
            <View style={styles.loginForm}>
                <View style={styles.inputContainer}>
                    <SvgEmail width={17} height={17} />
                    <TextInput
                        style={styles.inputBox}
                        placeholder="아이디를 입력해주세요"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <SvgPassword width={17} height={17} />
                    <TextInput
                        style={styles.inputBox}
                        placeholder="비밀번호를 입력해주세요"
                        placeholderTextColor="#9CA3AF"
                        textContentType="password"
                        secureTextEntry
                    />
                </View>
                <View style={styles.loginOptions}>
                    <TouchableOpacity style={styles.keepMeLoggedIn} hitSlop={7} onPress={() => {
                        impactAsync(ImpactFeedbackStyle.Light);
                        setKeepMeLoggedIn(v => !v);
                    }}>
                        <CheckBox
                            value={keepMeLoggedIn}
                            checkedBackgroundColor="#E4F0E2"
                            checkIconColor="#9CA3AF"
                            style={{
                                "borderRadius": 2.5,
                                "borderColor": "#9CA3AF",
                                "borderWidth": 0.7,
                                "width": 14,
                                "height": 14,
                                "pointerEvents": "none"
                            }}
                        />
                        <Text style={styles.keepMeLoggedInText}>로그인 상태 유지</Text>
                    </TouchableOpacity>
                    <View style={styles.findOptions}>
                        <TouchableOpacity hitSlop={5} onPress={() => {
                            impactAsync(ImpactFeedbackStyle.Light);
                        }}>
                            <Text style={styles.keepMeLoggedInText}>아이디 찾기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity hitSlop={5} onPress={() => {
                            impactAsync(ImpactFeedbackStyle.Light);
                        }}>
                            <Text style={styles.keepMeLoggedInText}>비밀번호 찾기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Pressable style={[styles.loginButton, { "opacity": isLoggingIn ? 0.5 : 1 }]} onPress={async () => {
                    setIsLoggingIn(true);
                }}>
                    <Text style={styles.loginButtonText}>로그인</Text>
                </Pressable>
            </View>
            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>또는 간편 로그인</Text>
                <View style={styles.dividerLine} />
            </View>
        </View>
    </View>;
}

const getStyles = (colors: Colors) => StyleSheet.create({
    "container": {
        "flex": 1,
        "flexDirection": "column",
        "backgroundColor": colors.background,
        "width": "100%",
        "alignItems": "center"
    },
    "form": {
        "paddingHorizontal": 15,
        "paddingVertical": 20,
        "backgroundColor": "#ffffff",
        "width": Dimensions.get("window").width - 44, // marginHorizontal: 22
        "marginTop": 62,
        "borderRadius": 20
    },
    "loginForm": {
        "flexDirection": "column",
        "gap": 13
    },
    "inputContainer": {
        "borderColor": "#D9D9D9",
        "borderStyle": "solid",
        "borderWidth": 1,
        "paddingHorizontal": 10,
        "paddingVertical": 13,
        "flexDirection": "row",
        "gap": 10,
        "alignItems": "center",
        "borderRadius": 5
    },
    "inputBox": {
        "fontFamily": "NanumSquareNeo-Regular",
        "fontSize": 12,
        "width": "100%"
    },
    "assetBg1": {
        "position": "absolute",
        "top": 0,
        "right": -16
    },
    "assetBg2": {
        "position": "absolute",
        "top": 150,
        "left": -20
    },
    "assetBg3": {
        "position": "absolute",
        "bottom": -10.43,
        "left": 0
    },
    "assetBg4": {
        "position": "absolute",
        "bottom": 22,
        "right": 17
    },
    "logo": {
        "width": 187,
        "height": 147,
        "marginTop": 90
    },
    "backButton": {
        "position": "absolute",
        "top": 79.5,
        "left": 35
    },
    "loginOptions": {
        "flexDirection": "row",
        "justifyContent": "space-between",
        "paddingHorizontal": 7
    },
    "keepMeLoggedIn": {
        "flexDirection": "row",
        "alignItems": "center",
        "gap": 7
    },
    "keepMeLoggedInText": {
        "fontFamily": "NanumSquareNeo-Regular",
        "fontSize": 8,
        "color": "#595959"
    },
    "findOptions": {
        "flexDirection": "row",
        "gap": 11
    },
    "loginButton": {
        "backgroundColor": colors.green_light2,
        "paddingVertical": 14,
        "width": "100%",
        "justifyContent": "center",
        "alignItems": "center",
        "borderRadius": 7
    },
    "loginButtonText": {
        "fontFamily": "NanumSquareNeo-Bold",
        "fontSize": 17,
        "color": "#fff"
    },
    "divider": {
        "flexDirection": "row",
        "width": "100%",
        "gap": 11,
        "marginVertical": 17,
        "alignItems": "center"
    },
    "dividerLine": {
        "backgroundColor": "#595959",
        "flex": 1,
        "height": 1
    },
    "dividerText": {
        "fontFamily": "NanumSquareNeo-Regular",
        "fontSize": 8,
        "flexShrink": 0,
        "textAlign": "center"
    }
});
