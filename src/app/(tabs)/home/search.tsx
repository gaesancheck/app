import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, TextInputInstance, TouchableOpacity, View, } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { accountStorageKey } from "@/modules/accountStorage";
import { router, useFocusEffect } from "expo-router";
import { Colors, DarkColors, LightColors } from "@/../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { haptics } from "@/modules/haptics";

import SvgBack from "@/assets/svg/home-search/back.svg";
import SvgSearch from "@/assets/svg/home-search/search.svg";
import SvgHistory from "@/assets/svg/home-search/history.svg";
import SvgRemove from "@/assets/svg/home-search/remove.svg";

import SmallDiary from "@/components/SmallDiary";
import userData from "@/modules/userData";
import SvgEmpty from "@/assets/svg/home-record/empty.svg";

const HISTORY_STORAGE_PREFIX = "walkRecordSearchHistory";

export default function Page() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors, safeArea);
    const inputRef = useRef<TextInputInstance>(null);
    const storageWrite = useRef<Promise<void>>(Promise.resolve());
    const [query, setQuery] = useState("");
    const [submittedQuery, setSubmittedQuery] = useState("");
    const [records, setRecords] = useState<WalkRecord[]>([]);
    useFocusEffect(useCallback(() => {
        let active = true;
        void userData.get().then(data => { if (active) setRecords(data.walkRecords); }).catch(() => setStorageError("산책 기록을 불러오지 못했어요."));
        return () => { active = false; };
    }, []));
    const results = records.filter(record => `${record.content} ${record.destination} ${record.date}`.toLocaleLowerCase().includes(submittedQuery.toLocaleLowerCase())).sort((a, b) => b.date.localeCompare(a.date));
    const openRecord = (record: WalkRecord, field: string) => router.push({ "pathname": "/(tabs)/home/write", "params": { "recordId": record.id, "field": field } });
    const [history, setHistory] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [storageError, setStorageError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadHistory() {
            try {
                const stored = await AsyncStorage.getItem(await accountStorageKey(HISTORY_STORAGE_PREFIX));
                const parsed: unknown = stored ? JSON.parse(stored) : [];
                if (active && Array.isArray(parsed)) {
                    setHistory([...new Set(parsed.filter((item): item is string =>
                        typeof item === "string" && item.trim().length > 0
                    ))].slice(0, 20));
                }
            } catch {
                if (active) setStorageError("검색 기록을 불러오지 못했어요.");
            } finally {
                if (active) setIsLoaded(true);
            }
        }

        void loadHistory();
        return () => {
            active = false;
        };
    }, []);

    const saveHistory = (nextHistory: string[]) => {
        setHistory(nextHistory);
        setStorageError("");
        storageWrite.current = storageWrite.current
            .catch(() => undefined)
            .then(async () => AsyncStorage.setItem(await accountStorageKey(HISTORY_STORAGE_PREFIX), JSON.stringify(nextHistory)));
        void storageWrite.current.catch(() => {
            setStorageError("검색 기록을 저장하지 못했어요.");
        });
    };

    const submitSearch = (text = query) => {
        const term = text.trim();
        if (!term || !isLoaded) return;
        setQuery(term);
        setSubmittedQuery(term);
        saveHistory([term, ...history.filter(item => item !== term)].slice(0, 20));
        Keyboard.dismiss();
        haptics.light();
    };

    return <View style={styles.container}>
        <View style={styles.searchHeader}>
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="뒤로 가기"
                style={styles.backButton}
                hitSlop={10}
                onPress={() => {
                    haptics.light();
                    router.back();
                }}
            >
                <SvgBack />
            </TouchableOpacity>
            <View style={styles.searchField}>
                <TextInput
                    ref={inputRef}
                    accessibilityLabel="산책 기록 검색"
                    style={styles.searchInput}
                    value={query}
                    onChangeText={text => { setQuery(text); setSubmittedQuery(""); }}
                    placeholder="검색할 내용을 입력하세요"
                    placeholderTextColor="#99A097"
                    selectionColor={colors.green_light2}
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                    editable={isLoaded}
                    onSubmitEditing={() => submitSearch()}
                />
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="검색"
                    style={styles.searchButton}
                    hitSlop={10}
                    disabled={!isLoaded || !query.trim()}
                    onPress={() => submitSearch()}
                >
                    <SvgSearch />
                </TouchableOpacity>
            </View>
        </View>
        <View style={styles.historyHeader}>
            <Text style={styles.historyHeading}>{submittedQuery ? `전체 결과: ${results.length}개` : "검색 기록"}</Text>
            {!submittedQuery && <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="검색 기록 전체 삭제"
                hitSlop={7}
                disabled={!isLoaded || history.length === 0}
                onPress={() => saveHistory([])}
            >
                <Text style={styles.historyHeading}>전체 삭제</Text>
            </TouchableOpacity>}
        </View>
        <ScrollView
            style={styles.historyList}
            contentContainerStyle={[styles.historyContent, !!submittedQuery && results.length === 0 && styles.emptyContent]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
        >
            {submittedQuery ? (results.length ? results.map(record => <SmallDiary key={record.id} data={record} styles={{ "marginHorizontal": 0 }} onPressContent={() => openRecord(record, "content")} onPressPicture={() => openRecord(record, "picture")} onPressWeather={() => openRecord(record, "weather")} />) : <View style={styles.empty}><SvgEmpty /><Text style={styles.emptyText}>검색 결과가 없어요.</Text></View>) : history.map(term => <View key={term} style={styles.historyRow}>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`${term} 다시 검색`}
                    style={styles.historyItem}
                    onPress={() => submitSearch(term)}
                >
                    <SvgHistory />
                    <Text style={styles.historyText} numberOfLines={1}>{term}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`${term} 검색 기록 삭제`}
                    style={styles.removeButton}
                    hitSlop={10}
                    onPress={() => saveHistory(history.filter(item => item !== term))}
                >
                    <SvgRemove />
                </TouchableOpacity>
            </View>)}
            {!!storageError && <Text accessibilityLiveRegion="polite" style={styles.historyHeading}>
                {storageError}
            </Text>}
        </ScrollView>
    </View>;
}

