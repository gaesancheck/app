import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, DarkColors, LightColors } from "@/../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { useState } from "react";
import { router } from "expo-router";

import SvgBG1 from "@/assets/svg/login/asset1.svg";
import SvgBG2 from "@/assets/svg/login/asset2.svg";
import SvgBG3 from "@/assets/svg/login/asset3.svg";
import SvgBG4 from "@/assets/svg/login/asset4.svg";
import SvgFL1 from "@/assets/svg/firstLaunch/asset1.svg";
import SvgFL2 from "@/assets/svg/firstLaunch/asset2.svg";
import SvgFL3 from "@/assets/svg/firstLaunch/asset3.svg";
import SvgFL4 from "@/assets/svg/firstLaunch/asset4.svg";

const SCREENS = [
    {
        "svg": SvgFL1,
        "texts": [
            "매일 산책을 기록하고",
            "일기를 써요!"
        ]
    },
    {
        "svg": SvgFL2,
        "texts": [
            "AI의 추천 코스로",
            "산책을 할 수 있어요."
        ]
    },
    {
        "svg": SvgFL3,
        "texts": [
            "산책 통계로 반려견의",
            "성향을 파악해보세요."
        ]
    },
    {
        "svg": SvgFL4,
        "texts": [
            "긴급 상황시 신속하게",
            "대처할 수 있어요."
        ]
    }
];

export default function Page() {
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors);

    const [step, setStep] = useState(0);

    const SvgImage = SCREENS[step].svg;
    const texts = SCREENS[step].texts;

    return (
        <View style={styles.container}>
            <SvgBG1 style={styles.assetBg1} />
            <SvgBG2 style={styles.assetBg2} />
            <SvgBG3 style={styles.assetBg3} />
            <SvgBG4 style={styles.assetBg4} />
            <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
            <View style={styles.form}>
                <SvgImage style={styles.image} width={Dimensions.get("window").width - 44} height={148} />
                <View style={styles.texts}>
                    {texts.map(v => <Text style={styles.text} key={v}>{v}</Text>)}
                </View>
            </View>
            <View style={styles.progress}>
                <View style={[styles.progressDot, { "backgroundColor": step === 0 ? colors.green_light2 : "#cacaca"}]} />
                <View style={[styles.progressDot, { "backgroundColor": step === 1 ? colors.green_light2 : "#cacaca"}]} />
                <View style={[styles.progressDot, { "backgroundColor": step === 2 ? colors.green_light2 : "#cacaca"}]} />
                <View style={[styles.progressDot, { "backgroundColor": step === 3 ? colors.green_light2 : "#cacaca"}]} />
            </View>
            <Pressable style={styles.button} onPress={() => {
                if (step <= 2) return setStep(v => v + 1);

                router.replace("/login");
            }}>
                <Text style={styles.buttonText}>{step === 3 ? "시작하기" : "다음"}</Text>
            </Pressable>
        </View>
    );
}

const getStyles = (colors: Colors) => StyleSheet.create({
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
        "marginBottom": 30
    },
    "form": {
        "paddingVertical": 68,
        "width": Dimensions.get("window").width - 44,
        "backgroundColor": "#FAFAFA",
        "borderRadius": 20,
        "borderWidth": 1.5,
        "borderColor": colors.green_light2,
        "gap": 50,
        "marginHorizontal": 22,
        "height": 402,
        "flexDirection": "column",
        "alignItems": "center"
    },
    "image": {
        "marginHorizontal": 66
    },
    "texts": {
        "flexDirection": "column",
    },
    "text": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 36,
        "color": "#474747",
        "textAlign": "center"
    },
    "progress": {
        "marginVertical": 32,
        "flexDirection": "row",
        "gap": 7
    },
    "progressDot": {
        "width": 10,
        "height": 10,
        "borderRadius": 5
    },
    "button": {
        "width": Dimensions.get("window").width - 64,
        "marginHorizontal": 32,
        "height": 55,
        "alignItems": "center",
        "justifyContent": "center",
        "borderRadius": 10,
        "backgroundColor": colors.green_light2
    },
    "buttonText": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 25,
        "color": "#fff"
    }
});
