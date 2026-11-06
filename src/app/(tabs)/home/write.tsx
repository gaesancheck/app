import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, DarkColors, LightColors } from "../../../../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { router, useLocalSearchParams, usePreventRemove } from "expo-router";
import { haptics } from "@/modules/haptics";
import userData from "@/modules/userData";
import { selectCarePhotos } from "@/components/CareUI";
import { WEATHER } from "@/components/SmallDiary";
import { RouteMap } from "@/components/EmergencyUI";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import * as Crypto from "expo-crypto";

import SvgBack from "@/assets/svg/back.svg";
import SvgCamera from "@/assets/svg/camera.svg";
import SvgPlus from "@/assets/svg/plus.svg";
import SvgClose from "@/assets/svg/close.svg";
import SvgVeryGood from "@/assets/svg/dogs/verygood.svg";
import SvgGood from "@/assets/svg/dogs/good.svg";
import SvgNormal from "@/assets/svg/dogs/normal.svg";
import SvgSad from "@/assets/svg/dogs/sad.svg";
import SvgAngry from "@/assets/svg/dogs/angry.svg";
import SvgTime from "@/assets/svg/home-record/time.svg";
import SvgDistance from "@/assets/svg/home-record/distance.svg";
import SvgDestination from "@/assets/svg/home-record/destination.svg";

const MOODS = [
    { "rate": 5, "label": "매우 좋음", "Icon": SvgVeryGood },
    { "rate": 4, "label": "좋음", "Icon": SvgGood },
    { "rate": 3, "label": "보통", "Icon": SvgNormal },
    { "rate": 2, "label": "나쁨", "Icon": SvgSad },
    { "rate": 1, "label": "매우 나쁨", "Icon": SvgAngry },
] as const;
const WEATHER_LABELS = {
    "clear": "맑음",
    "partly_cloudy": "구름 조금",
    "mostly_cloudy": "구름 많음",
    "cloudy": "흐림",
    "rainy": "비",
    "thunder": "천둥",
    "snowy": "눈",
};

