import { showCareError } from "@/components/CareUI";
import { useRef } from "react";
import { Platform, StyleSheet, TouchableOpacity, View, Text, ScrollView } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, DarkColors, LightColors } from "@/../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { router, useFocusEffect } from "expo-router";
import SelectionDropdown from "@/components/SelectionDropdown";
import userData, { UserData, SAVE_DEFAULT } from "@/modules/userData";
import dayjs from "dayjs";
import { useState, useCallback } from "react";

import SvgCalendar from "@/assets/svg/calendar.svg";
import SvgList from "@/assets/svg/list.svg";
import SvgChevronDown from "@/assets/svg/chevronDown.svg";
import SmallDiary from "@/components/SmallDiary";
import Dropdown from "@/components/Dropdown";

export default function Page() {
    const deleting = useRef(false);
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors, safeArea);

    const now = dayjs();
    const [currentYear, setCurrentYear] = useState(now.year());
    const [currentMonth, setCurrentMonth] = useState(now.month());

    const [data, setData] = useState<UserData>(SAVE_DEFAULT);
    const [isDeletingMode, setIsDeletingMode] = useState(false);

    useFocusEffect(
        useCallback(() => {
            (async () => {
                const fresh = await userData.get();
                setData(fresh);
            })();
        }, [])
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>산책 기록</Text>
                <View style={styles.headerItems}>
                    <TouchableOpacity hitSlop={7} onPress={() => router.replace("/(tabs)/home")}>
                        <SvgCalendar width={15} height={15} />
                    </TouchableOpacity>
                    <Dropdown
                        viewType="touchableopacity"
                        hitSlop={7}
                        options={[
                            { "label": "검색하기", "onPress": () => router.push("/(tabs)/home/search") },
                            isDeletingMode
                                ? {
                                      "label": "삭제 취소",
                                      "onPress": () => setIsDeletingMode(false),
                                  }
                                : {
                                      "label": "일기 삭제",
                                      "onPress": () => setIsDeletingMode(true),
                                  },
                        ]}
                    >
                        <SvgList width={15} height={15} />
                    </Dropdown>
                </View>
            </View>
            <SelectionDropdown
                disabled={data.walkRecords.length === 0}
                value={`${currentYear}-${currentMonth + 1}`}
                options={[...new Set(data.walkRecords.map(v => dayjs(v.date, "YYYYMMDD").format("YYYY-MM")))]
                    .sort()
                    .map(month => ({
                        "label": dayjs(month).format("YYYY년 M월"),
                        "value": dayjs(month).format("YYYY-M"),
                    }))}
                onChange={value => {
                    const [year, month] = (value as string).split("-");
                    setCurrentYear(Number(year));
                    setCurrentMonth(Number(month) - 1);
                }}
                containerStyle={styles.monthTitle}
            >
                <Text style={styles.monthText}>
                    {currentYear}년 {currentMonth + 1}월
                </Text>
                {data.walkRecords.length > 0 && <SvgChevronDown width={11} height={6} />}
            </SelectionDropdown>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {data.walkRecords
                    .filter(v => dayjs(v.date).year() === currentYear && dayjs(v.date).month() === currentMonth)
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map(v => (
                        <SmallDiary
                            showDeleteButton={isDeletingMode}
                            onPressDelete={async () => {
                                if (deleting.current) return;
                                deleting.current = true;
                                try {
                                    await userData.deleteRecord(v.id);
                                    setData(await userData.get());
                                } catch (error) {
                                    showCareError(error);
                                } finally {
                                    deleting.current = false;
                                }
                            }}
                            key={v.id}
                            data={v}
                            onPressContent={() =>
                                router.push({
                                    "pathname": "/(tabs)/home/write",
                                    "params": { "recordId": v.id, "field": "content" },
                                })
                            }
                            onPressPicture={() =>
                                router.push({
                                    "pathname": "/(tabs)/home/write",
                                    "params": { "recordId": v.id, "field": "picture" },
                                })
                            }
                            onPressWeather={() =>
                                router.push({
                                    "pathname": "/(tabs)/home/write",
                                    "params": { "recordId": v.id, "field": "weather" },
                                })
                            }
                        />
                    ))}
                {data.walkRecords.filter(
                    v => dayjs(v.date).year() === currentYear && dayjs(v.date).month() === currentMonth
                ).length === 0 && <Text style={styles.empty}>이 달의 산책 기록이 없어요.</Text>}
            </ScrollView>
            {isDeletingMode && (
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="완료"
                    onPress={() => setIsDeletingMode(false)}
                    style={styles.deleteModeDoneButton}
                >
                    <Text style={styles.deleteModeDoneText}>완료</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const getStyles = (colors: Colors, safeArea: EdgeInsets) =>
    StyleSheet.create({
        "container": {
            "flex": 1,
            "flexDirection": "column",
            "backgroundColor": colors.background,
            "width": "100%",
            "paddingTop": Platform.select({
                "android": safeArea.top + 14,
                "ios": 76,
            }),
            "paddingLeft": safeArea.left,
            "paddingRight": safeArea.right,
        },
        "header": {
            "flexDirection": "row",
            "justifyContent": "space-between",
            "paddingHorizontal": 32,
        },
        "headerText": {
            "fontFamily": "Ownglyph PDH",
            "color": "#2F3A2D",
            "fontSize": 28,
        },
        "headerItems": {
            "flexDirection": "row",
            "gap": 19,
            "alignItems": "center",
        },
        "scrollView": {
            "flex": 1,
            "marginTop": 12,
            "paddingTop": 36,
        },
        "content": {
            "paddingBottom": 20,
            "flexGrow": 1,
            "gap": 10,
        },
        "empty": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 20,
            "color": "#474747",
            "textAlign": "center",
            "marginTop": 80,
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
        "deleteModeDoneButton": {
            "position": "absolute",
            "top": 148,
            "right": 20,
            "width": 59,
            "height": 29,
            "alignItems": "center",
            "justifyContent": "center",
            "borderWidth": 1,
            "borderColor": "#688F6E",
            "borderRadius": 20,
            "zIndex": 20,
        },
        "deleteModeDoneText": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 15,
            "letterSpacing": 0.45,
            "color": "#688F6E",
        },
    });
