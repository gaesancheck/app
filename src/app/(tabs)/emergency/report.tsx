import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CareScreen, CareText, CareButton, Field, PhotoPicker, LoadingState, ErrorState, showCareError } from "@/components/CareUI";
import { RouteMap } from "@/components/EmergencyUI";
import useCareData from "@/modules/useCareData";
import type { MissingPet } from "@/modules/careData";
import { emergencyService } from "@/modules/emergencyService";

export default function Page() {
    const { petId } = useLocalSearchParams<{ petId: string }>();
    const { data, failed, retry } = useCareData();
    const [pet, setPet] = useState<MissingPet | null>(null);
    useEffect(() => { let active = true; emergencyService.getMissingPets().then(items => { if (active) setPet(items.find(item => item.id === petId) ?? null); }).catch(showCareError); return () => { active = false; }; }, [petId]);
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
            const report = await emergencyService.submitReport({ "petId": pet.id, "petName": pet.name, "time": time.trim(), "position": position.trim(), "content": content.trim(), "pictures": pictures });
            Alert.alert("제보 완료", "제보가 등록되었어요.", [{ "text": "확인", "onPress": () => router.replace({ "pathname": "/(tabs)/emergency/chat", "params": { "id": report.id } }) }]);
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
