import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CareScreen, CareText, EmptyState, LoadingState, ErrorState } from "@/components/CareUI";
import { EmergencyNav } from "@/components/EmergencyUI";
import useCareData from "@/modules/useCareData";
import Avatar from "@/assets/svg/account-emergency/avatar.svg";

export default function Page() {
    const { received } = useLocalSearchParams<{ received?: string }>();
    const { data, failed, retry } = useCareData();
    const incoming = received === "1";
    return <CareScreen title={incoming ? "들어온 제보" : "보낸 제보"} back={false} headerGap={18}>
        <EmergencyNav active={incoming ? "received" : "sent"} enabled={Boolean(data?.emergency)} />
        {failed ? <ErrorState onRetry={retry} /> : !data ? <LoadingState /> : incoming || !data.reports.length ? <EmptyState>{incoming ? "아직 제보가 없어요." : "아직 보낸 제보가 없어요."}</EmptyState> : data.reports.map(report => <Pressable key={report.id} accessibilityRole="button" onPress={() => router.push({ "pathname": "/(tabs)/emergency/chat", "params": { "id": report.id } })} style={{ "flexDirection": "row", "gap": 12, "paddingVertical": 13, "paddingHorizontal": 10, "marginHorizontal": -19, "borderBottomWidth": 0.3, "borderColor": "#9A9A9A" }}>
            <Avatar /><View style={{ "gap": 7, "flex": 1 }}><CareText style={{ "fontSize": 15 }}>{report.petName} 보호자</CareText><CareText style={{ "fontSize": 14 }}>{report.content || `${report.position}에서 목격했어요.`}</CareText><CareText style={{ "fontSize": 12, "color": "#9A9A9A" }}>전송 대기 · 이 기기에 저장됨</CareText></View>
        </Pressable>)}
    </CareScreen>;
}
