import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { CareScreen, CareText, CareButton, LoadingState, ErrorState, ui, showCareError } from "@/components/CareUI";
import { EmergencyNav } from "@/components/EmergencyUI";
import CheckBox from "@/components/CheckBox";
import useCareData from "@/modules/useCareData";
import { careData } from "@/modules/careData";
import { checklistGroups } from "@/modules/emergencyData";

export default function Page() {
    const { data, setData, failed, retry } = useCareData();
    const [busy, setBusy] = useState(false);
    const toggle = async (id: string, checked: boolean) => {
        if (busy) return;
        setBusy(true);
        try { setData(await careData.update(current => ({ ...current, "checks": checked ? [...new Set([...current.checks, id])] : current.checks.filter(item => item !== id) }))); }
        catch (error) { showCareError(error); } finally { setBusy(false); }
    };
    return <CareScreen title="체크리스트" back={false} headerGap={18}>
        <EmergencyNav active="checklist" enabled={Boolean(data?.emergency)} />
        {failed ? <ErrorState onRetry={retry} /> : !data ? <LoadingState /> : !data.emergency ? <CareButton onPress={() => router.replace("/(tabs)/emergency/start")}>실종모드 설정하기</CareButton> : checklistGroups.map(group => <View key={group.title}>
            <View style={[ui.card, { "paddingVertical": 12 }]}><CareText style={{ "fontSize": 20, "borderBottomWidth": 0.7, "borderColor": "#9A9A9A", "paddingBottom": 7 }}>{group.title}</CareText></View>
            <View style={[ui.card, { "gap": 12 }]}>{group.items.map((item, index) => {
                const id = `${group.title}-${index}`;
                const checked = data.checks.includes(id);
                return <View key={id} style={{ "flexDirection": "row", "alignItems": "center", "gap": 9 }}>
                    <CheckBox value={checked} onValueChange={value => void toggle(id, value)} checkedBackgroundColor="#688F6E" checkIconColor="#FFF" style={{ "width": 22, "height": 22, "borderRadius": 0, "borderWidth": 0.7, "borderColor": "#9CA3AF" }} />
                    <CareText style={{ "flex": 1, "fontSize": 16 }}>{item}</CareText>
                </View>;
            })}</View>
        </View>)}
    </CareScreen>;
}
