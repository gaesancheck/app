import { useRef, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as Crypto from "expo-crypto";
import { CareScreen, CareText, previewCareAttachment, CareButton, Field, persistFile, showCareError, careColors } from "@/components/CareUI";
import SelectionDropdown from "@/components/SelectionDropdown";
import { careData, type Attachment } from "@/modules/careData";
import { APIMy } from "@/modules/rest/my";
import Success from "@/assets/svg/account-emergency/success.svg";

export default function Page() {
    const [contactType, setContactType] = useState("질문");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const submissionId = useRef<string | null>(null);
    const submit = async () => {
        if (busy || !title.trim() || !content.trim()) return;
        setBusy(true);
        try {
            const payload = { "contactType": contactType, "title": title.trim(), "content": content.trim(), "attachments": attachments };
            // The current APIMy adapter is a mock. Keep the submitted inquiry locally for its list/detail screens.
            if (!submissionId.current) {
                const result = await APIMy.sendContact(payload);
                if (!result.success) throw new Error(result.data.message);
                submissionId.current = Crypto.randomUUID();
            }
            const id = submissionId.current;
            await careData.update(current => ({ ...current, "inquiries": current.inquiries.some(item => item.id === id) ? current.inquiries : [{ ...payload, "id": id, "createdAt": Date.now() }, ...current.inquiries] }));
            setDone(true);
        } catch (error) { showCareError(error); } finally { setBusy(false); }
    };
    return <CareScreen title={done ? "문의글 작성 완료" : "문의글 작성"} footer={<CareButton disabled={busy || (!done && (!title.trim() || !content.trim()))} onPress={() => {
        if (done) { setDone(false); setTitle(""); setContent(""); setAttachments([]); submissionId.current = null; } else void submit();
    }}>{done ? "새 문의글 작성하기" : busy ? "저장 중…" : "문의하기"}</CareButton>}>
        {done ? <View style={{ "flex": 1, "justifyContent": "center", "alignItems": "center", "gap": 30 }}>
            <Success /><CareText style={{ "fontSize": 24 }}>문의글 작성이 완료되었어요!</CareText>
            <CareText style={{ "fontSize": 14, "color": "#9A9A9A", "textAlign": "center", "lineHeight": 21 }}>문의는 이 기기에만 저장됐어요.
실제 문의 접수는 아직 지원하지 않아요.</CareText>
            <CareButton small outline onPress={() => router.replace("/(tabs)/mypage/inquiries")}>내 문의글 확인하러가기  ›</CareButton>
        </View> : <>
            <CareText style={{ "fontSize": 13, "color": "#9A9A9A", "marginBottom": 14 }}>현재 문의글은 이 기기에만 저장돼요.</CareText>
            <View style={{ "gap": 8, "marginBottom": 18 }}><CareText style={{ "fontSize": 18, "color": "#6E6E6E" }}>문의 유형</CareText>
                <SelectionDropdown value={contactType} options={["질문", "오류 신고", "건의"].map(label => ({ "label": label, "value": label }))} onChange={value => setContactType(String(value))} containerStyle={{ "backgroundColor": "#FFF", "padding": 18, "borderRadius": 8, "borderWidth": 1, "borderColor": "#E5E7EB" }}><CareText>{contactType}  ⌄</CareText></SelectionDropdown>
            </View>
            <Field label="제목" value={title} onChangeText={setTitle} placeholder="제목을 입력해주세요" maxLength={120} />
            <Field label="내용" value={content} onChangeText={setContent} placeholder="내용을 입력해주세요" multiline maxLength={5000} />
            <Pressable accessibilityRole="button" style={{ "backgroundColor": "#EDF2E9", "borderRadius": 10, "padding": 16, "minHeight": 95, "gap": 5 }} onPress={async () => {
                try {
                    const result = await DocumentPicker.getDocumentAsync({ "multiple": true, "copyToCacheDirectory": true });
                    if (!result.canceled) setAttachments(current => [...current, ...result.assets.map(asset => ({ "name": asset.name, "url": persistFile(asset.uri, asset.name) }))]);
                } catch (error) { showCareError(error); }
            }}><CareText style={{ "color": careColors.green, "fontSize": 15 }}>파일 첨부하기</CareText><Image source={require("@/assets/svg/account-emergency/attachment.png")} style={{ "width": 11.359, "height": 12 }} /></Pressable>
            {attachments.map((file, index) => <View key={file.url} style={{ "flexDirection": "row", "alignItems": "center", "gap": 12, "marginTop": 10 }}>
                <Pressable style={{ "flex": 1 }} onPress={() => { void previewCareAttachment(file.url, file.name).catch(showCareError); }}><CareText>{file.name}</CareText></Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`${file.name} 첨부 취소`} hitSlop={10} onPress={() => setAttachments(current => current.filter((_, position) => index !== position))}><CareText>×</CareText></Pressable>
            </View>)}
        </>}
    </CareScreen>;
}
