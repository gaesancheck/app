import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CareButton, CareScreen, CareText } from "@/components/CareUI";
import { RouteMap } from "@/components/EmergencyUI";
import { CourseStops, WalkMetrics } from "@/components/WalkUI";
import { courseFor, defaultFilters, walkFilters, type WalkFilters } from "@/modules/walkData";

export default function Page() {
    const params = useLocalSearchParams<Record<string, string>>();
    const filters = Object.fromEntries(
        walkFilters.map(group => [
            group.key,
            group.options.some(value => value === params[group.key]) ? params[group.key] : defaultFilters[group.key],
        ])
    ) as WalkFilters;
    const [alternative, setAlternative] = useState(0);
    const course = courseFor(filters, alternative);
    return (
        <CareScreen
            title="경로 추천 산책"
            footer={
                <CareButton
                    onPress={() =>
                        router.push({
                            "pathname": "/(tabs)/walk/record",
                            "params": { ...filters, "alternative": String(alternative), "recommended": "1" },
                        })
                    }
                >
                    산책 시작하기
                </CareButton>
            }
        >
            <RouteMap points={course.routes} height={280} />
            <WalkMetrics
                seconds={course.minutes * 60}
                distance={course.distance}
                destination={filters.course.replace(" 위주", "")}
            />
            <View style={{ "marginTop": 20, "gap": 12 }}>
                <CareText style={{ "fontSize": 15 }}>경로 추천 · {course.name}</CareText>
                <CourseStops stops={course.reversed ? [...course.stops].reverse() : course.stops} />
                <CareText style={{ "fontSize": 12, "color": "#6E6E6E", "marginBottom": 10 }}>
                    참고 코스예요. 현장의 보행로와 출입 가능 여부를 확인해주세요.
                </CareText>
                <CareButton small outline onPress={() => setAlternative(previous => previous + 1)}>
                    새 경로 추천
                </CareButton>
            </View>
        </CareScreen>
    );
}
