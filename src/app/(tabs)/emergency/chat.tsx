import { useState } from "react";
import { Image, Pressable, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Crypto from "expo-crypto";
import { CareScreen, CareText, LoadingState, ErrorState, ui, showCareError } from "@/components/CareUI";
import { RouteMap } from "@/components/EmergencyUI";
import useCareData from "@/modules/useCareData";
import { careData } from "@/modules/careData";

export default function Page() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data, setData, failed, retry } = useCareData();
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const report = data?.reports.find(item => item.id === id);
    const send = async () => {
        const content = message.trim();
        if (!content || busy || !report) return;
        setBusy(true);
        try {
            const next = { "id": Crypto.randomUUID(), "content": content, "createdAt": Date.now() };
            setData(await careData.update(current => ({ ...current, "reports": current.reports.map(item => item.id === id ? { ...item, "messages": [...item.messages, next] } : item) })));
            setMessage("");
        } catch (error) { showCareError(error); } finally { setBusy(false); }
    };
    return <CareScreen title="채팅방" footer={report ? <View style={{ "flexDirection": "row", "alignItems": "center", "gap": 12 }}>
        <TextInput accessibilityLabel="메시지" placeholder="내용을 입력해주세요." value={message} onChangeText={setMessage} onSubmitEditing={() => void send()} style={[ui.input, { "flex": 1, "minHeight": 36, "borderRadius": 20, "fontSize": 15 }]} />
        <Pressable accessibilityRole="button" accessibilityLabel="메시지 저장" disabled={busy || !message.trim()} onPress={() => void send()}><CareText style={{ "fontSize": 24, "color": "#688F6E" }}>↑</CareText></Pressable>
    </View> : undefined}>
        {failed ? <ErrorState onRetry={retry} /> : !data ? <LoadingState /> : !report ? <CareText>제보를 찾을 수 없어요.</CareText> : <>
            <CareText style={{ "fontSize": 12, "color": "#9A9A9A", "textAlign": "center", "marginBottom": 20 }}>전송 대기 · 대화 내용은 이 기기에만 저장돼요.</CareText>
            <View style={[ui.card, { "marginLeft": 40 }]}><RouteMap height={183} /><View style={{ "flexDirection": "row", "gap": 9, "flexWrap": "wrap", "marginBottom": 10 }}>{report.pictures.map(uri => <Image key={uri} source={{ "uri": uri }} style={ui.photo} />)}</View>
                <CareText style={{ "lineHeight": 26 }}>목격시각: {report.time}{"\n"}목격위치: {report.position}{"\n"}내용: {report.content}</CareText>
            </View>
            {report.messages.map(item => <View key={item.id} style={{ "alignSelf": "flex-end", "maxWidth": "85%", "backgroundColor": "#EDF2E9", "borderRadius": 10, "padding": 10, "marginBottom": 14 }}><CareText>{item.content}</CareText></View>)}
        </>}
    </CareScreen>;
}
