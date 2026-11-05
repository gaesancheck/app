import { useState } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { CareButton, CareScreen, CareText, careColors } from "@/components/CareUI";
import { defaultFilters, walkFilters, type WalkFilters } from "@/modules/walkData";

export default function Page() {
    const [filters, setFilters] = useState<WalkFilters>(defaultFilters);
    return (
        <CareScreen
            title="산책 경로 탐색"
            footer={
                <CareButton onPress={() => router.push({ "pathname": "/(tabs)/walk/recommend", "params": filters })}>
                    경로 추천받기
                </CareButton>
            }
        >
            {walkFilters.map(group => (
                <View key={group.key} style={styles.group}>
                    <CareText style={styles.label}>{group.label}</CareText>
                    <View style={styles.options}>
                        {group.options.map(option => (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityState={{ "selected": filters[group.key] === option }}
                                key={option}
                                onPress={() => setFilters(previous => ({ ...previous, [group.key]: option }))}
                                style={[styles.option, filters[group.key] === option && styles.selected]}
                            >
                                <CareText
                                    style={[styles.optionText, filters[group.key] === option && { "color": "#FFF" }]}
                                >
                                    {option}
                                </CareText>
                            </Pressable>
                        ))}
                    </View>
                </View>
            ))}
        </CareScreen>
    );
}
const styles = StyleSheet.create({
    "group": {
        "borderWidth": 0.7,
        "borderColor": "#9A9A9A",
        "borderRadius": 5,
        "padding": 10,
        "marginBottom": 25,
        "backgroundColor": "#FAFBF7",
        "gap": 10,
    },
    "label": {
        "fontSize": 14,
        "color": "#000",
    },
    "options": {
        "flexDirection": "row",
        "flexWrap": "wrap",
        "gap": 10,
    },
    "option": {
        "borderWidth": 0.5,
        "borderColor": careColors.green,
        "borderRadius": 20,
        "paddingHorizontal": 10,
        "paddingVertical": 4,
        "minHeight": 27,
        "justifyContent": "center",
    },
    "selected": {
        "backgroundColor": careColors.green,
    },
    "optionText": {
        "fontSize": 15,
        "color": careColors.green,
    },
});
