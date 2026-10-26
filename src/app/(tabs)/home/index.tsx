import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, DarkColors, LightColors } from "../../../../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";

import SvgSearch from '@/assets/svg/search.svg';
import SvgList from '@/assets/svg/list.svg';
import SvgChevronDown from '@/assets/svg/chevronDown.svg';

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getMonthDays(month: Date) {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const dayCount = new Date(year, monthIndex + 1, 0).getDate();
    const weekCount = Math.max(5, Math.ceil((firstWeekday + dayCount) / 7));

    return Array.from({ "length": weekCount * 7 }, (_, index) => {
        const day = index - firstWeekday + 1;
        return day > 0 && day <= dayCount ? day : null;
    });
}

export default function Page() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors, safeArea);
    const visibleMonth = (() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    })();
    const days = getMonthDays(visibleMonth);

    return <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerText}>산책 기록</Text>
            <View style={styles.headerItems}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="검색" hitSlop={7}>
                    <SvgSearch width={15} height={15} />
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="메뉴" hitSlop={7}>
                    <SvgList width={15} height={15} />
                </TouchableOpacity>
            </View>
        </View>

        <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
        >
            <View style={styles.monthTitle}>
                <Text style={styles.monthText}>
                    {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
                </Text>
                <SvgChevronDown width={11} height={6} />
            </View>

            <View style={styles.weekdayRow}>
                {WEEKDAYS.map((weekday) => (
                    <View key={weekday} style={styles.weekdayCell}>
                        <Text style={styles.weekdayText}>{weekday}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.calendarGrid}>
                {days.map((day, index) => {
                    const selected = day === 1;
                    return <View key={`${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}-${index}`} style={styles.dayCell}>
                        {day === null ? <View style={styles.dayNumberPlaceholder} /> : <>
                            <Text style={styles.dayNumber}>{day}</Text>
                            <View style={[styles.dayCircle, selected ? styles.selectedDayCircle : styles.emptyDayCircle]} />
                        </>}
                    </View>;
                })}
            </View>

            <View style={styles.summaryCard} />
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
    "content": {
        "paddingBottom": 12,
    },
    "scrollView": {
        "flex": 1,
    },
    "header": {
        "flexDirection": "row",
        "justifyContent": "space-between",
        "alignItems": "center",
        "paddingHorizontal": 32,
        "height": 36,
    },
    "headerText": {
        "fontFamily": "ParkDaHyeon",
        "color": "#2F3A2D",
        "fontSize": 28,
    },
    "headerItems": {
        "flexDirection": "row",
        "gap": 19,
        "alignItems": "center",
    },
    "monthTitle": {
        "flexDirection": "row",
        "justifyContent": "center",
        "alignItems": "center",
        "gap": 9,
        "marginTop": 23,
        "height": 24,
    },
    "monthText": {
        "fontFamily": "ParkDaHyeon",
        "fontSize": 18,
        "color": "#474747",
    },
    "weekdayRow": {
        "flexDirection": "row",
        "marginTop": 26,
        "paddingHorizontal": 16,
    },
    "weekdayCell": {
        "flex": 1,
        "alignItems": "center",
        "justifyContent": "center",
        "height": 24,
    },
    "weekdayText": {
        "fontFamily": "ParkDaHyeon",
        "fontSize": 17,
        "color": "#474747",
    },
    "calendarGrid": {
        "flexDirection": "row",
        "flexWrap": "wrap",
        "marginTop": 22,
        "paddingHorizontal": 16,
    },
    "dayCell": {
        "width": `${100 / 7}%`,
        "height": 78,
        "alignItems": "center",
    },
    "dayNumber": {
        "height": 16,
        "fontFamily": "ParkDaHyeon",
        "fontSize": 12,
        "color": "#858780",
        "textAlign": "center",
    },
    "dayNumberPlaceholder": {
        "height": 16,
    },
    "dayCircle": {
        "width": 42,
        "height": 42,
        "borderRadius": 21,
        "marginTop": 1,
    },
    "selectedDayCircle": {
        "backgroundColor": "rgba(102, 140, 108, 0.2)",
        "borderColor": "#688F6E",
        "borderWidth": 1.3,
    },
    "emptyDayCircle": {
        "backgroundColor": "rgba(231, 233, 224, 0.7)",
        "borderColor": "#9A9A9A",
        "borderWidth": 1.3,
        "borderStyle": "dashed",
    },
    "summaryCard": {
        "marginHorizontal": 16,
        "marginTop": -6,
        "height": 150,
        "borderRadius": 12,
        "backgroundColor": "#ECEEE6",
        "borderColor": "#9A9A9A",
        "borderWidth": 0.7,
    },
});
