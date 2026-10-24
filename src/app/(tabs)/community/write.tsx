import { Alert, Dimensions, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../../../app.config";
import { useState } from "react";
import * as Haptics from 'expo-haptics';
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker';

import SvgBack from '@/assets/svg/back.svg';
import SvgCamera from '@/assets/svg/camera.svg';

export default function Page() {
    const safeArea = useSafeAreaInsets();
    const styles = getStyles(safeArea);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [pictures, setPictures] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const uploadPost = async () => {
        setIsUploading(true);
    };

    return <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.headerBack} hitSlop={7} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
            }}>
                <SvgBack width={15} height={15} />
            </TouchableOpacity>
            <Text style={styles.headerText}>게시물 작성</Text>
        </View>
        <View style={styles.form}>
            <View style={styles.section}>
                <Text style={styles.sectionText}>제목</Text>
                <TextInput
                    style={[
                        styles.sectionTextInput,
                        {
                            "fontFamily": title.length > 0 ? "NanumSquareNeo-Regular" : "ParkDaHyeon",
                            "fontSize": title.length > 0 ? 16 : 18
                        }
                    ]}
                    placeholder="제목을 입력해주세요"
                    placeholderTextColor={"#9CA3AF"}
                    value={title}
                    onChangeText={(v) => setTitle(v)}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionText}>내용</Text>
                <TextInput
                    style={[
                        styles.sectionTextInput, { "height": 155 },
                        {
                            "fontFamily": content.length > 0 ? "NanumSquareNeo-Regular" : "ParkDaHyeon",
                            "fontSize": content.length > 0 ? 16 : 18
                        }
                    ]}
                    placeholder="내용을 입력해주세요"
                    placeholderTextColor={"#9CA3AF"}
                    multiline
                    value={content}
                    onChangeText={(v) => setContent(v)}
                />
            </View>
            {pictures.length > 0 ? <View>
            </View> : <Pressable style={styles.section} onPress={async () => {
                const document = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!document.granted) {
                    // 임시
                    Alert.alert("사진 권한", "설정에서 사진 권한을 허용해주세요.");
                    return;
                }


            }}>
                <Text style={styles.sectionText}>사진 첨부</Text>
                <View style={styles.noPicture}>
                    <SvgCamera width={47} height={38} />
                    <Text style={styles.noPictureText}>사진을 선택해 주세요</Text>
                </View>
            </Pressable>}
            <Pressable style={[styles.upload, { "opacity": isUploading ? 0.5 : 1 }]} onPress={uploadPost}>
                <Text style={styles.uploadText}>게시물 올리기</Text>
            </Pressable>
        </View>
    </View>;
}

const getStyles = (safeArea: EdgeInsets) => StyleSheet.create({
    "container": {
        "flex": 1,
        "flexDirection": "column",
        "backgroundColor": COLORS.background,
        "width": "100%",
        "paddingTop": Platform.select({ "android": safeArea.top + 14, "ios": 76 }),
        "paddingLeft": safeArea.left,
        "paddingRight": safeArea.right
    },
    "header": {
        "flexDirection": "row",
        "justifyContent": "center",
        "alignItems": "center",
        "paddingHorizontal": 32
    },
    "headerBack": {
        "position": "absolute",
        "left": 32
    },
    "headerText": {
        "textAlign": "center",
        "fontFamily": "ParkDaHyeon",
        "fontSize": 20
    },
    "form": {
        "marginTop": 41,
        "marginHorizontal": 19,
        "width": Dimensions.get("window").width - 38,
        "height": "100%",
        "flexDirection": "column",
        "gap": 18
    },
    "section": {
        "flexDirection": "column",
        "gap": 8
    },
    "sectionText": {
        "color": "#6E6E6E",
        "fontFamily": "ParkDaHyeon",
        "fontSize": 18
    },
    "sectionTextInput": {
        "paddingHorizontal": 18,
        "paddingVertical": 16,
        "borderColor": "#E5E7EB",
        "borderStyle": "solid",
        "borderWidth": 1,
        "backgroundColor": "#FFFFFF",
        "borderRadius": 8,
        "color": "#525252",
    },
    "noPicture": {
        "borderRadius": 10,
        "borderWidth": 2,
        "borderStyle": "dashed",
        "borderColor": "#9CA3AF",
        "width": "100%",
        "height": 170,
        "justifyContent": "center",
        "alignItems": "center",
        "gap": 13,
        "flexDirection": "column"
    },
    "noPictureText": {
        "fontFamily": "ParkDaHyeon",
        "fontSize": 14,
        "color": "#6E6E6E"
    },
    "upload": {
        "width": "100%",
        "backgroundColor": COLORS.green_light2,
        "height": 55,
        "marginTop": 55,
        "justifyContent": "center",
        "alignItems": "center",
        "borderRadius": 10
    },
    "uploadText": {
        "fontFamily": "ParkDaHyeon",
        "color": "#fff",
        "fontSize": 25
    }
});
