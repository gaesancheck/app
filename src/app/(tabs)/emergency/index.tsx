import { router } from "expo-router";
import { CareScreen, CareText, EmptyState, LoadingState, ErrorState } from "@/components/CareUI";
import { EmergencyNav, PetCard } from "@/components/EmergencyUI";
import useCareData from "@/modules/useCareData";
import { missingPetExamples } from "@/modules/emergencyData";

export default function Page() {
    const { data, failed, retry } = useCareData();
    const pets = [...(data?.emergency ? [data.emergency] : []), ...missingPetExamples];
    return <CareScreen title="긴급" back={false} headerGap={18}>
        <EmergencyNav active="missing" enabled={Boolean(data?.emergency)} />
        {failed ? <ErrorState onRetry={retry} /> : !data ? <LoadingState /> : !pets.length ? <EmptyState>아직 등록된 실종동물이 없어요.</EmptyState> : <>
            {__DEV__ && <CareText style={{ "fontSize": 12, "color": "#9A9A9A", "marginBottom": 10 }}>개발용 예시 정보가 포함되어 있어요.</CareText>}
            {pets.map(pet => <PetCard key={pet.id} pet={pet} missing={pet} onReport={pet.id === data.emergency?.id ? undefined : () => router.push({ "pathname": "/(tabs)/emergency/report", "params": { "petId": pet.id } })} />)}
        </>}
    </CareScreen>;
}
