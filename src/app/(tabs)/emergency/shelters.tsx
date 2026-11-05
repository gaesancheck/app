import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { CareScreen, CareText, EmptyState, ui, careColors } from "@/components/CareUI";
import { EmergencyNav } from "@/components/EmergencyUI";
import SelectionDropdown from "@/components/SelectionDropdown";
import useCareData from "@/modules/useCareData";
import type { ShelterPet } from "@/modules/emergencyData";
import { emergencyService } from "@/modules/emergencyService";

const choices = {
    "region": ["지역", "서울", "경기", "인천"],
    "district": ["구", "강서구", "양천구", "마포구"],
    "town": ["동", "방화동", "마곡동", "화곡동"],
    "age": ["나이", "5살 추정", "1살 추정"],
    "gender": ["성별", "여자", "남자"],
    "type": ["견종", "비숑", "포메라니안", "믹스"],
    "size": ["크기", "소형견", "중형견", "대형견"],
};
type Filter = keyof typeof choices;
export default function Page() {
    const { data } = useCareData();
    const [filters, setFilters] = useState<Partial<Record<Filter, string>>>({});
    const [query, setQuery] = useState("");
    const [pets, setPets] = useState<ShelterPet[]>([]);
    useEffect(() => { let active = true; emergencyService.getShelterPets().then(value => { if (active) setPets(value); }); return () => { active = false; }; }, []);
    const items = pets.filter(item => Object.entries(filters).every(([key, value]) => !value || item[key as Filter] === value) && `${item.shelter} ${item.found} ${item.specials}`.includes(query.trim()));
    const filter = (key: Filter) => <SelectionDropdown key={key} value={filters[key] ?? ""} options={choices[key].map((label, index) => ({ "label": label, "value": index ? label : "" }))} onChange={value => setFilters(current => ({ ...current, [key]: String(value) }))} containerStyle={{ "borderWidth": 0.5, "borderColor": "#9A9A9A", "borderRadius": 5, "paddingHorizontal": 8, "paddingVertical": 4 }}><CareText style={{ "fontSize": 15 }}>{filters[key] || choices[key][0]}  ⌄</CareText></SelectionDropdown>;
    return <CareScreen title="유기견 보호소에서 찾기" back={false} headerGap={18}>
        <EmergencyNav active="shelters" enabled={Boolean(data?.emergency)} />
        <Pressable accessibilityRole="button" onPress={() => { setFilters({}); setQuery(""); }} style={{ "alignSelf": "flex-end", "marginBottom": 10 }}><CareText style={{ "color": "#E36163" }}>초기화</CareText></Pressable>
        <View style={[ui.card, { "gap": 14 }]}><CareText style={{ "fontSize": 18 }}>지역</CareText><View style={{ "flexDirection": "row", "flexWrap": "wrap", "gap": 8 }}>{(["region", "district", "town"] as Filter[]).map(filter)}</View>
            <CareText style={{ "fontSize": 18 }}>정보</CareText><View style={{ "flexDirection": "row", "flexWrap": "wrap", "gap": 8 }}>{(["age", "gender", "type", "size"] as Filter[]).map(filter)}</View>
            <TextInput accessibilityLabel="보호 동물 검색" placeholder="그 외 추가할 내용을 입력하세요" value={query} onChangeText={setQuery} style={[ui.compactInput, ui.text, { "backgroundColor": "#FFF", "borderWidth": 0.5, "fontSize": 15 }]} />
        </View>
        {!items.length ? <EmptyState>조건에 맞는 보호 동물이 없어요.</EmptyState> : items.map(item => <View key={item.id} style={ui.card}>
            <View style={ui.pill}><CareText style={{ "fontSize": 15, "color": careColors.green }}>보호 3일째</CareText></View>
            <CareText style={{ "fontSize": 19, "marginVertical": 15 }}>{item.shelter} - {item.district} {item.town}</CareText>
            <View style={{ "flexDirection": "row", "gap": 12, "marginBottom": 15 }}><View style={{ "width": 85, "height": 85, "backgroundColor": "#ECEEE6", "borderWidth": 0.7, "borderColor": "#9A9A9A", "borderRadius": 12 }} /><CareText style={{ "fontSize": 15, "lineHeight": 22 }}>견종: {item.type}{"\n"}성별: {item.gender}{"\n"}나이: {item.age}{"\n"}크기: {item.size}</CareText></View>
            <CareText style={{ "lineHeight": 25, "textDecorationLine": "underline", "textDecorationStyle": "dotted" }}>발견 위치: {item.found}{"\n"}특징: {item.specials}</CareText>
        </View>)}
    </CareScreen>;
}
