import { StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import KakaoMap from "../../../modules/kakao-map";
import { useState } from "react";

const nativeAppKey = Constants.expoConfig?.extra?.kakaoNativeAppKey;

export default function Page() {
    const [attempt, setAttempt] = useState(0);

    return <View style={{ flex: 1 }}>
        <KakaoMap
            key={attempt}
            style={styles.container}
            appKey={nativeAppKey}
            active
            onMapError={({ nativeEvent }) => {
                if (__DEV__) console.warn("Kakao Map:", nativeEvent.message);
            }}
        />
    </View>;
}

const styles = StyleSheet.create({
    container: { flex: 1 }
});
