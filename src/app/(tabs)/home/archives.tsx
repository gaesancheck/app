import { Platform, StyleSheet, TouchableOpacity, View, Text, ScrollView } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, DarkColors, LightColors } from "@/../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { router, useFocusEffect } from "expo-router";
import SelectionDropdown from "@/components/SelectionDropdown";
import userData, { UserData, SAVE_DEFAULT } from "@/modules/userData";
import dayjs from "dayjs";
import { useState, useCallback } from "react";

import SvgCalendar from '@/assets/svg/calendar.svg';
import SvgList from '@/assets/svg/list.svg';
import SvgChevronDown from "@/assets/svg/chevronDown.svg";
import SmallDiary from "@/components/SmallDiary";

export default function Page() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors, safeArea);

    const now = dayjs();
    const [currentYear, setCurrentYear] = useState(now.year());
    const [currentMonth, setCurrentMonth] = useState(now.month());

    const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
    const dayCount = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cellCount = Math.ceil((firstWeekday + dayCount) / 7) * 7;

    const [data, setData] = useState<UserData>(SAVE_DEFAULT);
    const [diary, setDiary] = useState<WalkRecord>();

    useFocusEffect(
        useCallback(() => {
            (async () => {
                setData(await userData.get());
            })();
        }, [])
    );

    return <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerText}>산책 기록</Text>
            <View style={styles.headerItems}>
                <TouchableOpacity hitSlop={7} onPress={() => router.replace("/(tabs)/home")}>
                    <SvgCalendar width={15} height={15} />
                </TouchableOpacity>
                <TouchableOpacity hitSlop={7}>
                    <SvgList width={15} height={15} />
                </TouchableOpacity>
            </View>
        </View>
        <SelectionDropdown
            disabled={data.walkRecords.length === 0}
            value={`${currentYear}-${currentMonth + 1}`}
            options={[...new Set(data.walkRecords.map(v => dayjs(v.date, "YYYYMMDD")).map(v => ({
                "label": `${v.year()}년 ${v.month() + 1}월`,
                "value": `${v.year()}-${v.month() + 1}`
            })))].sort((a, b) => Number(a.value.replace("-", "")) - Number(b.value.replace("-", "")))}
            onChange={(value) => {
                const [year, month] = (value as string).split("-");
                setCurrentYear(Number(year));
                setCurrentMonth(Number(month) - 1);
            }}
            containerStyle={styles.monthTitle}
        >
            <Text style={styles.monthText}>{currentYear}년 {currentMonth + 1}월</Text>
            {data.walkRecords.length > 0 && <SvgChevronDown width={11} height={6} />}
        </SelectionDropdown>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {data.walkRecords.map(v => <SmallDiary
                key={v.id}
                data={v}
            />)}
        </ScrollView>
    </View>;
}

const getStyles = (colors: Colors, safeArea: EdgeInsets) => StyleSheet.create({
    "container": {
        "flex": 1,
        "flexDirection": "column",
        "backgroundColor": colors.background,
        "width": "100%",
        "paddingTop": Platform.select({ "android": safeArea.top + 14, "ios": 76 }),
        "paddingLeft": safeArea.left,
        "paddingRight": safeArea.right
    },
    "header": {
        "flexDirection": "row",
        "justifyContent": "space-between",
        "paddingHorizontal": 32,
    },
    "headerText": {
        "fontFamily": "Ownglyph PDH",
        "color": "#2F3A2D",
        "fontSize": 28
    },
    "headerItems": {
        "flexDirection": "row",
        "gap": 19,
        "alignItems": "center"
    },
    "scrollView": {
        "flex": 1,
        "marginTop": 12,
        "paddingTop": 36
    },
    "content": {
        "paddingBottom": 20,
        "gap": 10
    },
    "monthTitle": {
        "flexDirection": "row",
        "alignItems": "center",
        "justifyContent": "center",
        "gap": 9,
        "marginTop": 23,
    },
    "monthText": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 18,
        "color": "#474747",
    },
});