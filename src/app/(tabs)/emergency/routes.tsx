import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { CareScreen, CareText, CareButton, EmptyState, ui, showCareError } from "@/components/CareUI";
import { EmergencyNav, RouteMap } from "@/components/EmergencyUI";
import useCareData from "@/modules/useCareData";
import userData from "@/modules/userData";

export default function Page() {
    const { data } = useCareData();
    const [records, setRecords] = useState<WalkRecord[]>([]);
    const [mode, setMode] = useState("강아지 선호 경로");
    const [selected, setSelected] = useState(0);
    useFocusEffect(
        useCallback(() => {
            let active = true;
            userData
                .get()
                .then(value => {
                    if (active)
                        setRecords(
                            value.walkRecords
                                .filter(record => record.routes.length > 0)
                                .sort((a, b) => b.date.localeCompare(a.date))
                        );
                })
                .catch(showCareError);
            return () => {
                active = false;
            };
        }, [])
    );
    const destinations = records.reduce<Record<string, number>>(
        (counts, record) => ({ ...counts, [record.destination]: (counts[record.destination] ?? 0) + 1 }),
        {}
    );
    const ranked =
        mode === "자주 이동한 경로"
            ? [...records].sort((a, b) => destinations[b.destination] - destinations[a.destination])
            : mode === "강아지 선호 경로"
              ? [...records].sort((a, b) => b.rate - a.rate)
              : records;
    const route = ranked[selected] ?? ranked[0];
    return (
        <CareScreen title="예상 이동 경로" back={false} headerGap={18}>
            <EmergencyNav active="routes" enabled={Boolean(data?.emergency)} />
            <RouteMap points={route?.routes} height={280} />
            <View
                style={{
                    "flexDirection": "row",
                    "justifyContent": "space-between",
                    "alignItems": "center",
                    "marginBottom": 16,
                }}
            >
                <CareText style={{ "fontSize": 18 }}>유력 위치 순위</CareText>
                <CareButton
                    small
                    onPress={() => setSelected(value => (ranked.length ? (value + 1) % ranked.length : 0))}
                >
                    새 경로 추천
                </CareButton>
            </View>
            <View style={{ "flexDirection": "row", "flexWrap": "wrap", "gap": 8, "marginBottom": 15 }}>
                {["강아지 선호 경로", "최근 이동 경로", "자주 이동한 경로"].map(label => (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ "selected": mode === label }}
                        key={label}
                        onPress={() => {
                            setMode(label);
                            setSelected(0);
                        }}
                        style={{
                            "backgroundColor": mode === label ? "#474747" : "#E2E2E2",
                            "borderRadius": 20,
                            "paddingHorizontal": 10,
                            "paddingVertical": 4,
                        }}
                    >
                        <CareText style={{ "fontSize": 14, "color": mode === label ? "#FFF" : "#848484" }}>
                            {label}
                        </CareText>
                    </Pressable>
                ))}
            </View>
            {!ranked.length ? (
                <EmptyState>아직 저장된 산책 경로가 없어요.</EmptyState>
            ) : (
                ranked.slice(0, 10).map((record, index) => (
                    <Pressable
                        key={record.id}
                        accessibilityRole="button"
                        onPress={() => setSelected(index)}
                        style={[
                            ui.card,
                            {
                                "borderColor": route?.id === record.id ? "#688F6E" : "#9A9A9A",
                                "flexDirection": "row",
                                "gap": 14,
                            },
                        ]}
                    >
                        <CareText style={{ "fontSize": 25 }}>{index + 1}</CareText>
                        <View>
                            <CareText style={{ "fontSize": 20 }}>{record.destination || "산책 경로"}</CareText>
                            <CareText style={{ "fontSize": 14, "marginTop": 5 }}>
                                최근 {destinations[record.destination]}번 방문했어요.
                            </CareText>
                        </View>
                    </Pressable>
                ))
            )}
        </CareScreen>
    );
}
