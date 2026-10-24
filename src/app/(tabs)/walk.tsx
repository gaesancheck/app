import { useIsFocused } from "expo-router";
import Constants from "expo-constants";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import KakaoMapView from "../../../modules/kakao-map";

const configuredKey: unknown = Constants.expoConfig?.extra?.kakaoNativeAppKey;
const appKey = typeof configuredKey === "string" ? configuredKey.trim() : "";

export default function Page() {
    const focused = useIsFocused();
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    if (!appKey) {
        return <View style={styles.message}><Text>지도를 준비 중입니다.</Text></View>;
    }

    return <View style={styles.container}>
        {!error && <KakaoMapView
            key={attempt}
            style={styles.container}
            appKey={appKey}
            active={focused}
            onMapError={({ nativeEvent }) => {
                if (__DEV__) console.warn("Kakao Map:", nativeEvent.message);
                setError(true);
            }}
        />}
        {error && <View style={styles.message}>
            <Text>지도를 불러오지 못했어요.</Text>
            <Pressable accessibilityRole="button" style={styles.retry} onPress={() => {
                setAttempt(value => value + 1);
                setError(false);
            }}>
                <Text>다시 시도</Text>
            </Pressable>
        </View>}
    </View>;
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    message: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
    retry: { padding: 16 },
});
