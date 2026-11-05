import { useCallback, useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { communityData, CommunityPost, PostFilter } from "@/modules/communityData";
import { Empty, Header, message, PostCard } from "@/components/CommunityUI";
const collections = [
    { "value": "mine", "label": "내 게시물" },
    { "value": "bookmarked", "label": "북마크된 게시물" },
    { "value": "liked", "label": "좋아요한 게시물" },
    { "value": "commented", "label": "댓글을 단 게시물" },
] as const;
export default function Page() {
    const params = useLocalSearchParams<{ "collection"?: string }>();
    const inset = useSafeAreaInsets();
    const styles = getStyles(inset.top);
    const [collection, setCollection] = useState<PostFilter["collection"]>(
        params.collection === "bookmarked" ? "bookmarked" : "mine"
    );
    const [sort, setSort] = useState<PostFilter["sort"]>("recent");
    const [sortOpen, setSortOpen] = useState(false);
    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const load = useCallback(async () => {
        setLoading(true);
        try {
            setPosts(await communityData.listPosts({ "collection": collection, "sort": sort }));
            setError("");
        } catch {
            setError("게시물을 불러오지 못했어요. 아래로 당겨 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    }, [collection, sort]);
    useFocusEffect(
        useCallback(() => {
            setSelected([]);
            void load();
        }, [load])
    );
    const remove = () => {
        if (!selected.length || deleting) return;
        Alert.alert(
            collection === "bookmarked" ? "북마크 해제" : "게시물 삭제",
            `선택한 ${selected.length}개의 ${collection === "bookmarked" ? "북마크를 해제" : "게시물을 삭제"}할까요?`,
            [
                { "text": "취소", "style": "cancel" },
                {
                    "text": collection === "bookmarked" ? "해제" : "삭제",
                    "style": "destructive",
                    "onPress": async () => {
                        setDeleting(true);
                        try {
                            for (const id of selected) {
                                if (collection === "bookmarked") await communityData.toggleBookmark(id, false);
                                else await communityData.deletePost(id);
                            }
                            setSelected([]);
                            setSelecting(false);
                            await load();
                        } catch (e) {
                            message(e);
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    };
    return (
        <View style={styles.container}>
            <Header
                title="내 게시물"
                right={
                    <>
                        <Pressable accessibilityLabel="게시물 정렬" onPress={() => setSortOpen(true)}>
                            <Text style={styles.icon}>⌄</Text>
                        </Pressable>
                        {(collection === "mine" || collection === "bookmarked") && (
                            <Pressable
                                accessibilityLabel="게시물 선택"
                                onPress={() => {
                                    setSelecting(!selecting);
                                    setSelected([]);
                                }}
                            >
                                <Text style={styles.icon}>{selecting ? "완료" : "☰"}</Text>
                            </Pressable>
                        )}
                    </>
                }
            />
            <View style={styles.categories}>
                {collections.map(c => (
                    <Pressable
                        key={c.value}
                        style={[styles.category, collection === c.value && styles.active]}
                        onPress={() => {
                            setCollection(c.value);
                            setSelecting(false);
                        }}
                    >
                        <Text style={[styles.categoryText, collection === c.value && { "color": "#FAFBF7" }]}>
                            {c.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
            {selecting && (
                <View style={styles.actions}>
                    <Pressable
                        onPress={() => setSelected(selected.length === posts.length ? [] : posts.map(p => p.id))}
                    >
                        <Text style={styles.action}>전체 선택</Text>
                    </Pressable>
                    <Pressable disabled={!selected.length || deleting} onPress={remove}>
                        <Text style={styles.action}>
                            {collection === "bookmarked" ? "북마크 해제" : "삭제"} ({selected.length})
                        </Text>
                    </Pressable>
                </View>
            )}
            <FlatList
                data={posts}
                keyExtractor={p => p.id}
                refreshing={loading}
                onRefresh={load}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Empty text={error || (loading ? "게시물을 불러오고 있어요." : "아직 게시물이 없어요.")} />
                }
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onChange={load}
                        selecting={selecting}
                        selected={selected.includes(item.id)}
                        onSelect={() =>
                            setSelected(ids =>
                                ids.includes(item.id) ? ids.filter(id => id !== item.id) : [...ids, item.id]
                            )
                        }
                    />
                )}
            />
            <Modal transparent visible={sortOpen} animationType="fade" onRequestClose={() => setSortOpen(false)}>
                <Pressable style={styles.backdrop} onPress={() => setSortOpen(false)}>
                    <View style={styles.menu}>
                        {(
                            [
                                { "value": "recent", "label": "최신순" },
                                { "value": "oldest", "label": "오래된순" },
                                { "value": "likes", "label": "좋아요순" },
                            ] as const
                        ).map(s => (
                            <Pressable
                                key={s.value}
                                style={styles.option}
                                onPress={() => {
                                    setSort(s.value);
                                    setSortOpen(false);
                                }}
                            >
                                <Text style={styles.categoryText}>
                                    {sort === s.value ? "✓ " : ""}
                                    {s.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Pressable>
            </Modal>
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
        "icon": {
            "fontSize": 21,
            "color": "#2F3A2D",
            "fontFamily": "Ownglyph PDH",
        },
        "categories": {
            "flexDirection": "row",
            "flexWrap": "wrap",
            "gap": 12,
            "paddingHorizontal": 32,
            "marginBottom": 23,
        },
        "category": {
            "paddingHorizontal": 10,
            "paddingVertical": 4,
            "borderRadius": 20,
            "backgroundColor": "#E2E2E2",
        },
        "active": {
            "backgroundColor": "#474747",
        },
        "categoryText": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 15,
            "color": "#848484",
        },
        "list": {
            "paddingHorizontal": 19,
            "paddingBottom": 30,
            "gap": 16,
            "flexGrow": 1,
        },
        "actions": {
            "flexDirection": "row",
            "justifyContent": "space-between",
            "paddingHorizontal": 25,
            "paddingBottom": 20,
        },
        "action": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 18,
            "color": "#688F6E",
        },
        "backdrop": {
            "flex": 1,
            "backgroundColor": "rgba(0,0,0,0.12)",
        },
        "menu": {
            "position": "absolute",
            "top": top + 60,
            "right": 42,
            "width": 110,
            "backgroundColor": "white",
            "borderWidth": 0.5,
            "borderColor": "#898989",
            "borderRadius": 10,
        },
        "option": {
            "padding": 12,
            "alignItems": "center",
        },
    });