export default function Page() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors, safeArea);
    const params = useLocalSearchParams<{ "recordId"?: string; "id"?: string; "date"?: string; "field"?: string }>();
    const recordId = params.recordId ?? params.id;
    const [record, setRecord] = useState<WalkRecord>();
    const [original, setOriginal] = useState("");
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [weatherOpen, setWeatherOpen] = useState(params.field === "weather");
    const photoOpened = useRef(false);
    const dirty = !!record && JSON.stringify(record) !== original;
    usePreventRemove(dirty && !saving, ({ repeat }) => {
        Alert.alert("작성 중인 기록이 있어요", "저장하지 않고 나갈까요?", [
            { "text": "계속 작성", "style": "cancel" },
            {
                "text": "나가기",
                "style": "destructive",
                "onPress": () => {
                    setOriginal(JSON.stringify(record));
                    repeat();
                },
            },
        ]);
    });

    useEffect(() => {
        let active = true;
        void userData
            .get()
            .then(data => {
                const found = recordId ? data.walkRecords.find(item => item.id === recordId) : undefined;
                if (recordId && !found) throw new Error("missing");
                const next: WalkRecord = found ?? {
                    "id": Crypto.randomUUID(),
                    "date": /^\d{8}$/.test(params.date ?? "") ? params.date! : dayjs().format("YYYYMMDD"),
                    "rate": 3,
                    "routes": [],
                    "duration": 0,
                    "distance": 0,
                    "destination": "",
                    "content": "",
                };
                if (active) {
                    setRecord(next);
                    setOriginal(JSON.stringify(next));
                }
            })
            .catch(() => {
                if (active) setLoadError(true);
            });
        return () => {
            active = false;
        };
    }, [recordId, params.date]);

    const change = (next: Partial<WalkRecord>) => setRecord(current => (current ? { ...current, ...next } : current));
    const pickPhoto = async () => {
        try {
            const photos = await selectCarePhotos();
            if (photos[0]) change({ "picture": photos[0] });
        } catch {
            Alert.alert("사진을 첨부하지 못했어요", "사진 접근 권한을 확인하고 다시 시도해주세요.");
        }
    };
    useEffect(() => {
        if (record && params.field === "picture" && !photoOpened.current) {
            photoOpened.current = true;
            void pickPhoto();
        }
    }, [record, params.field]);

    const save = async () => {
        if (!record || saving) return;
        setSaving(true);
        try {
            const saved = await userData.saveRecord(record, Boolean(recordId));
            setRecord(saved);
            setOriginal(JSON.stringify(saved));
            haptics.light();
            router.back();
        } catch {
            Alert.alert("저장하지 못했어요", "잠시 후 다시 시도해주세요.");
            setSaving(false);
        }
    };
    const WeatherIcon = record?.weather ? WEATHER[record.weather] : undefined;

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.header}>
                <TouchableOpacity
                    accessibilityLabel="뒤로 가기"
                    style={styles.headerBack}
                    hitSlop={12}
                    onPress={() => router.back()}
                >
                    <SvgBack width={15} height={15} />
                </TouchableOpacity>
                <Text style={styles.headerText}>산책 기록</Text>
                <TouchableOpacity style={styles.save} disabled={!record || saving} onPress={() => void save()}>
                    <Text style={styles.saveText}>{saving ? "저장 중" : "완료"}</Text>
                </TouchableOpacity>
            </View>
            {!record ? (
                loadError ? (
                    <View style={styles.error}>
                        <Text style={styles.text}>기록을 불러오지 못했어요.</Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.saveText}>돌아가기</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ActivityIndicator style={styles.error} color={colors.green_light2} />
                )
            ) : (
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.form}
                >
                    <View style={styles.moodCard}>
                        <Text style={styles.label}>오늘 산책은 어떠셨나요?</Text>
                        <View style={styles.moods}>
                            {MOODS.map(({ rate, label, Icon }) => (
                                <Pressable
                                    key={rate}
                                    accessibilityRole="radio"
                                    accessibilityLabel={label}
                                    accessibilityState={{ "selected": record.rate === rate }}
                                    onPress={() => {
                                        change({ "rate": rate });
                                        haptics.light();
                                    }}
                                    style={[styles.mood, record.rate === rate && styles.selectedMood]}
                                >
                                    <Icon />
                                </Pressable>
                            ))}
                        </View>
                    </View>
                    <View style={styles.map}>
                        <RouteMap points={record.routes} height={165} />
                    </View>
                    <Text style={styles.sectionTitle}>산책 결과</Text>
                    <View style={styles.summary}>
                        <View style={styles.stat}>
                            <SvgTime />
                            <View>
                                <Text style={styles.statLabel}>산책 시간</Text>
                                <Text style={styles.statValue}>{Math.round(record.duration / 60)}분</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.stat}>
                            <SvgDistance />
                            <View>
                                <Text style={styles.statLabel}>이동 거리</Text>
                                <Text style={styles.statValue}>{Number((record.distance / 1000).toFixed(2))}km</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.destination}>
                            <SvgDestination />
                            <View style={styles.destinationText}>
                                <Text style={styles.statLabel}>주요 목적지</Text>
                                <TextInput
                                    accessibilityLabel="주요 목적지"
                                    value={record.destination}
                                    onChangeText={text => change({ "destination": text })}
                                    placeholder="입력"
                                    placeholderTextColor="#99A097"
                                    style={styles.destinationInput}
                                    maxLength={40}
                                />
                            </View>
                        </View>
                    </View>
                    <Text style={styles.sectionTitle}>한 줄 기록</Text>
                    <View style={styles.diary}>
                        <View style={styles.diaryInfo}>
                            <Pressable accessibilityLabel="사진 첨부 또는 변경" onPress={() => void pickPhoto()}>
                                {record.picture ? (
                                    <Image source={{ "uri": record.picture }} style={styles.picture} />
                                ) : (
                                    <View style={styles.noPicture}>
                                        <SvgCamera width={20} height={17} />
                                        <Text style={styles.photoHint}>사진을 첨부해주세요</Text>
                                    </View>
                                )}
                            </Pressable>
                            <View style={styles.extras}>
                                <Text style={styles.date}>
                                    {dayjs(record.date).locale("ko").format("YY년 M월 D일 dddd")}
                                </Text>
                                <Pressable
                                    accessibilityLabel="오늘의 날씨 선택"
                                    onPress={() => setWeatherOpen(!weatherOpen)}
                                    style={[styles.weather, record.weather && styles.weatherFilled]}
                                >
                                    {WeatherIcon ? <WeatherIcon /> : <SvgPlus width={13} height={12} />}
                                </Pressable>
                                {record.picture && (
                                    <TouchableOpacity onPress={() => change({ "picture": undefined })}>
                                        <Text style={styles.photoHint}>사진 삭제</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        {weatherOpen && (
                            <View style={styles.weatherPicker}>
                                <View style={styles.weatherHeader}>
                                    <Text style={styles.label}>오늘의 날씨</Text>
                                    <TouchableOpacity
                                        accessibilityLabel="날씨 선택 닫기"
                                        hitSlop={8}
                                        onPress={() => setWeatherOpen(false)}
                                    >
                                        <SvgClose width={8} height={8} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.weatherOptions}>
                                    {(Object.keys(WEATHER_LABELS) as WalkRecordWeather[]).map(weather => {
                                        const Icon = WEATHER[weather];
                                        return (
                                            <Pressable
                                                key={weather}
                                                accessibilityLabel={WEATHER_LABELS[weather]}
                                                accessibilityRole="radio"
                                                accessibilityState={{ "selected": weather === record.weather }}
                                                style={[
                                                    styles.weather,
                                                    styles.weatherFilled,
                                                    record.weather === weather && styles.selectedWeather,
                                                ]}
                                                onPress={() => {
                                                    change({ "weather": weather });
                                                    setWeatherOpen(false);
                                                }}
                                            >
                                                <Icon />
                                            </Pressable>
                                        );
                                    })}
                                </View>
                                {record.weather && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            change({ "weather": undefined });
                                            setWeatherOpen(false);
                                        }}
                                    >
                                        <Text style={styles.photoHint}>날씨 지우기</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                        <TextInput
                            autoFocus={params.field === "content"}
                            accessibilityLabel="한 줄 기록"
                            multiline
                            textAlignVertical="top"
                            value={record.content}
                            onChangeText={text => change({ "content": text })}
                            placeholder="오늘의 산책을 기록해주세요"
                            placeholderTextColor="#99A097"
                            style={styles.content}
                            maxLength={2000}
                        />
                    </View>
                </ScrollView>
            )}
        </KeyboardAvoidingView>
    );
}

