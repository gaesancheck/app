import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { CareScreen, CareText, LoadingState, ErrorState, careColors } from "@/components/CareUI";
import { APIMy, type APIFaQ } from "@/modules/rest/my";
import Chevron from "@/assets/svg/account-emergency/faq-chevron.svg";

export default function Page() {
    const [items, setItems] = useState<APIFaQ[] | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        let active = true;
        setFailed(false);
        APIMy.getFaQs()
            .then(response => {
                if (!response.success) throw new Error(response.data.message);
                if (active) setItems(response.data);
            })
            .catch(() => {
                if (active) setFailed(true);
            });
        return () => {
            active = false;
        };
    }, [revision]);
    return (
        <CareScreen title="FAQ">
            <CareText style={{ "fontSize": 27, "marginTop": 37, "marginBottom": 24 }}>무엇을 도와드릴까요?</CareText>
            <CareText style={{ "fontSize": 20, "marginBottom": 16 }}>자주 묻는 질문</CareText>
            {failed ? (
                <ErrorState onRetry={() => setRevision(value => value + 1)} />
            ) : !items ? (
                <LoadingState />
            ) : (
                items.map(item => (
                    <View
                        key={item.id}
                        style={{
                            "borderTopWidth": 0.3,
                            "borderBottomWidth": 0.3,
                            "borderColor": "#9A9A9A",
                            "marginHorizontal": -19,
                        }}
                    >
                        <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ "expanded": expanded === item.id }}
                            onPress={() => setExpanded(expanded === item.id ? null : item.id)}
                            style={{
                                "minHeight": 58,
                                "flexDirection": "row",
                                "alignItems": "center",
                                "paddingHorizontal": 17,
                                "gap": 15,
                            }}
                        >
                            <CareText style={{ "fontSize": 26, "color": careColors.green }}>Q</CareText>
                            <CareText style={{ "fontSize": 18, "flex": 1 }}>{item.name}</CareText>
                            <Chevron
                                style={{ "transform": [{ "rotate": expanded === item.id ? "180deg" : "0deg" }] }}
                            />
                        </Pressable>
                        {expanded === item.id && (
                            <CareText
                                style={{
                                    "fontSize": 16,
                                    "lineHeight": 23,
                                    "paddingLeft": 50,
                                    "paddingRight": 18,
                                    "paddingBottom": 20,
                                }}
                            >
                                {item.answer}
                            </CareText>
                        )}
                    </View>
                ))
            )}
        </CareScreen>
    );
}
