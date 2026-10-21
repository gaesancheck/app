import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import * as Haptics from 'expo-haptics';

import SvgSearch from '@/assets/svg/search.svg';
import SvgList from '@/assets/svg/list.svg';
import SvgHeart from '@/assets/svg/heart.svg';
import SvgComment from '@/assets/svg/comment.svg';
import SvgBookmark from '@/assets/svg/bookmark.svg';

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
    onPress
}: {
    enabled: boolean,
    label: string,
    onPress?: () => void
}) {
    return <TouchableOpacity style={[styles.category, {
        "backgroundColor": enabled ? "#474747" : "#E2E2E2"
    }]} onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        }
    ];

    const [currentCategory, setCurrentCategory] = useState<"popular" | "recent" | "others">("popular");

    return <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerText}>커뮤니티</Text>
            <View style={styles.headerItems}>
                <TouchableOpacity>
                    <SvgSearch width={15} height={15} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <SvgList width={15} height={15} />
                </TouchableOpacity>
            </View>
        </View>
        <View style={styles.categories}>
            <Category onPress={() => setCurrentCategory("popular")} enabled={currentCategory === "popular"} label="인기" />
            <Category onPress={() => setCurrentCategory("recent")} enabled={currentCategory === "recent"} label="최근" />
            <Category onPress={() => setCurrentCategory("others")} enabled={currentCategory === "others"} label="그 외 등등" />
        </View>
        <FlatList
            style={styles.list}
            data={posts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.posts}
            renderItem={(info) => <View style={styles.post}>
                <View style={styles.postContent}>

                </View>
                <View style={styles.postBottom}>
                    <View style={styles.postStatus}>
                        <SvgHeart style={styles.postStatusIcon} />
                        <Text style={styles.postStatusText}>{info.item.hearts}</Text>
                    </View>
                    <View style={styles.postStatus}>
                        <SvgComment style={styles.postStatusIcon} />
                        <Text style={styles.postStatusText}>{info.item.comments}</Text>
                    </View>
                    <TouchableOpacity style={styles.bookmark}>
                        <SvgBookmark />
                    </TouchableOpacity>
                </View>
            </View>}
        />
    </View>;
}

const styles = StyleSheet.create({
    "container": {
        "flex": 1,
        "flexDirection": "column"
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
        "gap": 19
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
        "paddingHorizontal": 19
    },
    "post": {
        "borderColor": "#9A9A9A",
        "borderStyle": "solid",
        "borderWidth": 0.7,
        "flexDirection": "column",
        "gap": 6,
        "paddingHorizontal": 12,
        "paddingVertical": 10
    },
    "postContent": {

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
    }
});
