import { useCallback, useState } from "react";
import { Platform, View, StyleSheet, TouchableOpacity, Pressable, ScrollView, Image, Text } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, DarkColors, LightColors } from "@/../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { useFocusEffect } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import userData from "@/modules/userData";

import SvgSearch from '@/assets/svg/search.svg';
import SvgList from '@/assets/svg/list.svg';
import SvgChevronDown from "@/assets/svg/chevronDown.svg";
import SvgVeryGood from "@/assets/svg/dogs/verygood.svg";
import SvgGood from "@/assets/svg/dogs/good.svg";
import SvgNormal from "@/assets/svg/dogs/normal.svg";
import SvgSad from "@/assets/svg/dogs/sad.svg";
import SvgAngry from "@/assets/svg/dogs/angry.svg";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const DOGS = { "5": SvgVeryGood, "4": SvgGood, "3": SvgNormal, "2": SvgSad, "1": SvgAngry };
const WEATHER = {
    "cloudy": "☁️", "partly_cloudy": "🌤️", "mostly_cloudy": "⛅️",
    "clear": "☀️", "rainy": "🌧️", "thunder": "⛈️", "snowy": "❄️",
};

function dateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDate(value: string) {
    return new Date(value.length === 10 ? `${value}T00:00:00` : value);
}

export default function Page() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors, safeArea);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = dateKey(now);
    const firstWeekday = new Date(year, month, 1).getDay();
    const dayCount = new Date(year, month + 1, 0).getDate();
    const cellCount = Math.ceil((firstWeekday + dayCount) / 7) * 7;
    const [selectedDate, setSelectedDate] = useState(today);
    const [records, setRecords] = useState<WalkRecord[]>([]);
    const [loadError, setLoadError] = useState(false);

    useFocusEffect(useCallback(() => {
        let active = true;
        setLoadError(false);
        userData.get().then((data) => {
            if (active) setRecords(Array.isArray(data.walkRecords) ? data.walkRecords : []);
        }).catch(() => {
            if (active) {
                setRecords([]);
                setLoadError(true);
            }
        });
        return () => { active = false; };
    }, []));

    const recordsByDate = new Map<string, WalkRecord[]>();
    for (const record of records) {
        const date = parseDate(record.date);
        if (Number.isNaN(date.getTime())) continue;
        const key = dateKey(date);
        const entries = recordsByDate.get(key) ?? [];
        entries.push(record);
        recordsByDate.set(key, entries);
    }
    const selectedRecords = recordsByDate.get(selectedDate) ?? [];
    const selected = parseDate(selectedDate);

    return <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerText}>산책 기록</Text>
            <View style={styles.headerItems}>
                <TouchableOpacity hitSlop={7}>
                    <SvgSearch width={15} height={15} />
                </TouchableOpacity>
                <TouchableOpacity hitSlop={7}>
                    <SvgList width={15} height={15} />
                </TouchableOpacity>
            </View>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.monthTitle}>
                <Text style={styles.monthText}>{year}년 {month + 1}월</Text>
                <SvgChevronDown width={11} height={6} />
            </View>
            <View style={styles.calendar}>
                <View style={styles.weekdays}>
                    {WEEKDAYS.map((weekday) => <Text key={weekday} style={styles.weekday}>{weekday}</Text>)}
                </View>
                <View style={styles.grid}>
                    {Array.from({ "length": cellCount }, (_, index) => {
                        const day = index - firstWeekday + 1;
                        if (day < 1 || day > dayCount) return <View key={`blank-${index}`} style={styles.dayCell} />;
                        const key = dateKey(new Date(year, month, day));
                        const isToday = key === today;
                        const record = recordsByDate.get(key)?.[0];
                        const Dog = record ? DOGS[record.rate] ?? SvgNormal : null;
                        return <Pressable
                            key={key}
                            style={styles.dayCell}
                            accessibilityRole="button"
                            accessibilityLabel={`${month + 1}월 ${day}일${record ? ", 산책 기록 있음" : ""}${isToday ? ", 오늘" : ""}`}
                            accessibilityState={{ "selected": selectedDate === key }}
                            onPress={() => setSelectedDate(key)}
                        >
                            <Text style={styles.dayNumber}>{day}</Text>
                            <View style={styles.dayCircle}>
                                <Svg width={43} height={43} viewBox="0 0 43 43" style={styles.circleBackground}>
                                    <Circle
                                        cx={21.5} cy={21.5} r={20.85}
                                        fill={isToday ? "#668C6C" : "#E7E9E0"}
                                        fillOpacity={isToday ? 0.2 : 0.7}
                                        stroke={isToday ? "#688F6E" : "#9A9A9A"}
                                        strokeWidth={1.3}
                                        strokeDasharray={isToday ? undefined : "2 2"}
                                    />
                                </Svg>
                                {Dog && <Dog width={36} height={35} />}
                            </View>
                        </Pressable>;
                    })}
                </View>
            </View>
            {selectedRecords.length ? selectedRecords.map((record) => <View key={record.id} style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                    {record.picture && <Image source={{ "uri": record.picture }} style={styles.summaryPhoto} accessibilityLabel="산책 사진" />}
                    <View style={styles.summaryDetails}>
                        <Text style={styles.summaryDate}>{String(year).slice(-2)}년 {selected.getMonth() + 1}월 {selected.getDate()}일 {WEEKDAYS[selected.getDay()]}요일</Text>
                        {record.weather && <Text style={styles.weather}>{WEATHER[record.weather]}</Text>}
                    </View>
                </View>
                <Text style={styles.summaryText}>{record.content}</Text>
            </View>) : <View style={styles.emptySummary}>
                <Text style={styles.emptyText}>{loadError ? "산책 기록을 불러오지 못했어요." : "작성한 산책 기록이 없어요."}</Text>
            </View>}
        </ScrollView>
    </View>;
}

