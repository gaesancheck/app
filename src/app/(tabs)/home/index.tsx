import { useCallback, useState } from "react";
import { Platform, View, StyleSheet, TouchableOpacity, ScrollView, Text, Pressable } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, DarkColors, LightColors } from "@/../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { router, useFocusEffect } from "expo-router";
import userData, { SAVE_DEFAULT, UserData } from "@/modules/userData";
import dayjs from 'dayjs';
import Dropdown from "@/components/Dropdown";
import SelectionDropdown from "@/components/SelectionDropdown";
import { haptics } from "@/modules/haptics";
import SmallDiary from "@/components/SmallDiary";

import SvgArchive from '@/assets/svg/archive.svg';
import SvgList from '@/assets/svg/list.svg';
import SvgChevronDown from "@/assets/svg/chevronDown.svg";
import SvgVeryGood from "@/assets/svg/dogs/verygood.svg";
import SvgGood from "@/assets/svg/dogs/good.svg";
import SvgNormal from "@/assets/svg/dogs/normal.svg";
import SvgSad from "@/assets/svg/dogs/sad.svg";
import SvgAngry from "@/assets/svg/dogs/angry.svg";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const DOGS = { "5": SvgVeryGood, "4": SvgGood, "3": SvgNormal, "2": SvgSad, "1": SvgAngry };

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
    const [isDeletingMode, setIsDeletingMode] = useState(false);

    useFocusEffect(
        useCallback(() => {
            (async () => {
                const fresh = await userData.get();
                setData(fresh);
                setDiary(current => current ? fresh.walkRecords.find(item => item.id === current.id) : undefined);
            })();
        }, [])
    );

    return <>
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>산책 기록</Text>
                <View style={styles.headerItems}>
                    <TouchableOpacity hitSlop={7} onPress={() => router.replace("/(tabs)/home/archives")}>
                        <SvgArchive width={15} height={15} />
                    </TouchableOpacity>
                    <Dropdown
                        hitSlop={7}
                        viewType="touchableopacity"
                        options={[
                            { "label": "검색하기", "onPress": () => router.push("/(tabs)/home/search") },
                            (isDeletingMode ? {
                                "label": "삭제 취소",
                                "onPress": () => setIsDeletingMode(false)
                            } : {
                                "label": "일기 삭제",
                                "onPress": () => setIsDeletingMode(true)
                            }),
                        ]}
                    >
                        <SvgList width={15} height={15} />
                    </Dropdown>
                </View>
            </View>
            <SelectionDropdown
                disabled={data.walkRecords.length === 0}
                value={`${currentYear}-${currentMonth + 1}`}
                options={[...new Set(data.walkRecords.map(v => dayjs(v.date, "YYYYMMDD").format("YYYY-MM")))].sort().map(month => ({
                    "label": dayjs(month).format("YYYY년 M월"),
                    "value": dayjs(month).format("YYYY-M"),
                }))}
                onChange={(value) => {
                    const [year, month] = (value as string).split("-");
                    setDiary(undefined);
                    setCurrentYear(Number(year));
                    setCurrentMonth(Number(month) - 1);
                }}
                containerStyle={styles.monthTitle}
            >
                <Text style={styles.monthText}>{currentYear}년 {currentMonth + 1}월</Text>
                {data.walkRecords.length > 0 && <SvgChevronDown width={11} height={6} />}
            </SelectionDropdown>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.calendar}>
                    <View style={styles.weekdays}>
                        {WEEKDAYS.map((weekday) => <Text key={weekday} style={styles.weekday}>{weekday}</Text>)}
                    </View>
                    <View style={styles.grid}>
                        {Array.from({ "length": cellCount }, (_, i) => {
                            const day = i - firstWeekday + 1;
                            const isOutsideMonth = day < 1 || day > dayCount;
                            const isToday = day === now.date() && currentMonth === now.month() && currentYear === now.year();

                            if (isOutsideMonth) return <View key={`calendar-${i}`} style={styles.dayCell} />

                            const diary = data.walkRecords.find(v => dayjs(new Date(currentYear, currentMonth, day)).format("YYYYMMDD") === v.date
                            );
                            const Dog = diary ? DOGS[diary.rate] ?? SvgNormal : null;

                            return <View
                                key={`calendar-${i}`}
                                style={styles.dayCell}
                            >
                                <Text style={styles.dayNumber}>{isOutsideMonth ? "" : day}</Text>
                                {!diary ?
                                    <Pressable
                                        style={isToday ? styles.dayCircleActive : styles.dayCircleInactive}
                                        onPress={() => { haptics.light(); router.push({ "pathname": "/(tabs)/home/write", "params": { "date": dayjs(new Date(currentYear, currentMonth, day)).format("YYYYMMDD") } }); }}
                                    /> :
                                    <Pressable onPress={() => {
                                        haptics.light();
                                        setDiary(diary);
                                    }}>
                                        {Dog && <Dog />}
                                    </Pressable>
                                }
                            </View>;
                        })}
                    </View>
                </View>
                {diary && <View style={styles.diaryContainer}>
                    <View style={styles.diaryDoneSlot}>
                        {isDeletingMode && <TouchableOpacity
                            accessibilityRole="button"
                            style={styles.diaryDoneButton}
                            onPress={() => {
                                haptics.light();
                                setIsDeletingMode(false);
                            }}
                        >
                            <Text style={styles.diaryDoneText}>완료</Text>
                        </TouchableOpacity>}
                    </View>
                    <SmallDiary
                        showDeleteButton={isDeletingMode}
                        data={diary}
                        onPressContent={() => router.push({ "pathname": "/(tabs)/home/write", "params": { "recordId": diary.id, "field": "content" } })}
                        onPressPicture={() => router.push({ "pathname": "/(tabs)/home/write", "params": { "recordId": diary.id, "field": "picture" } })}
                        onPressWeather={() => router.push({ "pathname": "/(tabs)/home/write", "params": { "recordId": diary.id, "field": "weather" } })}
                        styles={{ "marginHorizontal": 0 }}
                        onPressDelete={async () => {
                            await userData.update("walkRecords", data.walkRecords.filter(v => v.id !== diary.id));
                            setData(await userData.get());
                            setDiary(undefined);
                        }}
                    />
                </View>}
            </ScrollView>
        </View>
    </>;
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
    "scrollView": {
        "flex": 1,
    },
    "content": {
        "paddingBottom": 20,
    },
    "diaryContainer": {
        "position": "relative",
        "marginHorizontal": 19,
    },
    "diaryDoneSlot": {
        "height": 26,
        "alignItems": "flex-end",
        "marginBottom": 11,
    },
    "diaryDoneButton": {
        "width": 59,
        "height": 26,
        "borderRadius": 13,
        "borderWidth": 1,
        "borderColor": "#688F6E",
        "backgroundColor": colors.background,
        "alignItems": "center",
        "justifyContent": "center",
    },
    "diaryDoneText": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 14,
        "color": "#688F6E",
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
    "calendar": {
        "marginHorizontal": 16,
        "marginTop": 26,
    },
    "weekdays": {
        "flexDirection": "row",
        "height": 20,
    },
    "weekday": {
        "width": `${100 / 7}%`,
        "textAlign": "center",
        "fontFamily": "Ownglyph PDH",
        "fontSize": 18,
        "color": "#474747",
    },
    "grid": {
        "flexDirection": "row",
        "flexWrap": "wrap",
        "marginTop": 22
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
    "dayCell": {
        "width": `${100 / 7}%`,
        "height": 60,
        "alignItems": "center",
        "flexDirection": "column",
        "gap": 4,
        "marginBottom": 18
    },
    "dayNumber": {
        "width": "100%",
        "textAlign": "center",
        "fontFamily": "Ownglyph PDH",
        "fontSize": 12,
        "color": "#858681",
    },
    "dayCircleInactive": {
        "width": 43,
        "height": 43,
        "borderRadius": 22.5,
        "backgroundColor": "#E7E9E0",
        "borderColor": "#9A9A9A",
        "borderWidth": 1.3,
        "borderStyle": "dashed"
    },
    "dayCircleActive": {
        "width": 43,
        "height": 43,
        "borderRadius": 22.5,
        "backgroundColor": "rgba(102, 140, 108, 0.25)",
        "borderColor": "#688F6E",
        "borderWidth": 1.3,
        "borderStyle": "solid"
    }
});
