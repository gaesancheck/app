import { useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
    CareScreen,
    CareText,
    previewCareAttachment,
    EmptyState,
    LoadingState,
    ErrorState,
    ui,
    careColors,
    showCareError,
} from "@/components/CareUI";
import useCareData from "@/modules/useCareData";
import Chevron from "@/assets/svg/account-emergency/faq-chevron.svg";

export default function Page() {
    const { answered } = useLocalSearchParams<{ "answered"?: string }>();
    const { data, failed, retry } = useCareData();
    const [expanded, setExpanded] = useState<string | null>(null);
    const inquiries = data?.inquiries.filter(item => answered !== "1" || Boolean(item.answer)) ?? [];
    return (
        <CareScreen title={answered === "1" ? "답변된 문의" : "내 문의"}>
            {failed ? (
                <ErrorState onRetry={retry} />
            ) : !data ? (
                <LoadingState />
            ) : !inquiries.length ? (
                <EmptyState>
                    {answered === "1" ? "아직 답변된 문의가 없어요!" : "아직 작성된 문의가 없어요!"}
                </EmptyState>
            ) : (
                inquiries.map(inquiry => (
                    <View key={inquiry.id} style={ui.card}>
                        <View style={ui.pill}>
                            <CareText style={{ "color": careColors.green, "fontSize": 13 }}>
                                {inquiry.contactType}
                            </CareText>
                        </View>
                        <CareText style={{ "fontSize": 22, "marginTop": 20, "marginBottom": 14 }}>
                            {inquiry.title}
                        </CareText>
                        <CareText style={{ "lineHeight": 23, "marginBottom": 24 }}>{inquiry.content}</CareText>
                        {inquiry.attachments.map(file => (
                            <Pressable
                                key={file.url}
                                style={{
                                    "backgroundColor": "#EDF2E9",
                                    "padding": 10,
                                    "borderRadius": 6,
                                    "marginTop": 5,
                                }}
                                onPress={() => {
                                    void previewCareAttachment(file.url, file.name).catch(showCareError);
                                }}
                            >
                                <CareText style={{ "fontSize": 14, "textDecorationLine": "underline" }}>
                                    {file.name}
                                </CareText>
                            </Pressable>
                        ))}
                        {inquiry.answer && (
                            <View style={{ "marginTop": 12, "borderTopWidth": 0.5, "borderColor": "#9A9A9A" }}>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="답변 보기"
                                    accessibilityState={{ "expanded": expanded === inquiry.id }}
                                    onPress={() => setExpanded(expanded === inquiry.id ? null : inquiry.id)}
                                    style={{ "alignItems": "center", "padding": 12 }}
                                >
                                    <Chevron
                                        style={{
                                            "transform": [{ "rotate": expanded === inquiry.id ? "180deg" : "0deg" }],
                                        }}
                                    />
                                </Pressable>
                                {expanded === inquiry.id && (
                                    <CareText style={{ "lineHeight": 23 }}>{inquiry.answer}</CareText>
                                )}
                            </View>
                        )}
                    </View>
                ))
            )}
        </CareScreen>
    );
}
