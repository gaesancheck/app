import { router } from "expo-router";
import { CareButton, CareScreen } from "@/components/CareUI";
import { RouteMap } from "@/components/EmergencyUI";
import { WalkMetrics } from "@/components/WalkUI";

export default function Page() {
    return <CareScreen title="자유 산책" footer={<CareButton onPress={() => router.push("/(tabs)/walk/record")}>산책 시작하기</CareButton>}>
        <RouteMap height={280} /><WalkMetrics />
    </CareScreen>;
}
