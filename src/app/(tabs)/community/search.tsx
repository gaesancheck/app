import { useCallback, useState } from "react";
import { FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { communityData, CommunityPost } from "@/modules/communityData";
import { Empty, message, PostCard } from "@/components/CommunityUI";
import SvgSearch from "@/assets/svg/search.svg";
import SvgBack from "@/assets/svg/back.svg";
export default function Page() {
    const inset = useSafeAreaInsets();
    const styles = getStyles(inset.top);
    const [query, setQuery] = useState("");
    const [submitted, setSubmitted] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    useFocusEffect(
        useCallback(() => {
            communityData.getHistory().then(setHistory).catch(message);
        }, [])
    );
    const search = async (value = query) => {
        const text = value.trim();
        if (!text) {
            setSubmitted(null);
            return;
        }
        Keyboard.dismiss();
        setQuery(text);
        setSubmitted(text);
        setLoading(true);
        setError("");
        try {
            setHistory(await communityData.saveSearch(text));
            setPosts(await communityData.listPosts({ "query": text, "category": "recent" }));
        } catch {
            setError("검색 결과를 불러오지 못했어요. 다시 검색해주세요.");
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };
    const remove = async (value?: string) => {
        try {
            setHistory(await communityData.removeSearch(value));
        } catch (e) {
            message(e);
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable accessibilityLabel="뒤로" hitSlop={12} onPress={() => router.back()}>
                    <SvgBack width={18} height={18} />
                </Pressable>
                <View style={styles.search}>
                    <TextInput
                        accessibilityLabel="게시물 검색"
                        placeholder="검색할 내용을 입력하세요"
                        placeholderTextColor="#9A9F96"
                        value={query}
                        onChangeText={text => {
                            setQuery(text);
                            if (!text.trim()) setSubmitted(null);
                        }}
                        onSubmitEditing={() => void search()}
                        returnKeyType="search"
                        style={styles.input}
                    />
                    <Pressable accessibilityLabel="검색" hitSlop={10} onPress={() => void search()}>
                        <SvgSearch width={16} height={16} />
                    </Pressable>
                </View>
            </View>
            {submitted === null ? (
                <>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>검색 기록</Text>
                        <Pressable onPress={() => void remove()}>
                            <Text style={styles.label}>전체 삭제</Text>
                        </Pressable>
                    </View>
                    <FlatList
                        keyboardShouldPersistTaps="handled"
                        data={history}
                        keyExtractor={item => item}
                        ListEmptyComponent={<Empty text="최근 검색 기록이 없어요." />}
                        renderItem={({ item }) => (
                            <View style={styles.history}>
                                <Pressable style={styles.historyQuery} onPress={() => void search(item)}>
                                    <Text style={styles.clock}>◷</Text>
                                    <Text style={styles.label}>{item}</Text>
                                </Pressable>
                                <Pressable
                                    accessibilityLabel={`${item} 검색 기록 삭제`}
                                    hitSlop={12}
                                    onPress={() => void remove(item)}
                                >
                                    <Text style={styles.label}>×</Text>
                                </Pressable>
                            </View>
                        )}
                    />
                </>
            ) : (
                <>
                    <Text style={[styles.label, styles.count]}>
                        {loading ? "검색하고 있어요." : `전체 결과: ${posts.length}개`}
                    </Text>
                    <FlatList
                        data={posts}
                        keyExtractor={p => p.id}
                        refreshing={loading}
                        onRefresh={() => void search(submitted)}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <Empty text={error || (loading ? "" : "검색 결과가 없어요.\n다른 검색어로 찾아보세요.")} />
                        }
                        renderItem={({ item }) => <PostCard post={item} onChange={() => void search(submitted)} />}
                    />
                </>
            )}
        </View>
    );
}
const getStyles = (top: number) =>
    StyleSheet.create({
        "container": {
            "flex": 1,
            "paddingTop": top + 14,
            "backgroundColor": "#F7F8F3",
        },
        "header": {
            "flexDirection": "row",
            "alignItems": "center",
            "gap": 24,
            "paddingHorizontal": 17,
            "marginBottom": 25,
        },
        "search": {
            "flex": 1,
            "flexDirection": "row",
            "alignItems": "center",
            "gap": 10,
            "borderWidth": 0.5,
            "borderColor": "#688F6E",
            "borderRadius": 3,
            "paddingHorizontal": 15,
            "backgroundColor": "#FAFBF7",
            "height": 40,
        },
        "input": {
            "flex": 1,
            "fontFamily": "Ownglyph PDH",
            "fontSize": 16,
            "color": "#474747",
        },
        "labelRow": {
            "flexDirection": "row",
            "justifyContent": "space-between",
            "paddingHorizontal": 21,
            "marginBottom": 19,
        },
        "label": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 15,
            "color": "#9A9F96",
        },
        "history": {
            "flexDirection": "row",
            "alignItems": "center",
            "paddingHorizontal": 17,
            "paddingVertical": 8,
        },
        "historyQuery": {
            "flex": 1,
            "flexDirection": "row",
            "alignItems": "center",
            "gap": 12,
        },
        "clock": {
            "fontSize": 26,
            "color": "#9A9F96",
        },
        "count": {
            "paddingHorizontal": 21,
            "marginBottom": 24,
        },
        "list": {
            "paddingHorizontal": 16,
            "paddingBottom": 30,
            "gap": 12,
            "flexGrow": 1,
        },
    });
