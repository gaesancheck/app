import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { CareScreen, CareText, CareButton, LoadingState, ErrorState, showCareError } from "@/components/CareUI";
import { EmergencyNav, PetCard } from "@/components/EmergencyUI";
import Dialog from "@/components/Dialog";
import Warning from "@/assets/svg/account-emergency/warning.svg";
import useCareData from "@/modules/useCareData";
import { emergencyService } from "@/modules/emergencyService";
import Siren from "@/assets/svg/account-emergency/siren.svg";

export default function Page() {
    const { data, failed, retry } = useCareData();
    const [confirm, setConfirm] = useState(false);
    const [busy, setBusy] = useState(false);
    const stop = async () => {
        if (busy) return;
        setBusy(true);
        try {
            if (!data?.emergency) return;
            await emergencyService.resolveMissing(data.emergency.id);
            setConfirm(false);
            router.dismissTo("/(tabs)/emergency");
        } catch (error) {
            showCareError(error);
        } finally {
            setBusy(false);
        }
    };
    return (
        <CareScreen title="실종모드 종료" back={false} headerGap={18}>
            <EmergencyNav active="stop" enabled={Boolean(data?.emergency)} />
            {failed ? (
                <ErrorState onRetry={retry} />
            ) : !data ? (
                <LoadingState />
            ) : !data.emergency ? (
                <CareText>실종모드가 종료되었어요.</CareText>
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
                        <CareText style={{ "fontSize": 25 }}>실종모드를 종료할까요?</CareText>
                    </View>
                    <PetCard pet={data.emergency} />
                    <CareText style={{ "fontSize": 25, "textAlign": "center", "marginTop": 35, "marginBottom": 25 }}>
                        아이를 찾으셨나요? 축하드려요!
                    </CareText>
                    <CareText style={{ "textAlign": "center", "lineHeight": 23, "marginBottom": 35 }}>
                        실종모드 종료 이후에도 아직 가족을 잃은 아이들을 위해 제보에 힘써주세요!
                    </CareText>
                    <CareButton onPress={() => setConfirm(true)}>실종모드 종료하기</CareButton>
                    <Dialog
                        visible={confirm}
                        dismissOnBackdropPress={!busy}
                        onClose={() => !busy && setConfirm(false)}
                        buttons={[
                            { "label": "모드 끄기", "disabled": busy, "onPress": () => void stop() },
                            {
                                "label": "그만두기",
                                "disabled": busy,
                                "variant": "outline",
                                "onPress": () => setConfirm(false),
                            },
                        ]}
                        containerStyle={{ "borderWidth": 0.7, "paddingHorizontal": 16, "paddingVertical": 18 }}
                    >
                        <View style={{ "alignItems": "center", "gap": 10 }}>
                            <Warning />
                            <CareText style={{ "fontSize": 15, "color": "#E36163" }}>경고!</CareText>
                            <CareText style={{ "fontSize": 15 }}>진짜로 실종모드를 종료할까요?</CareText>
                        </View>
                    </Dialog>
                </>
            )}
        </CareScreen>
    );
}
