import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import dayjs from "dayjs";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { CareScreen, CareText, careColors, showCareError } from "@/components/CareUI";
import { RouteMap } from "@/components/EmergencyUI";
import { formatDistance } from "@/modules/walkData";
import userData from "@/modules/userData";

const periodLabels = ["주간", "월간", "연간"] as const;
const rates = ["#FFDA00", "#83E725", "#35A24B", "#2E713F", "#122016"];
export default function Page() {
    const [records, setRecords] = useState<WalkRecord[]>([]);
    const [period, setPeriod] = useState<(typeof periodLabels)[number]>("월간");
    const [selected, setSelected] = useState(dayjs().startOf("month"));
    const [picker, setPicker] = useState(false);
    useFocusEffect(
        useCallback(() => {
            let active = true;
            userData
                .get()
                .then(data => {
                    if (active) setRecords(data.walkRecords);
                })
                .catch(showCareError);
            return () => {
                active = false;
            };
        }, [])
    );
    const start =
        period === "주간"
            ? selected.startOf("week")
            : period === "연간"
              ? selected.startOf("year")
              : selected.startOf("month");
    const end = start.add(1, period === "주간" ? "week" : period === "연간" ? "year" : "month");
    const matching = useMemo(
        () =>
            records
                .filter(record => {
                    const date = dayjs(record.date);
                    return !date.isBefore(start) && date.isBefore(end);
                })
                .sort((a, b) => a.date.localeCompare(b.date)),
        [records, start.valueOf(), end.valueOf()]
    );
    const distance = matching.reduce((sum, record) => sum + record.distance, 0);
    const duration = matching.reduce((sum, record) => sum + record.duration, 0);
    const chartWidth = 290;
    const x = (date: string) =>
        28 + Math.max(0, Math.min(1, dayjs(date).diff(start, "day") / Math.max(1, end.diff(start, "day") - 1))) * 245;
    const y = (rate: number) => 120 - (rate - 1) * 21;
    const paths = [...matching]
        .sort((a, b) => b.distance - a.distance)
        .filter(record => record.routes.length > 1)
        .slice(0, 3);
    const shift = (direction: number) =>
        setSelected(previous =>
            previous.add(direction, period === "주간" ? "week" : period === "연간" ? "year" : "month")
        );
    return (
        <CareScreen title="산책 통계" headerGap={22}>
            <View style={styles.tabs}>
                {periodLabels.map(label => (
                    <Pressable
                        key={label}
                        onPress={() => {
                            setPeriod(label);
                            setPicker(false);
                        }}
                        accessibilityRole="tab"
                        accessibilityState={{ "selected": period === label }}
                        style={[styles.tab, period === label && styles.activeTab]}
                    >
                        <CareText style={[styles.tabText, period === label && { "color": careColors.green }]}>
                            {label}
                        </CareText>
                    </Pressable>
                ))}
            </View>
            <View style={styles.month}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="이전 기간"
                    onPress={() => shift(-1)}
                    hitSlop={12}
                >
                    <CareText>‹</CareText>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => setPicker(!picker)}>
                    <CareText>
                        {period === "연간"
                            ? selected.format("YYYY년")
                            : period === "주간"
                              ? `${start.format("M월 D일")} - ${end.subtract(1, "day").format("M월 D일")}`
                              : selected.format("YYYY년 M월")}{" "}
                        ⌄
                    </CareText>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="다음 기간"
                    onPress={() => shift(1)}
                    hitSlop={12}
                >
                    <CareText>›</CareText>
                </Pressable>
            </View>
            {picker && (
                <View style={styles.picker}>
                    {Array.from({ "length": 12 }, (_, index) => dayjs().subtract(index, "month")).map(month => (
                        <Pressable
                            accessibilityRole="button"
                            key={month.format("YYYYMM")}
                            onPress={() => {
                                setSelected(month.startOf("month"));
                                setPicker(false);
                            }}
                            style={styles.monthOption}
                        >
                            <CareText
                                style={{ "color": selected.isSame(month, "month") ? careColors.green : "#848484" }}
                            >
                                {month.format("YYYY년 M월")}
                            </CareText>
                        </Pressable>
                    ))}
                </View>
            )}
            <View style={styles.card}>
                <CareText style={styles.label}>산책 흐름</CareText>
                <View style={{ "flexDirection": "row", "marginTop": 12 }}>
                    <View style={{ "gap": 6, "justifyContent": "center" }}>
                        {rates.map((color, index) => (
                            <View
                                key={color}
                                accessibilityLabel={`산책 기분 ${5 - index}점`}
                                style={{ "width": 17, "height": 17, "borderRadius": 9, "backgroundColor": color }}
                            />
                        ))}
                    </View>
                    <Svg width="90%" height={145} viewBox={`0 0 ${chartWidth} 145`}>
                        {Array.from({ "length": 7 }, (_, index) => (
                            <Line
                                key={index}
                                x1={28 + (index * 245) / 6}
                                x2={28 + (index * 245) / 6}
                                y1={35}
                                y2={120}
                                stroke="#D0D0D0"
                                strokeWidth={0.7}
                            />
                        ))}
                        {matching.length > 1 && (
                            <Polyline
                                points={matching.map(record => `${x(record.date)},${y(record.rate)}`).join(" ")}
                                fill="none"
                                stroke="#688F6E"
                                strokeWidth={1}
                            />
                        )}
                        {matching.map(record => (
                            <Circle
                                key={record.id}
                                cx={x(record.date)}
                                cy={y(record.rate)}
                                r={3}
                                fill={rates[5 - record.rate]}
                                onPress={() =>
                                    router.push({ "pathname": "/(tabs)/home/write", "params": { "id": record.id } })
                                }
                            />
                        ))}
                        {Array.from({ "length": 7 }, (_, index) => (
                            <SvgText
                                key={index}
                                x={28 + (index * 245) / 6}
                                y={138}
                                fontSize={8}
                                textAnchor="middle"
                                fill="#6E6E6E"
                            >
                                {start
                                    .add(Math.round((index * (end.diff(start, "day") - 1)) / 6), "day")
                                    .format(period === "연간" ? "M월" : "M/D")}
                            </SvgText>
                        ))}
                    </Svg>
                </View>
                {!matching.length && <CareText style={styles.empty}>이 기간에 기록한 산책이 없어요.</CareText>}
            </View>
            <View style={styles.card}>
                <CareText style={styles.label}>산책 요약</CareText>
                <View style={styles.summary}>
                    {[
                        { "label": "총 산책 횟수", "value": `${matching.length}회` },
                        { "label": "총 이동 거리", "value": formatDistance(distance) },
                        {
                            "label": "총 산책 시간",
                            "value":
                                duration >= 3600
                                    ? `${(duration / 3600).toFixed(1)}시간`
                                    : `${Math.floor(duration / 60)}분`,
                        },
                    ].map(item => (
                        <View key={item.label} style={styles.summaryItem}>
                            <CareText style={{ "fontSize": 11 }}>{item.label}</CareText>
                            <CareText style={{ "fontSize": 25 }}>{item.value}</CareText>
                        </View>
                    ))}
                </View>
            </View>
            <View style={styles.card}>
                <CareText style={styles.label}>주요 이동경로</CareText>
                {paths.length ? (
                    paths.map(record => (
                        <Pressable
                            key={record.id}
                            accessibilityRole="button"
                            onPress={() =>
                                router.push({ "pathname": "/(tabs)/home/write", "params": { "id": record.id } })
                            }
                            style={{ "marginTop": 14 }}
                        >
                            <RouteMap points={record.routes} height={150} />
                            <CareText>
                                {record.destination} · {formatDistance(record.distance)}
                            </CareText>
                        </Pressable>
                    ))
                ) : (
                    <View style={{ "minHeight": 135, "justifyContent": "center", "alignItems": "center" }}>
                        <CareText style={styles.empty}>산책을 기록하면 이동 경로를 볼 수 있어요.</CareText>
                    </View>
                )}
            </View>
        </CareScreen>
    );
}
const styles = StyleSheet.create({
    "tabs": {
        "flexDirection": "row",
        "justifyContent": "space-around",
        "marginBottom": 28,
    },
    "tab": {
        "width": 72,
        "borderBottomWidth": 1,
        "borderColor": "#848F83",
        "alignItems": "center",
        "paddingBottom": 8,
    },
    "activeTab": {
        "borderColor": careColors.green,
        "borderBottomWidth": 1.5,
    },
    "tabText": {
        "fontSize": 20,
        "color": "#6E786C",
    },
    "month": {
        "flexDirection": "row",
        "justifyContent": "center",
        "alignItems": "center",
        "gap": 25,
        "marginBottom": 30,
    },
    "picker": {
        "backgroundColor": "#FFF",
        "borderWidth": 0.5,
        "borderColor": "#9A9A9A",
        "borderRadius": 8,
        "flexDirection": "row",
        "flexWrap": "wrap",
        "padding": 8,
        "marginBottom": 15,
    },
    "monthOption": {
        "width": "33.33%",
        "paddingVertical": 8,
        "alignItems": "center",
    },
    "card": {
        "borderWidth": 0.7,
        "borderColor": "#9A9A9A",
        "borderRadius": 10,
        "backgroundColor": "#FAFBF7",
        "padding": 15,
        "marginBottom": 12,
    },
    "label": {
        "fontSize": 15,
    },
    "summary": {
        "flexDirection": "row",
        "gap": 10,
        "marginTop": 20,
        "marginBottom": 3,
    },
    "summaryItem": {
        "flex": 1,
        "backgroundColor": "#ECEEE6",
        "borderWidth": 0.5,
        "borderColor": "#9A9A9A",
        "borderRadius": 5,
        "padding": 7,
        "gap": 7,
    },
    "empty": {
        "fontSize": 13,
        "color": "#848484",
        "textAlign": "center",
        "marginTop": 8,
    },
});
