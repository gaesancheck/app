import { useCallback, useState } from "react";
import { Image, Pressable, TextInput, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import dayjs from "dayjs";
import { CareScreen, CareText, LoadingState, ErrorState, ui, showCareError } from "@/components/CareUI";
import { RouteMap } from "@/components/EmergencyUI";
import { emergencyService } from "@/modules/emergencyService";
import type { Report } from "@/modules/careData";

export default function Page() {
    const { id } = useLocalSearchParams<{ "id": string }>();
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [report, setReport] = useState<Report | null>(null);
    const [accountId, setAccountId] = useState("");
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [revision, setRevision] = useState(0);
    useFocusEffect(
        useCallback(() => {
            let active = true;
            setLoading(true);
            setFailed(false);
            const refresh = () =>
                Promise.all([emergencyService.getReport(id), emergencyService.currentIdentity()])
                    .then(([value, identity]) => {
                        if (active) {
                            setReport(value);
                            setAccountId(identity);
                        }
                    })
                    .catch(() => {
                        if (active) setFailed(true);
                    })
                    .finally(() => {
                        if (active) setLoading(false);
                    });
            void refresh();
            const timer = setInterval(() => void refresh(), 3000);
            return () => {
                active = false;
                clearInterval(timer);
            };
        }, [id, revision])
    );
    const send = async () => {
        const content = message.trim();
        if (!content || busy || !report) return;
        setBusy(true);
        try {
            setReport(await emergencyService.sendMessage(id, content));
            setMessage("");
        } catch (error) {
            showCareError(error);
        } finally {
            setBusy(false);
        }
    };
    return (
        <CareScreen
            title="채팅방"
            footer={
                report ? (
                    <View style={{ "flexDirection": "row", "alignItems": "center", "gap": 12 }}>
                        <TextInput
                            accessibilityLabel="메시지"
                            placeholder="내용을 입력해주세요."
                            value={message}
                            onChangeText={setMessage}
                            onSubmitEditing={() => void send()}
                            maxLength={3000}
                            style={[ui.input, { "flex": 1, "minHeight": 36, "borderRadius": 20, "fontSize": 15 }]}
                        />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="메시지 보내기"
                            disabled={busy || !message.trim()}
                            onPress={() => void send()}
                        >
                            <CareText
                                style={{
                                    "fontSize": 24,
                                    "color": "#688F6E",
                                    "opacity": busy || !message.trim() ? 0.4 : 1,
                                }}
                            >
                                ↑
                            </CareText>
                        </Pressable>
                    </View>
                ) : undefined
            }
        >
            {failed ? (
                <ErrorState onRetry={() => setRevision(value => value + 1)} />
            ) : loading ? (
                <LoadingState />
            ) : !report ? (
                <CareText>제보를 찾을 수 없어요.</CareText>
            ) : (
                <>
                    <View style={[ui.card, { "marginLeft": 40 }]}>
                        <RouteMap height={183} />
                        <View style={{ "flexDirection": "row", "gap": 9, "flexWrap": "wrap", "marginBottom": 10 }}>
                            {report.pictures.map(uri => (
                                <Image key={uri} source={{ "uri": uri }} style={ui.photo} />
                            ))}
                        </View>
                        <CareText style={{ "lineHeight": 26 }}>
                            목격시각: {report.time}
                            {"\n"}목격위치: {report.position}
                            {"\n"}내용: {report.content}
                        </CareText>
                    </View>
                    {report.messages.map(item => (
                        <View
                            key={item.id}
                            style={{
                                "alignSelf": item.senderId === accountId ? "flex-end" : "flex-start",
                                "maxWidth": "85%",
                                "backgroundColor": item.senderId === accountId ? "#EDF2E9" : "#FFFFFF",
                                "borderRadius": 10,
                                "padding": 10,
                                "marginBottom": 14,
                            }}
                        >
                            {item.senderId !== accountId && (
                                <CareText style={{ "fontSize": 13, "marginBottom": 5 }}>
                                    {item.senderName || "보호자"}
                                </CareText>
                            )}
                            <CareText>{item.content}</CareText>
                            <CareText
                                style={{ "fontSize": 11, "color": "#9A9A9A", "textAlign": "right", "marginTop": 5 }}
                            >
                                {dayjs(item.createdAt).format("HH:mm")}
                            </CareText>
                        </View>
                    ))}
                </>
            )}
        </CareScreen>
    );
}
