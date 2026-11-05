import { View, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { CareScreen, CareText, CareButton, CareRow, careColors } from "@/components/CareUI";
import { CourseStops } from "@/components/WalkUI";
import { RouteMap } from "@/components/EmergencyUI";
import { courseFor } from "@/modules/walkData";

export default function Page() {
    const course = courseFor();
    return <CareScreen title="산책" back={false} headerGap={17}>
        <View style={styles.course}><CareText style={styles.title}>오늘의 추천 코스</CareText><RouteMap points={course.routes} height={210} /><CourseStops stops={course.stops.slice(0, 2)} />
            <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/walk/recommend")}><CareText style={styles.link}>이 경로로 산책갈래요!</CareText></Pressable>
        </View><View style={styles.statistics}><CareText style={styles.title}>산책 통계 보기</CareText><CareRow title="산책 통계" onPress={() => router.push("/(tabs)/walk/statistics")} /></View>
        <View style={styles.buttons}><CareButton outline onPress={() => router.push("/(tabs)/walk/free")}>자유 경로로 산책하기</CareButton><CareButton onPress={() => router.push("/(tabs)/walk/explore")}>산책 경로 찾기</CareButton></View>
    </CareScreen>;
}
const styles = StyleSheet.create({
    "title": { "fontSize": 20, "color": "#000", "marginBottom": 13 },
    "course": { "paddingHorizontal": 2 },
    "link": { "fontSize": 15, "color": careColors.green, "textAlign": "center", "marginBottom": 18 },
    "statistics": { "borderTopWidth": 0.3, "borderColor": "#9A9A9A", "paddingHorizontal": 13, "paddingTop": 20, "marginHorizontal": -19 },
    "buttons": { "gap": 12, "marginHorizontal": 12, "marginTop": 8 },
});
