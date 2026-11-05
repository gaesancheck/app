import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { CareScreen, CareText, CareButton, EmptyState, LoadingState, ErrorState } from "@/components/CareUI";
import { EmergencyNav, PetCard } from "@/components/EmergencyUI";
import Dialog from "@/components/Dialog";
import Warning from "@/assets/svg/account-emergency/warning.svg";
import useCareData from "@/modules/useCareData";
import Siren from "@/assets/svg/account-emergency/siren.svg";
import Bell from "@/assets/svg/account-emergency/bell.svg";
import Map from "@/assets/svg/account-emergency/map.svg";
import Shelter from "@/assets/svg/account-emergency/shelter.svg";
import Checklist from "@/assets/svg/account-emergency/checklist.svg";

export default function Page() {
    const { data, failed, retry } = useCareData();
    const [selected, setSelected] = useState(0);
    const [confirm, setConfirm] = useState(false);
    const pet = data?.pets[selected];
    return (
        <CareScreen title="긴급" back={false} headerGap={18}>
            <EmergencyNav active="start" enabled={Boolean(data?.emergency)} />
            {failed ? (
                <ErrorState onRetry={retry} />
            ) : !data ? (
                <LoadingState />
            ) : !pet ? (
                <>
                    <EmptyState>먼저 반려견 정보를 등록해주세요.</EmptyState>
                    <CareButton onPress={() => router.push("/(tabs)/mypage/pet")}>반려견 등록하기</CareButton>
                </>
            ) : (
                <>
                    <View style={{ "alignItems": "center", "gap": 22, "marginBottom": 31 }}>
                        <View
                            style={{
                                "width": 100,
                                "height": 100,
                                "borderRadius": 50,
                                "backgroundColor": "#FFF",
                                "alignItems": "center",
                                "justifyContent": "center",
                            }}
                        >
                            <Siren />
                        </View>
                        <CareText style={{ "fontSize": 25 }}>아이를 잃어버리셨나요?</CareText>
                    </View>
                    {data.pets.length > 1 && (
                        <View style={{ "flexDirection": "row", "flexWrap": "wrap", "gap": 10, "marginBottom": 12 }}>
                            {data.pets.map((item, index) => (
                                <Pressable key={item.id} onPress={() => setSelected(index)}>
                                    <CareText
                                        style={{ "color": selected === index ? "#688F6E" : "#9A9A9A", "fontSize": 18 }}
                                    >
                                        {item.name}
                                    </CareText>
                                </Pressable>
                            ))}
                        </View>
                    )}
                    <PetCard pet={pet} />
                    <View style={{ "gap": 20, "marginTop": 14, "marginBottom": 31 }}>
                        {[
                            [Bell, "커뮤니티에 자동으로 실종글이 올라가고 제보를 받아요"],
                            [Map, "최근 산책 경로를 바탕으로 예상 이동 경로를 보여줘요"],
                            [Shelter, "유기견 보호소에 있는 유기견들의 정보를 한 번에 체크해요"],
                            [Checklist, "실종되었을 때 해야할 일을 체크리스트로 나타내요"],
                        ].map(([Icon, label]) => {
                            const Asset = Icon as typeof Bell;
                            return (
                                <View
                                    key={String(label)}
                                    style={{ "flexDirection": "row", "alignItems": "center", "gap": 9 }}
                                >
                                    <Asset />
                                    <CareText style={{ "flex": 1, "fontSize": 16 }}>{String(label)}</CareText>
                                </View>
                            );
                        })}
                    </View>
                    <CareText style={{ "color": "#E36163", "fontSize": 12, "textAlign": "center", "marginBottom": 16 }}>
                        주의! 실종 모드는 긴급할 때만 사용하여 주세요.
                    </CareText>
                    <View style={{ "marginHorizontal": 12 }}>
                        <CareButton onPress={() => setConfirm(true)}>실종모드 켜기</CareButton>
                    </View>
                    <Dialog
                        visible={confirm}
                        onClose={() => setConfirm(false)}
                        buttons={[
                            {
                                "label": "모드 켜기",
                                "onPress": () => {
                                    setConfirm(false);
                                    router.push({
                                        "pathname": "/(tabs)/emergency/setup",
                                        "params": { "petId": pet.id },
                                    });
                                },
                            },
                            { "label": "그만두기", "variant": "outline", "onPress": () => setConfirm(false) },
                        ]}
                        containerStyle={{ "borderWidth": 0.7, "paddingHorizontal": 16, "paddingVertical": 18 }}
                    >
                        <View style={{ "alignItems": "center", "gap": 10 }}>
                            <Warning />
                            <CareText style={{ "fontSize": 15, "color": "#E36163" }}>경고!</CareText>
                            <CareText style={{ "fontSize": 15, "textAlign": "center" }}>
                                진짜로 실종모드를 켤까요? 실종모드는 긴급 상황 시 반려견의 빠른 수색을 위해 존재합니다.
                                신중히 사용하여주세요.
                            </CareText>
                        </View>
                    </Dialog>
                </>
            )}
        </CareScreen>
    );
}