const getStyles = (colors: Colors, safeArea: EdgeInsets) => StyleSheet.create({
    "container": {
        "flex": 1,
        "backgroundColor": "#F7F8F3",
        "paddingTop": Platform.select({ "android": safeArea.top + 14, "ios": 76 }),
        "paddingLeft": safeArea.left + 16,
        "paddingRight": safeArea.right + 17,
    },
    "searchHeader": {
        "flexDirection": "row",
        "alignItems": "center",
        "gap": 25,
    },
    "backButton": {
        "width": 15,
        "height": 15,
        "alignItems": "center",
        "justifyContent": "center",
    },
    "searchField": {
        "flex": 1,
        "height": 39,
        "flexDirection": "row",
        "alignItems": "center",
        "gap": 12,
        "paddingHorizontal": 15,
        "borderWidth": 0.5,
        "borderColor": colors.green_light2,
        "borderRadius": 5,
        "backgroundColor": "#FAFBF7",
    },
    "searchInput": {
        "flex": 1,
        "minWidth": 0,
        "padding": 0,
        "fontFamily": "Ownglyph PDH",
        "fontSize": 15,
        "letterSpacing": 0.45,
        "color": "#474747",
        "includeFontPadding": false,
    },
    "searchButton": {
        "width": 12,
        "height": 12,
        "alignItems": "center",
        "justifyContent": "center",
    },
    "historyHeader": {
        "marginTop": 25,
        "paddingHorizontal": 5,
        "flexDirection": "row",
        "alignItems": "center",
        "justifyContent": "space-between",
    },
    "historyHeading": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 15,
        "lineHeight": 18,
        "letterSpacing": 0.45,
        "color": "#99A097",
    },
    "historyList": {
        "flex": 1,
        "marginTop": 25,
    },
    "historyContent": {
        "gap": 13,
        "paddingBottom": 24,
    },
    "emptyContent": { "flexGrow": 1, "justifyContent": "center", "paddingBottom": 60 },
    "empty": { "alignItems": "center", "gap": 47 },
    "emptyText": { "fontFamily": "Ownglyph PDH", "fontSize": 20, "color": "#474747", "letterSpacing": 0.6 },
    "historyRow": {
        "minHeight": 28,
        "flexDirection": "row",
        "alignItems": "center",
        "gap": 16,
    },
    "historyItem": {
        "flex": 1,
        "flexDirection": "row",
        "alignItems": "center",
        "gap": 11,
    },
    "historyText": {
        "flex": 1,
        "fontFamily": "Ownglyph PDH",
        "fontSize": 17,
        "letterSpacing": 0.51,
        "color": "#99A097",
    },
    "removeButton": {
        "width": 7,
        "height": 7,
        "alignItems": "center",
        "justifyContent": "center",
    },
});