const getStyles = (colors: Colors, safeArea: EdgeInsets) => StyleSheet.create({
    "container": {
        "flex": 1,
        "backgroundColor": colors.background,
        "width": "100%",
        "paddingTop": Platform.select({ "android": safeArea.top + 14, "ios": 76 }),
        "paddingLeft": safeArea.left,
        "paddingRight": safeArea.right,
    },
    "scrollView": { "flex": 1 },
    "content": { "paddingBottom": 20 },
    "monthTitle": { "flexDirection": "row", "alignItems": "center", "justifyContent": "center", "gap": 9, "marginTop": 23 },
    "monthText": { "fontFamily": "ParkDaHyeon", "fontSize": 18, "color": "#474747" },
    "calendar": { "marginHorizontal": 16, "marginTop": 26 },
    "weekdays": { "flexDirection": "row", "height": 20 },
    "weekday": { "width": `${100 / 7}%`, "textAlign": "center", "fontFamily": "ParkDaHyeon", "fontSize": 18, "color": "#474747" },
    "grid": { "flexDirection": "row", "flexWrap": "wrap", "marginTop": 22 },
    "dayCell": { "width": `${100 / 7}%`, "height": 78, "alignItems": "center" },
    "dayNumber": { "height": 19, "fontFamily": "ParkDaHyeon", "fontSize": 12, "color": "#858780", "textAlign": "center" },
    "dayCircle": { "width": 43, "height": 43, "alignItems": "center", "justifyContent": "center" },
    "circleBackground": { "position": "absolute", "top": 0, "left": 0 },
    "summaryCard": { "marginHorizontal": 19, "marginTop": 12, "minHeight": 197, "padding": 16, "borderRadius": 12, "backgroundColor": "#FAFBF7", "borderWidth": 0.7, "borderColor": "#9A9A9A" },
    "summaryHeader": { "flexDirection": "row", "gap": 10, "marginBottom": 10 },
    "summaryPhoto": { "width": 85, "height": 85, "borderRadius": 12 },
    "summaryDetails": { "flex": 1, "gap": 16 },
    "summaryDate": { "fontFamily": "ParkDaHyeon", "fontSize": 14, "color": "#252525" },
    "weather": { "fontSize": 20 },
    "summaryText": { "fontFamily": "ParkDaHyeon", "fontSize": 16, "lineHeight": 25, "color": "#474747" },
    "emptySummary": { "marginHorizontal": 16, "minHeight": 150, "borderRadius": 12, "backgroundColor": "#ECEEE6", "borderWidth": 0.7, "borderColor": "#9A9A9A", "justifyContent": "center", "alignItems": "center" },
    "emptyText": { "fontFamily": "ParkDaHyeon", "fontSize": 16, "color": "#858780" },
    "header": {
        "flexDirection": "row",
        "justifyContent": "space-between",
        "paddingHorizontal": 32
    },
    "headerText": {
        "fontFamily": "ParkDaHyeon",
        "color": "#2F3A2D",
        "fontSize": 28
    },
    "headerItems": {
        "flexDirection": "row",
        "gap": 19,
        "alignItems": "center"
    }
});