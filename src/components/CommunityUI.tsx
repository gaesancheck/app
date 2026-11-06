import { useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { communityData, CommunityPost } from "@/modules/communityData";
import SvgHeart from "@/assets/svg/heart.svg";
import SvgComment from "@/assets/svg/comment.svg";
import SvgBookmark from "@/assets/svg/bookmark.svg";
import SvgBookmarkFilled from "@/assets/svg/bookmark_filled.svg";
import SvgBack from "@/assets/svg/back.svg";
export function message(error: unknown) {
    Alert.alert("알림", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
}
export function Header({ title, right }: { "title": string; "right"?: React.ReactNode }) {
    return (
        <View style={styles.header}>
            <Pressable accessibilityLabel="뒤로" hitSlop={12} onPress={() => router.back()}>
                <SvgBack width={18} height={18} />
            </Pressable>
            <Text style={styles.heading}>{title}</Text>
            <View style={styles.right}>{right}</View>
        </View>
    );
}
export function Empty({ text }: { "text": string }) {
    return <Text style={styles.empty}>{text}</Text>;
}
export function PostStats({ post, onChange }: { "post": CommunityPost; "onChange": () => void }) {
    const pending = useRef(false);
    const [busy, setBusy] = useState(false);
    const act = async (kind: "like" | "bookmark") => {
        if (pending.current) return;
        pending.current = true; setBusy(true);
        try {
            if (kind === "like") await communityData.toggleLike(post.id, !post.liked);
            else await communityData.toggleBookmark(post.id, !post.bookmarked);
            onChange();
        } catch (e) {
            message(e);
        } finally { pending.current = false; setBusy(false); }
    };
    return (
        <View style={styles.stats}>
            <Pressable
                disabled={busy}
                accessibilityLabel={post.liked ? "좋아요 취소" : "좋아요"}
                hitSlop={8}
                style={styles.stat}
                onPress={() => void act("like")}
            >
                <SvgHeart width={16} height={16} color={post.liked ? "#688F6E" : "#9CA3AF"} />
                <Text style={[styles.small, post.liked && { "color": "#688F6E" }]}>{post.hearts}</Text>
            </Pressable>
            <View style={styles.stat}>
                <SvgComment width={16} height={16} />
                <Text style={styles.small}>{post.commentCount ?? post.comments.length}</Text>
            </View>
            <Pressable
                disabled={busy}
                accessibilityLabel={post.bookmarked ? "북마크 취소" : "북마크"}
                hitSlop={8}
                style={styles.bookmark}
                onPress={() => void act("bookmark")}
            >
                {post.bookmarked ? (
                    <SvgBookmarkFilled width={13} height={16} />
                ) : (
                    <SvgBookmark width={13} height={16} />
                )}
            </Pressable>
        </View>
    );
}
export function PostCard({
    post,
    onChange,
    selecting,
    selected,
    onSelect,
}: {
    "post": CommunityPost;
    "onChange": () => void;
    "selecting"?: boolean;
    "selected"?: boolean;
    "onSelect"?: () => void;
}) {
    return (
        <View style={[styles.card, selected && { "borderColor": "#688F6E", "borderWidth": 2 }]}>
            <Pressable
                onPress={() =>
                    selecting
                        ? onSelect?.()
                        : router.push({ "pathname": "/community/[id]", "params": { "id": post.id } })
                }
            >
                {post.attachments.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
                        {post.attachments.map(a => (
                            <Image key={a.id} source={{ "uri": a.url }} style={styles.photo} />
                        ))}
                    </ScrollView>
                )}
                <Text style={styles.title}>
                    {selecting ? `${selected ? "☑" : "☐"} ` : ""}
                    {post.title}
                </Text>
                <Text numberOfLines={4} style={styles.content}>
                    {post.content}
                </Text>
            </Pressable>
            <PostStats post={post} onChange={onChange} />
        </View>
    );
}
const styles = StyleSheet.create({
    "header": {
        "flexDirection": "row",
        "alignItems": "center",
        "paddingHorizontal": 21,
        "height": 35,
        "marginBottom": 30,
    },
    "heading": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 20,
        "color": "#2F3A2D",
        "position": "absolute",
        "left": 60,
        "right": 60,
        "textAlign": "center",
        "pointerEvents": "none",
    },
    "right": {
        "marginLeft": "auto",
        "flexDirection": "row",
        "gap": 16,
    },
    "empty": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 18,
        "color": "#9A9F96",
        "textAlign": "center",
        "marginTop": 100,
    },
    "card": {
        "borderColor": "#9A9A9A",
        "borderWidth": 0.7,
        "borderRadius": 10,
        "paddingHorizontal": 12,
        "paddingVertical": 10,
        "backgroundColor": "#FAFBF7",
        "gap": 8,
    },
    "photos": {
        "gap": 9,
        "marginBottom": 6,
    },
    "photo": {
        "width": 85,
        "height": 85,
        "borderRadius": 12,
    },
    "title": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 22,
        "color": "#474747",
        "marginBottom": 6,
    },
    "content": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 14,
        "lineHeight": 20,
        "color": "#474747",
        "textDecorationLine": "underline",
        "textDecorationStyle": "dotted",
    },
    "stats": {
        "flexDirection": "row",
        "alignItems": "center",
        "gap": 20,
    },
    "stat": {
        "flexDirection": "row",
        "alignItems": "center",
        "gap": 4,
    },
    "small": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 12,
        "color": "#6E6E6E",
    },
    "bookmark": {
        "marginLeft": "auto",
    },
});
