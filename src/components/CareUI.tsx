import type { ReactNode } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Directory, File, Paths } from "expo-file-system";
import * as Crypto from "expo-crypto";
import { LightColors } from "../../app.config";
import Back from "@/assets/svg/account-emergency/back.svg";
import Empty from "@/assets/svg/account-emergency/empty.svg";
import Avatar from "@/assets/svg/account-emergency/avatar.svg";
import Chevron from "@/assets/svg/account-emergency/chevron.svg";
import Camera from "@/assets/svg/account-emergency/camera.svg";

export const careColors = { "background": "#F7F8F3", "green": LightColors.green_light2, "ink": "#474747", "muted": "#9CA3AF" };
export function CareText({ children, style }: { children: ReactNode; style?: React.ComponentProps<typeof Text>["style"] }) {
    return <Text style={[ui.text, style]}>{children}</Text>;
}
export function CareScreen({ title, children, back = true, action, footer, headerGap = 29 }: {
    title: string; children: ReactNode; back?: boolean; action?: ReactNode; footer?: ReactNode; headerGap?: number;
}) {
    const safe = useSafeAreaInsets();
    return <KeyboardAvoidingView style={[ui.screen, { "paddingTop": Math.max(safe.top + 14, 70), "paddingLeft": safe.left, "paddingRight": safe.right }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[ui.header, { "marginBottom": headerGap }]}>
            {back && <Pressable accessibilityRole="button" accessibilityLabel="뒤로 가기" hitSlop={12} style={ui.back} onPress={() => router.back()}><Back /></Pressable>}
            <CareText style={[ui.title, !back && ui.mainTitle]}>{title}</CareText>
            <View style={ui.headerAction}>{action}</View>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
            contentContainerStyle={ui.body}>{children}</ScrollView>
        {footer && <View style={ui.footer}>{footer}</View>}
    </KeyboardAvoidingView>;
}
export function CareButton({ children, onPress, disabled, outline = false, small = false }: {
    children: ReactNode; onPress: () => void; disabled?: boolean; outline?: boolean; small?: boolean;
}) {
    return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
        style={[ui.button, outline && ui.outline, small && ui.smallButton, disabled && { "opacity": 0.45 }]}>
        <CareText style={[ui.buttonText, outline && { "color": careColors.green }, small && { "fontSize": 15 }]}>{children}</CareText>
    </Pressable>;
}
export function Field({ label, compact, ...props }: TextInputProps & { label: string; compact?: boolean }) {
    return <View style={ui.field}><CareText style={[ui.label, compact && { "fontSize": 20, "color": "#000" }]}>{label}</CareText>
        <TextInput accessibilityLabel={label} placeholderTextColor={careColors.muted} {...props}
            style={[ui.input, compact && ui.compactInput, props.multiline && ui.multiline, props.style]} />
    </View>;
}
export function CareRow({ title, subtitle, picture, avatar = false, onPress }: {
    title: string; subtitle?: string; picture?: string; avatar?: boolean; onPress: () => void;
}) {
    return <Pressable accessibilityRole="button" onPress={onPress} style={ui.row}>
        {avatar && (picture ? <Image source={{ "uri": picture }} style={ui.avatar} /> : <Avatar />)}
        <View style={ui.rowCopy}><CareText>{title}</CareText>{subtitle && <CareText style={ui.subtitle}>{subtitle}</CareText>}</View>
        <Chevron />
    </Pressable>;
}
export function EmptyState({ children }: { children: ReactNode }) {
    return <View style={ui.empty}><Empty /><CareText style={ui.emptyText}>{children}</CareText></View>;
}
export function LoadingState() { return <ActivityIndicator color={careColors.green} style={{ "marginTop": 80 }} />; }
export function ErrorState({ onRetry }: { onRetry: () => void }) {
    return <View style={ui.empty}><CareText>정보를 불러오지 못했어요.</CareText><CareButton small outline onPress={onRetry}>다시 시도</CareButton></View>;
}
export function showCareError(error: unknown) {
    Alert.alert("확인해주세요", error instanceof Error ? error.message : "저장하지 못했어요. 다시 시도해주세요.");
}
export async function previewCareAttachment(uri: string, title: string): Promise<void> {
    if (uri.startsWith("file://")) await new File(uri).preview({ "title": title });
    else await Linking.openURL(uri);
}
export function persistFile(uri: string, name = "photo.jpg"): string {
    const directory = new Directory(Paths.document, "care-attachments");
    directory.create({ "idempotent": true, "intermediates": true });
    const extension = name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "jpg";
    const destination = new File(directory, `${Crypto.randomUUID()}.${extension}`);
    new File(uri).copy(destination);
    return destination.uri;
}
export async function selectCarePhotos(multiple = false): Promise<string[]> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new Error("설정에서 사진 접근 권한을 허용해주세요.");
    const result = await ImagePicker.launchImageLibraryAsync({ "mediaTypes": ["images"], "allowsMultipleSelection": multiple, "quality": 0.8 });
    return result.canceled ? [] : result.assets.map(asset => persistFile(asset.uri, asset.fileName ?? "photo.jpg"));
}
export function PhotoPicker({ pictures, onChange }: { pictures: string[]; onChange: (pictures: string[]) => void }) {
    return <View style={ui.field}><CareText style={ui.label}>사진 첨부</CareText>
        <View style={ui.photos}>{pictures.map(uri => <Pressable key={uri} accessibilityRole="button" accessibilityLabel="첨부 사진 삭제" onPress={() => onChange(pictures.filter(p => p !== uri))}>
            <Image source={{ "uri": uri }} style={ui.photo} /></Pressable>)}</View>
        <Pressable accessibilityRole="button" accessibilityLabel="사진 첨부" style={ui.photoPicker} onPress={async () => {
            try { onChange([...pictures, ...await selectCarePhotos(true)]); } catch (error) { showCareError(error); }
        }}><Camera /><CareText style={ui.subtitle}>사진이 있다면 올려주세요</CareText></Pressable>
    </View>;
}
export const ui = StyleSheet.create({
    "screen": { "flex": 1, "backgroundColor": careColors.background },
    "header": { "minHeight": 36, "marginHorizontal": 32, "alignItems": "center", "justifyContent": "center", "marginBottom": 29 },
    "back": { "position": "absolute", "left": 0, "zIndex": 1 },
    "headerAction": { "position": "absolute", "right": 0 },
    "title": { "fontSize": 20, "color": "#2F3A2D", "letterSpacing": 0.6 },
    "mainTitle": { "fontSize": 28, "alignSelf": "flex-start", "letterSpacing": 0.84 },
    "body": { "paddingHorizontal": 19, "paddingBottom": 28, "flexGrow": 1 },
    "text": { "fontFamily": "Ownglyph PDH", "fontSize": 16, "color": careColors.ink },
    "footer": { "paddingHorizontal": 31, "paddingTop": 12, "paddingBottom": 28 },
    "button": { "minHeight": 55, "borderRadius": 10, "backgroundColor": careColors.green, "alignItems": "center", "justifyContent": "center", "paddingHorizontal": 14 },
    "buttonText": { "color": "#FFF", "fontSize": 25, "textAlign": "center" },
    "outline": { "backgroundColor": "#FFF", "borderWidth": 1, "borderColor": careColors.green, "borderRadius": 20 },
    "smallButton": { "minHeight": 28, "paddingVertical": 3, "paddingHorizontal": 16 },
    "field": { "gap": 8, "marginBottom": 18 },
    "label": { "fontSize": 18, "color": "#6E6E6E" },
    "input": { "backgroundColor": "#FFF", "borderWidth": 1, "borderColor": "#E5E7EB", "borderRadius": 8, "minHeight": 55, "paddingHorizontal": 18, "paddingVertical": 12, "fontFamily": "Ownglyph PDH", "fontSize": 18, "color": careColors.ink },
    "compactInput": { "minHeight": 36, "paddingHorizontal": 12, "paddingVertical": 7, "fontSize": 17, "borderRadius": 5, "borderColor": careColors.green, "borderWidth": 0.5 },
    "multiline": { "minHeight": 155, "textAlignVertical": "top" },
    "row": { "minHeight": 42, "flexDirection": "row", "alignItems": "center", "gap": 13, "marginBottom": 12 },
    "rowCopy": { "flex": 1, "gap": 4 },
    "subtitle": { "fontSize": 12, "color": "#9A9A9A" },
    "avatar": { "width": 42, "height": 42, "borderRadius": 21, "backgroundColor": "#ECEEE6" },
    "empty": { "flex": 1, "minHeight": 330, "alignItems": "center", "justifyContent": "center", "gap": 35 },
    "emptyText": { "fontSize": 20, "textAlign": "center" },
    "photos": { "flexDirection": "row", "flexWrap": "wrap", "gap": 8 },
    "photo": { "width": 85, "height": 85, "borderRadius": 12 },
    "photoPicker": { "minHeight": 170, "borderRadius": 10, "borderWidth": 2, "borderStyle": "dashed", "borderColor": "#9CA3AF", "alignItems": "center", "justifyContent": "center", "gap": 13 },
    "card": { "padding": 13, "borderWidth": 0.7, "borderColor": "#9A9A9A", "borderRadius": 12, "backgroundColor": "#FAFBF7", "marginBottom": 16 },
    "pill": { "borderRadius": 20, "borderWidth": 1, "borderColor": careColors.green, "paddingVertical": 4, "paddingHorizontal": 10, "alignSelf": "flex-start", "backgroundColor": "#FFF" },
});
