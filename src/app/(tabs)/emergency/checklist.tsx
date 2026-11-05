import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { router } from "expo-router";
import { CareScreen, CareText, CareButton, LoadingState, ErrorState, ui, showCareError } from "@/components/CareUI";
import { EmergencyNav } from "@/components/EmergencyUI";
import CheckBox from "@/components/CheckBox";
import useCareData from "@/modules/useCareData";
import { careData } from "@/modules/careData";
import { checklistGroups } from "@/modules/emergencyData";
import SvgProgressTrack from "@/assets/svg/onboarding/progress-track.svg";
import SvgProgressFill from "@/assets/svg/onboarding/progress-5.svg";

export default function Page() {
    const { data, setData, failed, retry } = useCareData();
    const [busy, setBusy] = useState(false);
    const count = checklistGroups.flatMap(group => group.items.map((_, index) => `${group.title}-${index}`)).filter(id => data?.checks.includes(id)).length;
    const progress = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const animation = Animated.timing(progress, { "toValue": count / 16 * 290, "duration": 300, "easing": Easing.out(Easing.cubic), "useNativeDriver": false });
        animation.start();
        return () => animation.stop();
    }, [count, progress]);
    const toggle = async (id: string, checked: boolean) => {
        if (busy) return;
        setBusy(true);
        try { setData(await careData.update(current => ({ ...current, "checks": checked ? [...new Set([...current.checks, id])] : current.checks.filter(item => item !== id) }))); }
        catch (error) { showCareError(error); } finally { setBusy(false); }
    };
    return <CareScreen title="체크리스트" back={false} headerGap={18}>
        <EmergencyNav active="checklist" enabled={Boolean(data?.emergency)} />
        {data?.emergency && <View accessibilityRole="progressbar" accessibilityValue={{ "min": 0, "max": 16, "now": count }} style={{ "height": 53.4, "backgroundColor": "#FAFBF7", "borderWidth": 0.7, "borderColor": "#9A9A9A", "borderRadius": 7, "paddingHorizontal": 15, "paddingTop": 10, "marginBottom": 25 }}>
            <CareText style={{ "fontSize": 17, "lineHeight": 20.4, "color": "#000" }}>{count}/16 완료</CareText>
            <View style={{ "position": "absolute", "left": 15, "top": 38, "height": 4 }}><SvgProgressTrack /></View>
            <Animated.View style={{ "position": "absolute", "left": 15, "top": 38, "height": 4, "width": progress, "borderRadius": 2, "overflow": "hidden" }}><SvgProgressFill /></Animated.View>
        </View>}
        {failed ? <ErrorState onRetry={retry} /> : !data ? <LoadingState /> : !data.emergency ? <CareButton onPress={() => router.replace("/(tabs)/emergency/start")}>실종모드 설정하기</CareButton> : checklistGroups.map(group => <View key={group.title}>
            <CareText style={{ "fontSize": 15, "marginLeft": 10, "marginBottom": 8 }}>{group.title}</CareText>
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
