import { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import dayjs from "dayjs";
import { CareScreen, CareText, Field, CareButton, LoadingState, ErrorState, selectCarePhotos, showCareError, careColors } from "@/components/CareUI";
import SelectionDropdown from "@/components/SelectionDropdown";
import useCareData from "@/modules/useCareData";
import { careData, newPet, type Pet } from "@/modules/careData";
import { APIMy } from "@/modules/rest/my";
import { isValidMonthDay } from "@/modules/petBirthday";
import Avatar from "@/assets/svg/account-emergency/avatar.svg";
import EditPhoto from "@/assets/svg/account-emergency/edit-photo.svg";

export default function Page() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { data, failed, retry } = useCareData();
    const [pet, setPet] = useState<Pet>(newPet);
    const [age, setAge] = useState("");
    const [busy, setBusy] = useState(false);
    useEffect(() => { const existing = data?.pets.find(item => item.id === id); if (existing) { setPet(existing); setAge(String(existing.age)); } }, [data, id]);
    const update = <K extends keyof Pet>(key: K, value: Pet[K]) => setPet(current => ({ ...current, [key]: value }));
    const save = async () => {
        if (!pet.name.trim() || !pet.type.trim() || !/^\d{1,2}$/.test(age)) { showCareError(new Error("이름, 견종, 나이를 확인해주세요.")); return; }
        const birth = isValidMonthDay(pet.birth) ? pet.birth : pet.birth.replace(/[.\-/]/g, "");
        if (birth && !isValidMonthDay(birth) && (!/^\d{8}$/.test(birth) || dayjs(birth).format("YYYYMMDD") !== birth || dayjs(birth).isAfter(dayjs(), "day"))) { showCareError(new Error("생일을 MM.DD 형식으로 입력해주세요.")); return; }
        if (busy) return;
        setBusy(true);
        try {
            const next = { ...pet, "name": pet.name.trim(), "age": Number(age), "birth": birth };
            const response = await APIMy.changePetInfo(next);
            if (!response.success) throw new Error(response.data.message);
            await careData.update(current => ({ ...current, "pets": id ? current.pets.map(item => item.id === id ? next : item) : [...current.pets, next] }));
            router.back();
        } catch (error) { showCareError(error); } finally { setBusy(false); }
    };
    return <CareScreen title="반려동물 정보" action={<Pressable disabled={busy} onPress={() => void save()}><CareText style={{ "fontSize": 20, "color": careColors.green }}>{busy ? "저장 중" : "완료"}</CareText></Pressable>}>
        {failed ? <ErrorState onRetry={retry} /> : !data ? <LoadingState /> : <>
            <Pressable accessibilityRole="button" accessibilityLabel="반려견 사진 변경" style={{ "alignSelf": "center", "width": 104, "height": 105, "marginTop": 8, "marginBottom": 27 }} onPress={async () => {
                try { const photos = await selectCarePhotos(); if (photos[0]) update("picture", photos[0]); } catch (error) { showCareError(error); }
            }}>{pet.picture ? <Image source={{ "uri": pet.picture }} style={{ "width": 100, "height": 100, "borderRadius": 50, "borderWidth": 1, "borderColor": careColors.green }} /> : <View style={{ "width": 100, "height": 100, "alignItems": "center", "justifyContent": "center", "borderRadius": 50, "backgroundColor": "#ECEEE6" }}><Avatar /></View>}
                <EditPhoto style={{ "position": "absolute", "right": 0, "bottom": 0 }} />
            </Pressable>
            <Field compact label="강아지 이름" value={pet.name} onChangeText={value => update("name", value)} />
            <Field compact label="견종" value={pet.type} onChangeText={value => update("type", value)} />
            <View style={{ "gap": 8, "marginBottom": 18 }}><CareText style={{ "fontSize": 20, "color": "#000" }}>성별</CareText>
                <SelectionDropdown containerStyle={{ "backgroundColor": "#FFF", "borderWidth": 0.5, "borderColor": "#688F6E", "borderRadius": 5, "paddingHorizontal": 12, "paddingVertical": 7 }} value={pet.gender} options={[{ "label": "여자", "value": "female" }, { "label": "남자", "value": "male" }]} onChange={value => update("gender", value as Pet["gender"])}><CareText>{pet.gender === "female" ? "여자" : "남자"}⌄</CareText></SelectionDropdown>
            </View>
            <Field compact label="나이" value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="나이를 입력해주세요" />
            <View style={{ "gap": 8, "marginBottom": 18 }}><CareText style={{ "fontSize": 20, "color": "#000" }}>크기</CareText>
                <SelectionDropdown containerStyle={{ "backgroundColor": "#FFF", "borderWidth": 0.5, "borderColor": "#688F6E", "borderRadius": 5, "paddingHorizontal": 12, "paddingVertical": 7 }} value={pet.size} options={["소형견", "중형견", "대형견"].map(value => ({ "label": value, "value": value }))} onChange={value => update("size", String(value))}><CareText>{pet.size || "눌러서 선택"}⌄</CareText></SelectionDropdown>
            </View>
            <Field compact label="생일" value={pet.birth} onChangeText={value => update("birth", value)} placeholder="MM.DD" keyboardType="numbers-and-punctuation" />
            <View style={{ "gap": 8, "marginBottom": 18 }}><CareText style={{ "fontSize": 20, "color": "#000" }}>중성화 여부</CareText>
                <View style={{ "flexDirection": "row", "gap": 12 }}><CareButton small outline={!pet.neutering} onPress={() => update("neutering", true)}>O</CareButton><CareButton small outline={pet.neutering} onPress={() => update("neutering", false)}>X</CareButton></View>
            </View>
            <View style={{ "gap": 8, "marginBottom": 18 }}><CareText style={{ "fontSize": 20, "color": "#000" }}>평소 산책량</CareText>
                <SelectionDropdown containerStyle={{ "backgroundColor": "#FFF", "borderWidth": 0.5, "borderColor": "#688F6E", "borderRadius": 5, "paddingHorizontal": 12, "paddingVertical": 7 }} value={pet.walkDuration} options={["30분 미만", "30분-1시간", "1시간-1시간 30분", "1시간 30분-2시간", "2시간 이상"].map(value => ({ "label": value, "value": value }))} onChange={value => update("walkDuration", String(value))}><CareText>{pet.walkDuration || "눌러서 선택"}⌄</CareText></SelectionDropdown>
            </View>
            <View style={{ "gap": 8, "marginBottom": 18 }}><CareText style={{ "fontSize": 20, "color": "#000" }}>평소 산책 컨디션</CareText>
                <SelectionDropdown containerStyle={{ "backgroundColor": "#FFF", "borderWidth": 0.5, "borderColor": "#688F6E", "borderRadius": 5, "paddingHorizontal": 12, "paddingVertical": 7 }} value={pet.walkCondition} options={["최고예요!", "좋아요", "평범한 것 같아요", "조금 힘들어해요", "많이 힘들어해요"].map(value => ({ "label": value, "value": value }))} onChange={value => update("walkCondition", String(value))}><CareText>{pet.walkCondition || "눌러서 선택"}⌄</CareText></SelectionDropdown>
            </View>
            <Field compact label="질병 여부" value={pet.diseases} onChangeText={value => update("diseases", value)} placeholder="없다면 없음으로 입력해주세요" />
            <Field compact label="특징" value={pet.specials} onChangeText={value => update("specials", value)} placeholder="반려견을 알아볼 수 있는 특징" />
        </>}
    </CareScreen>;
}
