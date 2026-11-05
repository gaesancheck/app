import { View, StyleSheet } from "react-native";
import { CareText } from "./CareUI";
import Clock from "@/assets/svg/walk/clock.svg";
import Map from "@/assets/svg/walk/map.svg";
import Pin from "@/assets/svg/walk/pin.svg";
import { formatDistance, formatTime } from "@/modules/walkData";

export function WalkMetrics({ seconds = 0, distance = 0, destination = "없음" }: { seconds?: number; distance?: number; destination?: string }) {
    return <View style={{ "marginVertical": 12, "gap": 15 }}><CareText style={{ "fontSize": 15 }}>산책 기록</CareText><View style={styles.metrics}>
        {[{ "label": "산책 시간", "value": formatTime(seconds), "Icon": Clock }, { "label": "이동 거리", "value": formatDistance(distance), "Icon": Map }, { "label": "주요 목적지", "value": destination, "Icon": Pin }].map(({ label, value, Icon }, index) => <View key={label} style={[styles.metric, index > 0 && styles.divider]}><View style={styles.label}><Icon /><CareText style={{ "fontSize": 14 }}>{label}</CareText></View><CareText style={{ "fontSize": index === 2 && value.length > 5 ? 20 : 29, "textAlign": "center" }}>{value}</CareText></View>)}
    </View></View>;
}
export function CourseStops({ stops }: { stops: string[] }) {
    return <View style={{ "gap": 16, "marginBottom": 15 }}>{stops.map((stop, index) => <View key={`${stop}-${index}`} style={{ "flexDirection": "row", "gap": 12, "alignItems": "flex-start" }}><View style={styles.number}><CareText style={{ "fontSize": 15 }}>{index + 1}</CareText></View><View><CareText style={{ "fontSize": 18, "color": "#1E1E1E" }}>{stop}</CareText><CareText style={{ "fontSize": 11, "marginTop": 3 }}>산책 코스 경유지</CareText></View></View>)}</View>;
}
const styles = StyleSheet.create({
    "metrics": { "flexDirection": "row", "alignItems": "center", "justifyContent": "space-between" },
    "metric": { "flex": 1, "gap": 3, "paddingHorizontal": 5 },
    "divider": { "borderLeftColor": "#D0D0D0", "borderLeftWidth": 0.7 },
    "label": { "flexDirection": "row", "gap": 6, "alignItems": "center", "justifyContent": "center" },
    "number": { "width": 20, "height": 20, "borderRadius": 10, "backgroundColor": "#E2E2E2", "alignItems": "center", "justifyContent": "center" },
});
