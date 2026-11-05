import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { CareScreen, CareText, EmptyState, LoadingState, ErrorState } from "@/components/CareUI";
import { EmergencyNav } from "@/components/EmergencyUI";
import useCareData from "@/modules/useCareData";
import { emergencyService } from "@/modules/emergencyService";
import type { Report } from "@/modules/careData";
import Avatar from "@/assets/svg/account-emergency/avatar.svg";

export default function Page() {
    const { received } = useLocalSearchParams<{ received?: string }>();
    const { data } = useCareData();
    const incoming = received === "1";
    const [reports, setReports] = useState<Report[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [revision, setRevision] = useState(0);
    useFocusEffect(useCallback(() => {
        let active = true;
        setReports(null);
        setFailed(false);
        const refresh = () => emergencyService.getReports(incoming).then(items => { if (active) setReports(items); }).catch(() => { if (active) setFailed(true); });
        void refresh();
        const timer = setInterval(() => void refresh(), 4000);
        return () => { active = false; clearInterval(timer); };
    }, [incoming, revision]));
    return <CareScreen title={incoming ? "들어온 제보" : "보낸 제보"} back={false} headerGap={18}>
        <EmergencyNav active={incoming ? "received" : "sent"} enabled={Boolean(data?.emergency)} />
        {failed ? <ErrorState onRetry={() => setRevision(value => value + 1)} /> : !reports ? <LoadingState /> : !reports.length ? <EmptyState>{incoming ? "아직 들어온 제보가 없어요." : "아직 보낸 제보가 없어요."}</EmptyState> : reports.map(report => <Pressable key={report.id} accessibilityRole="button" onPress={() => router.push({ "pathname": "/(tabs)/emergency/chat", "params": { "id": report.id } })} style={{ "flexDirection": "row", "gap": 12, "paddingVertical": 13, "paddingHorizontal": 10, "marginHorizontal": -19, "borderBottomWidth": 0.3, "borderColor": "#9A9A9A" }}>
            <Avatar /><View style={{ "gap": 7, "flex": 1 }}><CareText style={{ "fontSize": 15 }}>{incoming ? report.senderName || "제보자" : `${report.petName} 보호자`}</CareText><CareText style={{ "fontSize": 14 }}>{report.messages.at(-1)?.content || report.content || `${report.position}에서 목격했어요.`}</CareText></View>
        </Pressable>)}
    </CareScreen>;
}
