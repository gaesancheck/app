import { router, useFocusEffect } from "expo-router";
import { FlatList, Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCallback, useState } from "react";
import { Colors, LightColors, DarkColors } from "../../../../app.config";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { haptics } from "@/modules/haptics";

import SvgSearch from "@/assets/svg/search.svg";
import SvgBookmark from "@/assets/svg/bookmark.svg";
import SvgBookmarkFilled from "@/assets/svg/bookmark_filled.svg";
import SvgHeart from "@/assets/svg/heart.svg";
import SvgComment from "@/assets/svg/comment.svg";
import SvgPlus from "@/assets/svg/plus.svg";
import { communityData, CommunityPost } from "@/modules/communityData";
import { PostCard, Empty, message } from "@/components/CommunityUI";

function Category({
    enabled,
    label,
    onPress,
    styles,
}: {
    "enabled": boolean;
    "label": string;
    "onPress"?: () => void;
    "styles": any;
}) {
    return (
        <TouchableOpacity
            style={[
                styles,
                {
                    "backgroundColor": enabled ? "#474747" : "#E2E2E2",
                },
            ]}
            disabled={enabled}
            onPress={() => {
                haptics.light();
                onPress?.();
            }}
        >
            <Text
                style={{
                    "fontFamily": "Ownglyph PDH",
                    "fontSize": 15,
                    "color": enabled ? "#FAFBF7" : "#848484",
                }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

export default function Page() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors, safeArea);

    const [posts, setPosts] = useState<CommunityPost[]>([]);
    // missing 카테고리는 APIEmergency에서 처리
    const [currentCategory, setCurrentCategory] = useState<"popular" | "recent" | "others" | "missing">("popular");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const load = useCallback(async () => {
        setLoading(true);
        try {
            setPosts(await communityData.listPosts({ "category": currentCategory }));
            setError("");
        } catch (e) {
            setError("게시물을 불러오지 못했어요. 아래로 당겨 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    }, [currentCategory]);
    useFocusEffect(
        useCallback(() => {
            void load();
        }, [load])
    );
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>커뮤니티</Text>
                <View style={styles.headerItems}>
                    <TouchableOpacity
                        accessibilityLabel="게시물 검색"
                        hitSlop={7}
                        onPress={() => router.push("/community/search")}
                    >
                        <SvgSearch width={15} height={15} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        accessibilityLabel="내 게시물"
                        hitSlop={7}
                        onPress={() =>
                            router.push({ "pathname": "/community/my", "params": { "collection": "bookmarked" } })
                        }
                    >
                        <SvgBookmark width={15} height={15} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.categories}>
                <Category
                    styles={styles.category}
                    onPress={() => setCurrentCategory("popular")}
                    enabled={currentCategory === "popular"}
                    label="인기"
                />
                <Category
                    styles={styles.category}
                    onPress={() => setCurrentCategory("recent")}
                    enabled={currentCategory === "recent"}
                    label="최근"
                />
                <Category
                    styles={styles.category}
                    onPress={() => setCurrentCategory("missing")}
                    enabled={currentCategory === "missing"}
                    label="실종된 반려동물"
                />
                <Category
                    styles={styles.category}
                    onPress={() => setCurrentCategory("others")}
                    enabled={currentCategory === "others"}
                    label="그 외 등등"
                />
            </View>
            <FlatList
                style={styles.list}
                data={posts}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.posts}
                refreshing={loading}
                onRefresh={load}
                ListEmptyComponent={
                    <Empty
                        text={
                            error ||
                            (loading
                                ? "게시물을 불러오고 있어요."
                                : currentCategory === "missing"
                                  ? "실종된 반려동물이 없어요."
                                  : "아직 게시물이 없어요. 첫 이야기를 남겨주세요!")
                        }
                    />
                }
                renderItem={({ item }) => <PostCard post={item} onChange={load} />}
            />
            <Pressable
                style={styles.writePost}
                onPress={() => {
                    router.push("/community/write");
                }}
            >
                <SvgPlus width={15} height={15} />
            </Pressable>
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
        "writePost": {
            "position": "absolute",
            "bottom": 19,
            "right": 19,
            "borderRadius": 20,
            "width": 40,
            "height": 40,
            "backgroundColor": colors.green_light2,
            "justifyContent": "center",
            "alignItems": "center",
            "boxShadow": "rgba(0, 0, 0, 0.25) 0 3px 3px 0",
        },
        "categories": {
            "marginTop": 27,
            "marginBottom": 23,
            "flexDirection": "row",
            "gap": 12,
            "paddingHorizontal": 32,
        },
        "category": {
            "height": 24,
            "borderRadius": 20,
            "paddingVertical": 4,
            "paddingHorizontal": 10,
        },
        "list": {
            "flex": 1,
        },
        "posts": {
            "flexGrow": 1,
            "paddingHorizontal": 19,
            "paddingVertical": 10,
            "paddingBottom": 70,
            "gap": 16,
        },
        "post": {
            "borderColor": "#9A9A9A",
            "borderStyle": "solid",
            "borderWidth": 0.7,
            "borderRadius": 10,
            "flexDirection": "column",
            "gap": 6,
            "paddingHorizontal": 12,
            "paddingVertical": 10,
        },
        "postContent": {
            "gap": 6,
            "flexDirection": "column",
        },
        "postBottom": {
            "flexDirection": "row",
            "gap": 20,
        },
        "postStatus": {
            "flexDirection": "row",
            "gap": 4,
        },
        "postStatusIcon": {
            "width": 15,
            "height": 15,
        },
        "postStatusText": {
            "marginVertical": "auto",
            "fontFamily": "Ownglyph PDH",
            "fontSize": 12,
            "color": "#6E6E6E",
        },
        "bookmark": {
            "marginLeft": "auto",
            "width": 11.67,
            "height": 15,
        },
        "attachments": {
            "flexDirection": "row",
            "gap": 9,
        },
        "postTitle": {
            "fontSize": 22,
            "fontFamily": "Ownglyph PDH",
            "color": "#474747",
        },
        "postDescription": {
            "fontSize": 14,
            "fontFamily": "Ownglyph PDH",
            "color": "#474747",
            "textDecorationStyle": "dotted",
            "textDecorationLine": "underline",
            "textDecorationColor": "#474747",
            "lineHeight": 17,
            "textAlignVertical": "top",
        },
    });
