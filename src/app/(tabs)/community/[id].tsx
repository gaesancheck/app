import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { communityData, CommunityPost } from "@/modules/communityData";
import { Empty, Header, message, PostStats } from "@/components/CommunityUI";
export default function Page() {
    const { id } = useLocalSearchParams<{ "id": string }>();
    const safeArea = useSafeAreaInsets();
    const styles = getStyles(safeArea.top);
    const [post, setPost] = useState<CommunityPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [comment, setComment] = useState("");
    const [sending, setSending] = useState(false);
    const [picture, setPicture] = useState<string | null>(null);
    const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
    const load = useCallback(async () => {
        try {
            setPost(await communityData.getPost(id));
            setError("");
        } catch {
            setError("게시물을 불러오지 못했어요.");
        } finally {
            setLoading(false);
        }
    }, [id]);
    useFocusEffect(
        useCallback(() => {
            void load();
        }, [load])
    );
    const send = async () => {
        if (!comment.trim() || sending) return;
        setSending(true);
        try {
            setPost(await communityData.addComment(id, comment));
            setComment("");
            setTimeout(() => scroll.current?.scrollToEnd({ "animated": true }), 100);
        } catch (e) {
            message(e);
        } finally {
            setSending(false);
        }
    };
    const remove = () =>
        Alert.alert("게시물 삭제", "이 게시물을 삭제할까요? 삭제한 게시물은 되돌릴 수 없어요.", [
            { "text": "취소", "style": "cancel" },
            {
                "text": "삭제",
                "style": "destructive",
                "onPress": async () => {
                    try {
                        await communityData.deletePost(id);
                        router.back();
                    } catch (e) {
                        message(e);
                    }
                },
            },
        ]);
    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <Header
                title="커뮤니티"
                right={
                    post?.mine ? (
                        <Pressable accessibilityLabel="게시물 삭제" onPress={remove}>
                            <Text style={styles.muted}>삭제</Text>
                        </Pressable>
                    ) : undefined
                }
            />
            {loading ? (
                <ActivityIndicator color="#688F6E" />
            ) : !post ? (
                <Pressable onPress={load}>
                    <Empty text={error || "삭제되었거나 찾을 수 없는 게시물이에요."} />
                </Pressable>
            ) : (
                <>
                    <ScrollView
                        ref={scroll}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ "paddingBottom": 20 }}
                    >
                        <View style={styles.article}>
                            <Text style={styles.title}>{post.title}</Text>
                            {post.attachments.length > 0 && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.photos}
                                >
                                    {post.attachments.map(a => (
                                        <Pressable
                                            key={a.id}
                                            accessibilityLabel="사진 크게 보기"
                                            onPress={() => setPicture(a.url)}
                                        >
                                            <Image source={{ "uri": a.url }} style={styles.photo} />
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            )}
                            <Text style={styles.content}>{post.content}</Text>
                            {post.missingPetId && (
                                <Pressable
                                    style={styles.report}
                                    onPress={() =>
                                        router.push({
                                            "pathname": "/emergency/report",
                                            "params": { "petId": post.missingPetId },
                                        } as any)
                                    }
                                >
                                    <Text style={styles.buttonText}>목격 제보하기</Text>
                                </Pressable>
                            )}
                            <PostStats post={post} onChange={load} />
                        </View>
                        {post.comments.length === 0 && <Text style={styles.noComments}>첫 댓글을 남겨주세요.</Text>}
                        {post.comments.map(c => (
                            <View key={c.id} style={styles.comment}>
                                <View style={styles.avatar}>
                                    {c.wroteBy.profile ? (
                                        <Image source={{ "uri": c.wroteBy.profile }} style={styles.avatar} />
                                    ) : (
                                        <Text style={styles.avatarText}>{c.wroteBy.username.slice(0, 1)}</Text>
                                    )}
                                </View>
                                <View style={{ "flex": 1, "gap": 8 }}>
                                    <Text style={styles.username}>{c.wroteBy.username}</Text>
                                    <Text style={styles.commentText}>{c.content}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                    <View style={styles.composer}>
                        <TextInput
                            accessibilityLabel="댓글"
                            placeholder="댓글을 입력해주세요."
                            placeholderTextColor="#898989"
                            multiline
                            maxLength={2000}
                            style={styles.input}
                            value={comment}
                            onChangeText={setComment}
                        />
                        <Pressable
                            accessibilityLabel="댓글 등록"
                            disabled={!comment.trim() || sending}
                            onPress={() => void send()}
                            style={[styles.send, { "opacity": !comment.trim() || sending ? 0.4 : 1 }]}
                        >
                            <Text style={styles.sendText}>{sending ? "…" : "↑"}</Text>
                        </Pressable>
                    </View>
                </>
            )}
            <Modal visible={!!picture} transparent animationType="fade" onRequestClose={() => setPicture(null)}>
                <Pressable accessibilityLabel="사진 닫기" style={styles.viewer} onPress={() => setPicture(null)}>
                    {picture && <Image source={{ "uri": picture }} style={styles.fullPhoto} resizeMode="contain" />}
                    <Text style={styles.close}>닫기 ✕</Text>
                </Pressable>
            </Modal>
        </KeyboardAvoidingView>
    );
}
const getStyles = (top: number) =>
    StyleSheet.create({
        "container": {
            "flex": 1,
            "paddingTop": top + 14,
            "backgroundColor": "#F7F8F3",
        },
        "article": {
            "paddingHorizontal": 21,
            "paddingBottom": 18,
            "gap": 22,
        },
        "title": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 27,
            "color": "#474747",
        },
        "photos": {
            "gap": 10,
        },
        "photo": {
            "width": 160,
            "height": 160,
            "borderRadius": 12,
        },
        "content": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 18,
            "lineHeight": 23,
            "color": "#474747",
            "textDecorationLine": "underline",
            "textDecorationStyle": "dotted",
        },
        "muted": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 16,
            "color": "#898989",
        },
        "comment": {
            "paddingHorizontal": 19,
            "paddingVertical": 13,
            "borderTopWidth": 0.3,
            "borderColor": "#9CA3AF",
            "flexDirection": "row",
            "gap": 10,
        },
        "avatar": {
            "width": 42,
            "height": 42,
            "borderRadius": 21,
            "backgroundColor": "#8C8080",
            "alignItems": "center",
            "justifyContent": "center",
        },
        "avatarText": {
            "fontFamily": "Ownglyph PDH",
            "color": "white",
            "fontSize": 22,
        },
        "username": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 12,
            "color": "#474747",
        },
        "commentText": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 16,
            "lineHeight": 21,
            "color": "#474747",
        },
        "noComments": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 16,
            "color": "#898989",
            "textAlign": "center",
            "padding": 24,
        },
        "composer": {
            "flexDirection": "row",
            "alignItems": "center",
            "gap": 17,
            "paddingHorizontal": 24,
            "paddingVertical": 15,
            "borderTopWidth": 0.3,
            "borderColor": "#9CA3AF",
        },
        "input": {
            "flex": 1,
            "borderRadius": 25,
            "borderWidth": 0.5,
            "borderColor": "#898989",
            "backgroundColor": "#F6F6F6",
            "fontFamily": "Ownglyph PDH",
            "fontSize": 16,
            "paddingHorizontal": 12,
            "paddingVertical": 6,
            "maxHeight": 100,
            "color": "#474747",
        },
        "send": {
            "borderWidth": 0.3,
            "borderColor": "#898989",
            "borderRadius": 20,
            "width": 30,
            "height": 30,
            "alignItems": "center",
            "justifyContent": "center",
        },
        "sendText": {
            "fontSize": 23,
            "color": "#474747",
        },
        "viewer": {
            "flex": 1,
            "backgroundColor": "rgba(0,0,0,0.9)",
            "justifyContent": "center",
        },
        "fullPhoto": {
            "width": "100%",
            "height": "80%",
        },
        "close": {
            "color": "white",
            "textAlign": "center",
            "fontSize": 18,
            "padding": 20,
        },
        "report": {
            "padding": 14,
            "borderRadius": 10,
            "backgroundColor": "#688F6E",
        },
        "buttonText": {
            "fontFamily": "Ownglyph PDH",
            "color": "white",
            "fontSize": 20,
            "textAlign": "center",
        },
    });
