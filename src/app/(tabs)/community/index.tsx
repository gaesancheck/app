import { router } from "expo-router";
import { FlatList, Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import * as Haptics from 'expo-haptics';
import { Colors, LightColors, DarkColors } from "../../../../app.config";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { haptics } from "@/modules/haptics";

import SvgSearch from '@/assets/svg/search.svg';
import SvgBookmark from '@/assets/svg/bookmark.svg';
import SvgBookmarkFilled from '@/assets/svg/bookmark_filled.svg';
import SvgHeart from '@/assets/svg/heart.svg';
import SvgComment from '@/assets/svg/comment.svg';
import SvgPlus from '@/assets/svg/plus.svg';

type Posts = {
    "id": string,
    "title": string,
    "content": string,
    "hearts": number,
    "comments": number,
    "bookmarked": boolean,
    "attachments": {
        "id": string,
        "url": string
    }[]
};

function Category({
    enabled,
    label,
    onPress,
    styles
}: {
    enabled: boolean,
    label: string,
    onPress?: () => void,
    styles: any
}) {
    return <TouchableOpacity style={[styles, {
        "backgroundColor": enabled ? "#474747" : "#E2E2E2"
    }]} disabled={enabled} onPress={() => {
        haptics.light();
        onPress?.();
    }}>
        <Text style={{
            "fontFamily": "ParkDaHyeon",
            "fontSize": 15,
            "color": enabled ? "#FAFBF7" : "#848484"
        }}>{label}</Text>
    </TouchableOpacity>
}

export default function Page() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors, safeArea);

    const posts: Posts[] = [
        {
            "id": "1",
            "title": "강아지가 이상해요",
            "content": "강아지가 이상해요. 강아지가 목욕탕을 너무 좋아해요. 장난이 아니라 진짜 바나나우유 들고 아저씨마냥 목욕탕에서 힐링을 해요 ㅜㅜ",
            "hearts": 12,
            "comments": 5,
            "bookmarked": false,
            "attachments": [
                {
                    "id": "1",
                    "url": "https://f.ny64.kr/photos/help.jpg"
                },
                {
                    "id": "2",
                    "url": "https://f.ny64.kr/photos/help.jpg"
                }
            ]
        },
        {
            "id": "2",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        },
        {
            "id": "3",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        },
        {
            "id": "4",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        },
        {
            "id": "5",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        },
        {
            "id": "6",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        },
        {
            "id": "7",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        },
        {
            "id": "8",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        },
        {
            "id": "9",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        },
        {
            "id": "10",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        },
        {
            "id": "11",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        },
        {
            "id": "12",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        },
        {
            "id": "13",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        },
        {
            "id": "14",
            "title": "오늘 방신시장에서",
            "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
            "hearts": 12,
            "comments": 5,
            "bookmarked": true,
            "attachments": []
        }
    ];

    const [currentCategory, setCurrentCategory] = useState<"popular" | "recent" | "others">("popular");

    return <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerText}>커뮤니티</Text>
            <View style={styles.headerItems}>
                <TouchableOpacity hitSlop={7}>
                    <SvgSearch width={15} height={15} />
                </TouchableOpacity>
                <TouchableOpacity hitSlop={7}>
                    <SvgBookmark width={15} height={15} />
                </TouchableOpacity>
            </View>
        </View>
        <View style={styles.categories}>
            <Category styles={styles.category} onPress={() => setCurrentCategory("popular")} enabled={currentCategory === "popular"} label="인기" />
            <Category styles={styles.category} onPress={() => setCurrentCategory("recent")} enabled={currentCategory === "recent"} label="최근" />
            <Category styles={styles.category} onPress={() => setCurrentCategory("others")} enabled={currentCategory === "others"} label="그 외 등등" />
        </View>
        <FlatList
            style={styles.list}
            data={posts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.posts}
            renderItem={({ item }) => <View style={styles.post}>
                <View style={styles.postContent}>
                    {item.attachments.length > 0 && <View style={styles.attachments}>
                        {item.attachments.map(v => <Image
                            width={85}
                            height={85}
                            key={v.id}
                            source={{ "uri": v.url }}
                            style={{ "borderRadius": 12 }}
                        />)}
                    </View>}
                    <Text style={styles.postTitle}>{item.title}</Text>
                    <Text style={styles.postDescription}>{item.content}</Text>
                </View>
                <View style={styles.postBottom}>
                    <View style={styles.postStatus}>
                        <SvgHeart style={styles.postStatusIcon} />
                        <Text style={styles.postStatusText}>{item.hearts}</Text>
                    </View>
                    <View style={styles.postStatus}>
                        <SvgComment style={styles.postStatusIcon} />
                        <Text style={styles.postStatusText}>{item.comments}</Text>
                    </View>
                    <TouchableOpacity style={styles.bookmark} hitSlop={7} onPress={() => {
                        haptics.light();

                        // bookmark
                    }}>
                        {item.bookmarked ? <SvgBookmarkFilled /> : <SvgBookmark color="#9CA3AF" />}
                    </TouchableOpacity>
                </View>
            </View>}
        />
        <Pressable style={styles.writePost} onPress={() => {
            router.push("/community/write");
        }}>
            <SvgPlus width={15} height={15} />
        </Pressable>
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
        "paddingHorizontal": 32
    },
    "headerText": {
        "fontFamily": "ParkDaHyeon",
        "color": "#2F3A2D",
        "fontSize": 28
    },
    "headerItems": {
        "flexDirection": "row",
        "gap": 19,
        "alignItems": "center"
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
        "boxShadow": "rgba(0, 0, 0, 0.25) 0 3px 3px 0"
    },
    "categories": {
        "marginTop": 27,
        "marginBottom": 23,
        "flexDirection": "row",
        "gap": 12,
        "paddingHorizontal": 32
    },
    "category": {
        "height": 24,
        "borderRadius": 20,
        "paddingVertical": 4,
        "paddingHorizontal": 10
    },
    "list": {
        "flex": 1
    },
    "posts": {
        "flexGrow": 1,
        "paddingHorizontal": 19,
        "paddingVertical": 10,
        "paddingBottom": 70,
        "gap": 16
    },
    "post": {
        "borderColor": "#9A9A9A",
        "borderStyle": "solid",
        "borderWidth": 0.7,
        "borderRadius": 10,
        "flexDirection": "column",
        "gap": 6,
        "paddingHorizontal": 12,
        "paddingVertical": 10
    },
    "postContent": {
        "gap": 6,
        "flexDirection": "column"
    },
    "postBottom": {
        "flexDirection": "row",
        "gap": 20
    },
    "postStatus": {
        "flexDirection": "row",
        "gap": 4
    },
    "postStatusIcon": {
        "width": 15,
        "height": 15
    },
    "postStatusText": {
        "marginVertical": "auto",
        "fontFamily": "ParkDaHyeon",
        "fontSize": 12,
        "color": "#6E6E6E"
    },
    "bookmark": {
        "marginLeft": "auto",
        "width": 11.67,
        "height": 15,
    },
    "attachments": {
        "flexDirection": "row",
        "gap": 9
    },
    "postTitle": {
        "fontSize": 22,
        "fontFamily": "ParkDaHyeon",
        "color": "#474747"
    },
    "postDescription": {
        "fontSize": 14,
        "fontFamily": "ParkDaHyeon",
        "color": "#474747",
        "textDecorationStyle": "dotted",
        "textDecorationLine": "underline",
        "textDecorationColor": "#474747",
        "lineHeight": 17,
        "textAlignVertical": "top"
    }
});