const getStyles = (colors: Colors, safeArea: EdgeInsets) =>
    StyleSheet.create({
        "container": {
            "flex": 1,
            "backgroundColor": colors.background,
            "paddingTop": Platform.select({
                "android": safeArea.top + 14,
                "ios": 76,
            }),
            "paddingLeft": safeArea.left,
            "paddingRight": safeArea.right,
        },
        "header": {
            "alignItems": "center",
            "justifyContent": "center",
            "marginHorizontal": 32,
            "height": 22,
        },
        "headerBack": {
            "position": "absolute",
            "left": 0,
        },
        "headerText": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 20,
            "color": "#2F3A2D",
        },
        "save": {
            "position": "absolute",
            "right": 0,
            "paddingVertical": 6,
            "paddingHorizontal": 10,
        },
        "saveText": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 16,
            "color": colors.green_light2,
        },
        "form": {
            "paddingHorizontal": 19,
            "paddingTop": 39,
            "paddingBottom": safeArea.bottom + 24,
        },
        "moodCard": {
            "backgroundColor": "#ECEEE6",
            "borderColor": "#9A9A9A",
            "borderWidth": 0.7,
            "borderRadius": 12,
            "padding": 20,
            "height": 116,
            "alignItems": "center",
            "gap": 17,
        },
        "label": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 15,
            "color": "#474747",
        },
        "moods": {
            "flexDirection": "row",
            "justifyContent": "space-between",
            "width": "100%",
        },
        "mood": {
            "width": 43,
            "height": 43,
            "borderRadius": 24,
        },
        "selectedMood": {
            "outlineWidth": 1.5,
            "outlineColor": colors.green_light2,
            "outlineOffset": 3,
        },
        "map": {
            "height": 165,
            "marginTop": 13,
            "borderRadius": 12,
            "overflow": "hidden",
            "borderColor": "#9A9A9A",
            "borderWidth": 0.7,
        },
        "sectionTitle": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 15,
            "marginLeft": 11,
            "marginTop": 13,
            "marginBottom": 13,
            "color": "#000",
        },
        "summary": {
            "flexDirection": "row",
            "alignItems": "center",
            "justifyContent": "space-around",
            "gap": 9,
            "height": 52,
        },
        "stat": {
            "flexDirection": "row",
            "gap": 7,
            "alignItems": "flex-start",
        },
        "statLabel": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 15,
            "color": "#5A5A5A",
        },
        "statValue": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 30,
            "color": "#474747",
        },
        "divider": {
            "width": 0.5,
            "height": 35,
            "backgroundColor": "#9A9A9A",
        },
        "destination": {
            "flexDirection": "row",
            "gap": 7,
            "flex": 1,
            "maxWidth": 110,
        },
        "destinationText": {
            "flex": 1,
        },
        "destinationInput": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 26,
            "padding": 0,
            "color": "#474747",
            "minHeight": 33,
        },
        "diary": {
            "backgroundColor": "#FAFBF7",
            "borderRadius": 12,
            "borderColor": "#9A9A9A",
            "borderWidth": 0.7,
            "paddingHorizontal": 15,
            "paddingVertical": 14,
            "minHeight": 197,
        },
        "diaryInfo": {
            "flexDirection": "row",
            "gap": 10,
        },
        "picture": {
            "width": 85,
            "height": 85,
            "borderRadius": 12,
        },
        "noPicture": {
            "width": 85,
            "height": 85,
            "borderRadius": 12,
            "borderWidth": 0.7,
            "borderColor": "#9A9A9A",
            "borderStyle": "dashed",
            "backgroundColor": "#ECEEE6",
            "alignItems": "center",
            "justifyContent": "center",
            "gap": 8,
        },
        "photoHint": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 10,
            "color": "#9F9F9F",
        },
        "extras": {
            "paddingTop": 5,
            "gap": 12,
        },
        "date": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 14,
            "color": "#000",
        },
        "weather": {
            "width": 30,
            "height": 30,
            "borderRadius": 15,
            "borderWidth": 1.3,
            "borderStyle": "dashed",
            "borderColor": "#9A9A9A",
            "backgroundColor": "#E7E9E0",
            "alignItems": "center",
            "justifyContent": "center",
        },
        "weatherFilled": {
            "backgroundColor": colors.green_light2,
            "borderStyle": "solid",
            "borderColor": "#E7E9E0",
        },
        "selectedWeather": {
            "outlineWidth": 1.5,
            "outlineColor": "#474747",
        },
        "weatherPicker": {
            "alignSelf": "flex-end",
            "width": 240,
            "padding": 14,
            "borderRadius": 10,
            "borderWidth": 0.4,
            "borderStyle": "dashed",
            "borderColor": "#474747",
            "backgroundColor": "#ECEEE6",
            "gap": 14,
            "marginTop": 10,
        },
        "weatherHeader": {
            "flexDirection": "row",
            "justifyContent": "space-between",
            "alignItems": "center",
        },
        "weatherOptions": {
            "flexDirection": "row",
            "flexWrap": "wrap",
            "columnGap": 15,
            "rowGap": 10,
        },
        "content": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 16,
            "lineHeight": 25,
            "color": "#474747",
            "padding": 0,
            "marginTop": 10,
            "minHeight": 75,
            "textDecorationLine": "underline",
            "textDecorationStyle": "dotted",
        },
        "text": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 18,
            "color": "#474747",
        },
        "error": {
            "marginTop": 80,
            "alignItems": "center",
            "gap": 20,
        },
    });
