import { useState } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Crypto from "expo-crypto";
import { CareScreen, CareText, CareButton, Field, PhotoPicker, LoadingState, ErrorState, showCareError } from "@/components/CareUI";
import { RouteMap } from "@/components/EmergencyUI";
import useCareData from "@/modules/useCareData";
import { careData } from "@/modules/careData";
import { missingPetExamples } from "@/modules/emergencyData";

export default function Page() {
    const { petId } = useLocalSearchParams<{ petId: string }>();
    const { data, failed, retry } = useCareData();
    const pet = [data?.emergency, ...missingPetExamples].find(item => item?.id === petId);
    const [time, setTime] = useState("");
    const [position, setPosition] = useState("");
    const [content, setContent] = useState("");
    const [pictures, setPictures] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);
    const submit = async () => {
        if (busy || !pet) return;
        if (!time.trim() || !position.trim()) { showCareError(new Error("마주친 시각과 장소를 입력해주세요.")); return; }
        setBusy(true);
        try {
            const report = { "id": Crypto.randomUUID(), "petId": pet.id, "petName": pet.name, "time": time.trim(), "position": position.trim(), "content": content.trim(), "pictures": pictures, "createdAt": Date.now(), "messages": [] };
            await careData.update(current => ({ ...current, "reports": [report, ...current.reports] }));
            Alert.alert("제보 저장", "제보 내용을 이 기기에 저장했어요. 보호자에게 실제로 전송하는 기능은 아직 준비 중이에요.", [{ "text": "확인", "onPress": () => router.replace("/(tabs)/emergency/reports") }]);
        } catch (error) { showCareError(error); } finally { setBusy(false); }
    };
    return <CareScreen title="제보글 작성" footer={pet ? <CareButton disabled={busy || !time.trim() || !position.trim()} onPress={() => void submit()}>{busy ? "저장 중…" : "제보글 보내기"}</CareButton> : undefined}>
        {failed ? <ErrorState onRetry={retry} /> : !data ? <LoadingState /> : !pet ? <CareText>실종동물 정보를 찾을 수 없어요.</CareText> : <>
            <Field label="마주친 시각" value={time} onChangeText={setTime} placeholder="마주친 시각을 입력해주세요" />
            <CareText style={{ "fontSize": 18, "color": "#6E6E6E", "marginBottom": 11 }}>마주친 장소</CareText><RouteMap />
            <Field label="상세 위치" value={position} onChangeText={setPosition} placeholder="자세한 위치를 입력해주세요" />
            <Field label="내용" value={content} onChangeText={setContent} placeholder="그 외에 전달하고싶은 내용이 있다면 입력해주세요." multiline />
            <PhotoPicker pictures={pictures} onChange={setPictures} />
        </>}
    </CareScreen>;
}
