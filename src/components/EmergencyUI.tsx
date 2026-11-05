import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useIsFocused } from "expo-router";
import { router } from "expo-router";
import dayjs from "dayjs";
import KakaoMapView from "../../modules/kakao-map";
import { CareText, careColors, ui } from "./CareUI";
import type { MissingPet, Pet } from "@/modules/careData";
import Expand from "@/assets/svg/account-emergency/expand.svg";
import { LightColors } from "../../app.config";

export const emergencySections = [
    { "key": "missing", "label": "실종동물", "route": "/(tabs)/emergency" },
    { "key": "checklist", "label": "체크리스트", "route": "/(tabs)/emergency/checklist" },
    { "key": "routes", "label": "예상 이동 경로", "route": "/(tabs)/emergency/routes" },
    { "key": "sent", "label": "보낸 제보", "route": "/(tabs)/emergency/reports" },
    { "key": "received", "label": "들어온 제보", "route": "/(tabs)/emergency/reports" },
    { "key": "shelters", "label": "유기견 보호소에서 찾기", "route": "/(tabs)/emergency/shelters" },
    { "key": "stop", "label": "실종모드 종료", "route": "/(tabs)/emergency/stop" },
] as const;
export function EmergencyNav({ active, enabled }: { active: string; enabled: boolean }) {
    const options = enabled ? emergencySections : [emergencySections[0], emergencySections[3], { "key": "start", "label": "긴급모드 켜기", "route": "/(tabs)/emergency/start" } as const];
    return <View style={styles.nav}>{options.map(item => <Pressable key={item.key} accessibilityRole="button" accessibilityState={{ "selected": active === item.key }} onPress={() => {
        if (active === item.key) return;
        if (item.key === "received" || item.key === "sent") router.navigate({ "pathname": "/(tabs)/emergency/reports", "params": { "received": item.key === "received" ? "1" : "0" } });
        else router.navigate(item.route);
    }} style={[styles.tab, active === item.key && styles.activeTab]}><CareText style={[styles.tabText, active === item.key && styles.activeTabText]}>{item.label}</CareText></Pressable>)}</View>;
}
export function PetCard({ pet, missing, onReport }: { pet: Pet; missing?: MissingPet; onReport?: () => void }) {
    return <View style={ui.card}>
        {missing && <View style={styles.cardHeader}><View style={ui.pill}><CareText style={{ "fontSize": 15, "color": careColors.green }}>실종된 지 {Math.max(1, dayjs().diff(dayjs(missing.missingSince), "day") + 1)}일째</CareText></View>
            {onReport && <Pressable onPress={onReport} accessibilityRole="button" hitSlop={8}><CareText style={{ "fontSize": 15, "color": "#E36163", "textDecorationLine": "underline" }}>제보하기</CareText></Pressable>}
        </View>}
        <View style={styles.petRow}>{pet.picture ? <Image source={{ "uri": pet.picture }} style={styles.picture} /> : <View style={styles.picture} />}
            <View style={{ "gap": 5, "paddingTop": 4 }}><CareText style={styles.detail}>이름: {pet.name}</CareText><CareText style={styles.detail}>성별: {pet.gender === "female" ? "여자" : "남자"}</CareText><CareText style={styles.detail}>나이: {pet.age}살</CareText><CareText style={styles.detail}>중성화 여부: {pet.neutering ? "O" : "X"}</CareText></View>
        </View>
        {missing && <CareText style={styles.description}>마지막 실종 위치와 시각: {missing.lastPosition} / {missing.lastTime}</CareText>}
        <CareText style={styles.description}>특징: {pet.specials || "등록된 특징이 없어요"}</CareText>
    </View>;
}
export function RouteMap({ points = [], height = 210 }: { points?: EmergencyMapRoute; height?: number }) {
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState("");
    const focused = useIsFocused();
    const key = String(Constants.expoConfig?.extra?.kakaoNativeAppKey ?? "");
    const map = (full: boolean) => <View style={{ "flex": full ? 1 : undefined, "height": full ? undefined : height, "borderRadius": 12, "overflow": "hidden", "backgroundColor": "#272727", "marginBottom": full ? 0 : 12 }}>
        {key && !error ? <KakaoMapView style={StyleSheet.absoluteFill} appKey={key} active={focused && (full || !expanded)} routeCoordinates={points} onMapError={event => setError(event.nativeEvent.message)} /> : <View style={{ "flex": 1, "alignItems": "center", "justifyContent": "center", "padding": 20 }}><CareText style={{ "color": "#FFF", "textAlign": "center" }}>{"지도를 불러오지 못했어요. 잠시 후 다시 시도해주세요."}</CareText></View>}
        <SafeAreaView pointerEvents="box-none" edges={full ? ["bottom", "right", "left"] : []} style={[StyleSheet.absoluteFill, styles.mapControls]}>
            <Pressable accessibilityRole="button" accessibilityLabel={full ? "지도 닫기" : "지도 확대"} onPress={() => setExpanded(!full)} style={styles.mapButton}>{full ? <CareText>×</CareText> : <Expand />}</Pressable>
        </SafeAreaView>
    </View>;
    return <>{map(false)}<Modal visible={expanded} animationType="slide" onRequestClose={() => setExpanded(false)}><SafeAreaProvider>{map(true)}</SafeAreaProvider></Modal></>;
}
const styles = StyleSheet.create({
    "mapControls": { "padding": 12, "alignItems": "flex-end", "justifyContent": "flex-end" },
    "mapButton": { "width": 30, "height": 30, "borderRadius": 15, "alignItems": "center", "justifyContent": "center", "backgroundColor": LightColors.green_light1 },
    "nav": { "flexDirection": "row", "flexWrap": "wrap", "gap": 10, "marginHorizontal": 13, "marginBottom": 23 },
    "tab": { "borderRadius": 20, "paddingHorizontal": 10, "paddingVertical": 4, "backgroundColor": "#E2E2E2" },
    "activeTab": { "backgroundColor": "#474747" },
    "tabText": { "fontSize": 15, "color": "#848484" },
    "activeTabText": { "color": "#FAFBF7" },
    "cardHeader": { "flexDirection": "row", "alignItems": "center", "justifyContent": "space-between", "marginBottom": 10, "gap": 8 },
    "petRow": { "flexDirection": "row", "gap": 10 },
    "picture": { "width": 85, "height": 85, "borderRadius": 12, "backgroundColor": "#ECEEE6", "borderColor": "#9A9A9A", "borderWidth": 0.7 },
    "detail": { "fontSize": 14, "color": "#000" },
    "description": { "fontSize": 16, "lineHeight": 25, "marginTop": 10, "alignSelf": "flex-start", "borderBottomWidth": 0.7, "borderStyle": "dotted", "borderColor": "#474747" },
});
