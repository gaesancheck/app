import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import dayjs from "dayjs";
import { CareScreen, CareText, CareButton, Field, LoadingState, ErrorState, showCareError } from "@/components/CareUI";
import { PetCard, RouteMap } from "@/components/EmergencyUI";
import useCareData from "@/modules/useCareData";
import { careData, type MissingPet } from "@/modules/careData";

export default function Page() {
    const { petId } = useLocalSearchParams<{ petId: string }>();
    const { data, failed, retry } = useCareData();
    const pet = data?.pets.find(item => item.id === petId);
    const [date, setDate] = useState(dayjs().format("YYYY.MM.DD"));
    const [time, setTime] = useState("");
    const [position, setPosition] = useState("");
    const [preview, setPreview] = useState<MissingPet | null>(null);
    const [busy, setBusy] = useState(false);
    const prepare = () => {
        const compactDate = date.replace(/[.\-/]/g, "");
        if (!/^\d{8}$/.test(compactDate) || dayjs(compactDate).format("YYYYMMDD") !== compactDate || dayjs(compactDate).isAfter(dayjs(), "day")) { showCareError(new Error("실종 날짜를 확인해주세요. YYYY.MM.DD 형식으로 입력할 수 있어요.")); return; }
        if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(time.trim()) || !position.trim()) { showCareError(new Error("실종 시각은 HH:mm 형식으로, 위치는 자세히 입력해주세요.")); return; }
        const timestamp = dayjs(`${dayjs(compactDate).format("YYYY-MM-DD")}T${time.trim().padStart(5, "0")}:00`).valueOf();
        if (timestamp > Date.now()) { showCareError(new Error("실종 시각은 현재보다 이전이어야 해요.")); return; }
        if (pet && data) setPreview({ ...pet, "missingSince": timestamp, "lastPosition": position.trim(), "lastTime": time.trim(), "ownerName": data.account.name });
    };
    const start = async () => {
        if (!preview || busy) return;
        setBusy(true);
        try {
            await careData.update(current => ({ ...current, "emergency": preview, "checks": [] }));
            router.dismissTo("/(tabs)/emergency/checklist");
        } catch (error) { showCareError(error); } finally { setBusy(false); }
    };
    return <CareScreen title="반려견 정보 설정" footer={pet && !preview ? <CareButton onPress={prepare}>입력 완료</CareButton> : undefined}>
        {failed ? <ErrorState onRetry={retry} /> : !data ? <LoadingState /> : !pet ? <CareText>반려견 정보를 찾을 수 없어요.</CareText> : preview ? <>
            <CareText style={{ "fontSize": 24, "textAlign": "center", "marginVertical": 26 }}>정보 설정이 완료되었어요!</CareText>
            <PetCard pet={preview} missing={preview} />
            <View style={{ "marginTop": 70, "gap": 20 }}><CareText style={{ "fontSize": 24, "textAlign": "center" }}>입력된 정보가 맞나요?</CareText>
                <View style={{ "flexDirection": "row", "justifyContent": "center", "gap": 12 }}><CareButton small outline disabled={busy} onPress={() => setPreview(null)}>재입력하기</CareButton><CareButton small disabled={busy} onPress={() => void start()}>{busy ? "저장 중" : "입력 끝내기"}</CareButton></View>
            </View>
        </> : <>
            <CareText style={{ "fontSize": 24, "textAlign": "center", "marginVertical": 22 }}>실종모드 사용 전, 반려견의 정보를{"\n"}입력할게요!</CareText>
            <Field label="반려견 실종 날짜" value={date} onChangeText={setDate} placeholder="날짜를 입력해주세요" keyboardType="numbers-and-punctuation" />
            <Field label="반려견 실종 시각" value={time} onChangeText={setTime} placeholder="실종 시각을 입력해주세요 (HH:mm)" keyboardType="numbers-and-punctuation" />
            <CareText style={{ "fontSize": 18, "color": "#6E6E6E", "marginBottom": 11 }}>반려견 실종 위치</CareText>
            <RouteMap />
            <Field label="상세 위치" value={position} onChangeText={setPosition} placeholder="자세한 위치를 입력해주세요" />
        </>}
    </CareScreen>;
}
