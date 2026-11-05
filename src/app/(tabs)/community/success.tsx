import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/CommunityUI";
import SvgCheck from "@/assets/svg/community-success.svg";
export default function Page() {
    const inset = useSafeAreaInsets();
    const styles = getStyles(inset.top);
    const { id } = useLocalSearchParams<{ "id": string }>();
    return (
        <View style={styles.container}>
            <Header title="게시물 작성 완료" />
            <View style={styles.body}>
                <View style={styles.check}>
                    <SvgCheck />
                </View>
                <Text style={styles.title}>게시물 작성이 완료되었어요!</Text>
                <Pressable
                    style={styles.link}
                    onPress={() => router.replace({ "pathname": "/community/[id]", "params": { "id": id } })}
                >
                    <Text style={styles.linkText}>내 게시물 확인하러가기 〉</Text>
                </Pressable>
            </View>
            <Pressable style={styles.button} onPress={() => router.replace("/community/write")}>
                <Text style={styles.buttonText}>새 게시물 작성하기</Text>
            </Pressable>
        </View>
    );
}
const getStyles = (top: number) =>
    StyleSheet.create({
        "container": {
            "flex": 1,
            "paddingTop": top + 14,
            "backgroundColor": "#F7F8F3",
            "paddingBottom": 28,
        },
        "body": {
            "flex": 1,
            "alignItems": "center",
            "justifyContent": "center",
            "paddingBottom": 80,
        },
        "check": {
            "width": 100,
            "height": 100,
            "backgroundColor": "#688F6E",
            "borderRadius": 50,
            "alignItems": "center",
            "justifyContent": "center",
            "marginBottom": 32,
        },
        "title": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 28,
            "color": "#2F3A2D",
        },
        "link": {
            "borderWidth": 1,
            "borderColor": "#9CA3AF",
            "borderRadius": 30,
            "paddingHorizontal": 20,
            "paddingVertical": 12,
            "marginTop": 42,
        },
        "linkText": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 17,
            "color": "#9CA3AF",
        },
        "button": {
            "marginHorizontal": 31,
            "height": 55,
            "backgroundColor": "#688F6E",
            "borderRadius": 10,
            "alignItems": "center",
            "justifyContent": "center",
        },
        "buttonText": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 25,
            "color": "white",
        },
    });
