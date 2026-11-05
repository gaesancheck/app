import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import type { MissingPet } from "@/modules/careData";
import { emergencyService } from "@/modules/emergencyService";
import { CareScreen, CareText, EmptyState, LoadingState, ErrorState } from "@/components/CareUI";
import { EmergencyNav, PetCard } from "@/components/EmergencyUI";
import useCareData from "@/modules/useCareData";

export default function Page() {
    const { data, failed, retry } = useCareData();
    const [pets, setPets] = useState<MissingPet[]>([]);
    useFocusEffect(
        useCallback(() => {
            let active = true;
            emergencyService
                .getMissingPets()
                .then(value => {
                    if (active) setPets(value);
                })
                .catch(() => undefined);
            return () => {
                active = false;
            };
        }, [])
    );
    return (
        <CareScreen title="긴급" back={false} headerGap={18}>
            <EmergencyNav active="missing" enabled={Boolean(data?.emergency)} />
            {failed ? (
                <ErrorState onRetry={retry} />
            ) : !data ? (
                <LoadingState />
            ) : !pets.length ? (
                <EmptyState>아직 등록된 실종동물이 없어요.</EmptyState>
            ) : (
                <>
                    {pets.map(pet => (
                        <PetCard
                            key={pet.id}
                            pet={pet}
                            missing={pet}
                            onReport={
                                pet.id === data.emergency?.id
                                    ? undefined
                                    : () =>
                                          router.push({
                                              "pathname": "/(tabs)/emergency/report",
                                              "params": { "petId": pet.id },
                                          })
                            }
                        />
                    ))}
                </>
            )}
        </CareScreen>
    );
}
