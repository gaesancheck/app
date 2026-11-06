import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import dayjs from "dayjs";
import { CareScreen, CareText, CareRow, LoadingState, ErrorState, showCareError } from "@/components/CareUI";
import Dialog from "@/components/Dialog";
import Settings from "@/assets/svg/account-emergency/settings.svg";
import useCareData from "@/modules/useCareData";
import { careData } from "@/modules/careData";
import { APIMy } from "@/modules/rest/my";
import session from "@/modules/session";
import userData from "@/modules/userData";
import { isValidMonthDay } from "@/modules/petBirthday";
import { emergencyService } from "@/modules/emergencyService";
import { communityData } from "@/modules/communityData";
import { APIOnboarding } from "@/modules/rest/onboarding";
import { accountStorageKey } from "@/modules/accountStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Page() {
    const { data, failed, retry } = useCareData();
    const [confirm, setConfirm] = useState<"logout" | "delete" | null>(null);
    const [busy, setBusy] = useState(false);
    const leave = async () => {
        if (busy) return;
        setBusy(true);
        try {
            if (confirm === "delete") {
                const response = await APIMy.deleteMyAccount();
                if (!response.success) throw new Error(response.data.message);
                await careData.clearAll();
            } else {
                await userData.clear();
            }
            await session.clear();
            setConfirm(null);
            router.replace("/login");
        } catch (error) {
            showCareError(error);
        } finally {
            setBusy(false);
        }
    };
    return (
        <CareScreen
            title="내 정보"
            back={false}
            action={
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="계정 설정"
                    hitSlop={12}
                    onPress={() => router.push("/(tabs)/mypage/account")}
                >
                    <Settings />
                </Pressable>
            }
        >
            {failed ? (
                <ErrorState onRetry={retry} />
            ) : !data ? (
                <LoadingState />
            ) : (
                <View style={{ "marginHorizontal": 13, "gap": 22, "paddingTop": 5 }}>
                    <View>
                        <CareText style={{ "fontSize": 17, "color": "#000", "marginBottom": 12 }}>계정 정보</CareText>
                        <CareRow
                            title={data.account.name}
                            subtitle={dayjs(data.account.registeredAt).format("YYYY.MM.DD")}
                            picture={data.account.profile}
                            avatar
                            onPress={() => router.push("/(tabs)/mypage/account")}
                        />
                    </View>
                    <View>
                        <CareText style={{ "fontSize": 17, "color": "#000", "marginBottom": 12 }}>
                            반려동물 정보
                        </CareText>
                        <CareRow title="반려견 추가하기" onPress={() => router.push("/(tabs)/mypage/pet")} />
                        {data.pets.map(pet => (
                            <CareRow
                                key={pet.id}
                                title={pet.name}
                                subtitle={
                                    pet.birth
                                        ? isValidMonthDay(pet.birth)
                                            ? pet.birth
                                            : dayjs(pet.birth).format("YYYY.MM.DD")
                                        : "생일 미등록"
                                }
                                picture={pet.picture}
                                avatar
                                onPress={() =>
                                    router.push({ "pathname": "/(tabs)/mypage/pet", "params": { "id": pet.id } })
                                }
                            />
                        ))}
                    </View>
                    <View>
                        <CareText style={{ "fontSize": 17, "color": "#000", "marginBottom": 12 }}>
                            문의하러가기
                        </CareText>
                        <CareRow title="문의 페이지" onPress={() => router.push("/(tabs)/mypage/contact")} />
                        <CareRow title="내 문의" onPress={() => router.push("/(tabs)/mypage/inquiries")} />
                        <CareRow
                            title="답변된 문의"
                            onPress={() =>
                                router.push({ "pathname": "/(tabs)/mypage/inquiries", "params": { "answered": "1" } })
                            }
                        />
                        <CareRow title="FAQ" onPress={() => router.push("/(tabs)/mypage/faq")} />
                    </View>
                </View>
            )}
            <View style={{ "flex": 1, "minHeight": 30 }} />
            <View style={{ "flexDirection": "row", "justifyContent": "center", "gap": 5, "paddingTop": 28 }}>
                <Pressable onPress={() => setConfirm("logout")} accessibilityRole="button" hitSlop={8}>
                    <CareText style={{ "fontSize": 12, "color": "#9A9A9A" }}>로그아웃</CareText>
                </Pressable>
                <CareText style={{ "fontSize": 12, "color": "#9A9A9A" }}>·</CareText>
                <Pressable onPress={() => setConfirm("delete")} accessibilityRole="button" hitSlop={8}>
                    <CareText style={{ "fontSize": 12, "color": "#9A9A9A" }}>계정 탈퇴</CareText>
                </Pressable>
            </View>
            <Dialog
                visible={confirm !== null}
                onClose={() => !busy && setConfirm(null)}
                dismissOnBackdropPress={!busy}
                buttons={[
                    {
                        "label": confirm === "delete" ? "회원 탈퇴" : "로그아웃",
                        "disabled": busy,
                        "onPress": () => void leave(),
                    },
                    { "label": "그만두기", "variant": "outline", "disabled": busy, "onPress": () => setConfirm(null) },
                ]}
            >
                {confirm === "delete"
                    ? "계정을 탈퇴하시겠어요?\n탈퇴하면 회원님의 정보가 삭제됩니다."
                    : "계정을 로그아웃하시겠어요?"}
            </Dialog>
        </CareScreen>
    );
}
