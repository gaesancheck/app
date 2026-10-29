import { Alert, Dimensions, Image, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { LightColors, DarkColors, Colors } from "../../../../app.config";
import { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import useChooseByScheme from "@/modules/useChooseByScheme";
import { haptics } from "@/modules/haptics";

import SvgBack from '@/assets/svg/back.svg';
import SvgCamera from '@/assets/svg/camera.svg';

export default function Page() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors, safeArea);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [pictures, setPictures] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const uploadPost = async () => {
        setIsUploading(true);
    };

    const selectPhotos = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            // 임시
            Alert.alert("사진 권한", "설정에서 사진 권한을 허용해주세요.");
            return;
        }

        const images = await ImagePicker.launchImageLibraryAsync({
            "allowsMultipleSelection": true
        });
        if (!images.assets) return;

        setPictures(v => [...v, ...images.assets]);
    };

    return <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.headerBack} hitSlop={7} onPress={() => {
                haptics.light();
                router.back();
            }}>
                <SvgBack width={15} height={15} />
            </TouchableOpacity>
            <Text style={styles.headerText}>게시물 작성</Text>
        </View>
        <View style={styles.form}>
            <View style={styles.section}>
                <Text style={styles.sectionText}>제목</Text>
                <View>
                    <TextInput
                        style={styles.sectionTextInput}
                        accessibilityLabel="제목"
                        value={title}
                        onChangeText={(v) => setTitle(v)}
                    />
                    {title.length === 0 && <Text
                        style={styles.inputPlaceholder}
                        pointerEvents="none"
                        accessible={false}
                    >제목을 입력해주세요</Text>}
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionText}>내용</Text>
                <View>
                    <TextInput
                        style={[styles.sectionTextInput, styles.contentInput]}
                        accessibilityLabel="내용"
                        multiline
                        value={content}
                        onChangeText={(v) => setContent(v)}
                    />
                    {content.length === 0 && <Text
                        style={styles.inputPlaceholder}
                        pointerEvents="none"
                        accessible={false}
                    >내용을 입력해주세요</Text>}
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionText}>사진 첨부</Text>
                {pictures.length > 0 ? <View style={styles.pictures}>
                    {pictures.map(v => <Pressable key={v.assetId} onPress={() => {
                        haptics.light();
                        setPictures(a => a.filter(b => b.assetId !== v.assetId));
                    }}>
                        <Image
                            style={styles.picture}
                            source={{ "uri": v.uri }}
                            width={85}
                            height={85}
                        />
                    </Pressable>)}
                    <Pressable style={styles.addMorePicture} onPress={selectPhotos}>
                        <SvgCamera width={32} height={29} />
                    </Pressable>
                </View> : <Pressable style={styles.noPicture} onPress={selectPhotos}>
                    <SvgCamera width={47} height={38} />
                    <Text style={styles.noPictureText}>사진을 선택해 주세요</Text>
                </Pressable>}
            </View>
        </View>
        <Pressable style={[styles.upload, { "opacity": isUploading ? 0.5 : 1 }]} onPress={uploadPost}>
            <Text style={styles.uploadText}>게시물 올리기</Text>
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
        "fontFamily": "Ownglyph PDH",
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
        "fontFamily": "Ownglyph PDH",
        "fontSize": 18
    },
    "sectionTextInput": {
        "fontFamily": "NanumSquareNeo-Regular",
        "fontSize": 16,
        "paddingHorizontal": 18,
        "paddingVertical": 16,
        "borderColor": "#E5E7EB",
        "borderStyle": "solid",
        "borderWidth": 1,
        "backgroundColor": "#FFFFFF",
        "borderRadius": 8,
        "color": "#525252",
        "textAlignVertical": "top"
    },
    "contentInput": {
        "height": 155
    },
    "inputPlaceholder": {
        "position": "absolute",
        "top": 17,
        "left": 19,
        "right": 19,
        "fontFamily": "Ownglyph PDH",
        "fontSize": 18,
        "color": "#9CA3AF"
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
        "fontFamily": "Ownglyph PDH",
        "fontSize": 14,
        "color": "#6E6E6E"
    },
    "upload": {
        "position": "absolute",
        "bottom": 28,
        "left": safeArea.left + 19,
        "right": safeArea.right + 19,
        "backgroundColor": colors.green_light2,
        "height": 55,
        "justifyContent": "center",
        "alignItems": "center",
        "borderRadius": 10
    },
    "uploadText": {
        "fontFamily": "Ownglyph PDH",
        "color": "#fff",
        "fontSize": 25
    },
    "pictures": {
        "flexDirection": "row",
        "flexWrap": "wrap",
        "gap": 7
    },
    "picture": {
        "borderRadius": 10
    },
    "addMorePicture": {
        "borderRadius": 10,
        "borderWidth": 2,
        "borderStyle": "dashed",
        "borderColor": "#9CA3AF",
        "width": 85,
        "height": 85,
        "justifyContent": "center",
        "alignItems": "center"
    }
});
