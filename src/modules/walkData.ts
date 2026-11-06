import { api, USE_MOCK } from "./rest";
import * as Location from "expo-location";
import type { MapCoordinate } from "../../modules/kakao-map";

export const walkFilters = [
    { "key": "duration", "label": "산책 시간", "options": ["30분 미만", "30분-1시간", "1시간-2시간", "2시간 이상"] },
    { "key": "course", "label": "선호하는 코스", "options": ["공원 위주", "도심 위주", "하천 위주", "숲길 위주"] },
    { "key": "social", "label": "강아지 성향", "options": ["강아지가 많은 곳", "적은 곳", "상관 없어요"] },
    { "key": "intensity", "label": "걷기 강도", "options": ["가볍게", "보통", "활동적이게"] },
    { "key": "time", "label": "산책 시간대", "options": ["오전", "오후", "밤", "새벽"] },
] as const;
export type WalkFilters = {
    "duration": string;
    "course": string;
    "social": string;
    "intensity": string;
    "time": string;
};
export const defaultFilters: WalkFilters = {
    "duration": "30분 미만",
    "course": "공원 위주",
    "social": "상관 없어요",
    "intensity": "가볍게",
    "time": "오후",
};
const courses = [
    {
        "name": "서울식물원 산책길",
        "stops": ["서울식물원 열린숲", "호수원", "마곡나루역"],
        "points": [
            [37.5667, 126.8275],
            [37.5693, 126.8323],
            [37.5729, 126.8355],
            [37.5686, 126.8298],
        ],
    },
    {
        "name": "마곡 도심 산책길",
        "stops": ["마곡나루역", "마곡문화거리", "마곡광장"],
        "points": [
            [37.5667, 126.8275],
            [37.5634, 126.8303],
            [37.5609, 126.8265],
            [37.5667, 126.8275],
        ],
    },
    {
        "name": "한강 여유 산책길",
        "stops": ["방화한강공원", "한강 산책로", "강변 쉼터"],
        "points": [
            [37.5869, 126.8199],
            [37.5896, 126.8245],
            [37.5916, 126.8291],
            [37.5869, 126.8199],
        ],
    },
    {
        "name": "개화산 숲길",
        "stops": ["개화산공원 입구", "숲길 쉼터", "약사사 갈림길"],
        "points": [
            [37.5784, 126.8052],
            [37.5811, 126.8058],
            [37.5842, 126.8072],
            [37.5784, 126.8052],
        ],
    },
];
function mockCourseFor(filters: WalkFilters = defaultFilters, alternative = 0) {
    const selected = Math.max(
        0,
        walkFilters[1].options.findIndex(value => value === filters.course)
    );
    const course = courses[selected];
    let points: MapCoordinate[] = course.points.map(([latitude, longitude]) => ({
        "latitude": latitude,
        "longitude": longitude,
    }));
    if (
        (alternative +
            (filters.social === "적은 곳" ? 1 : 0) +
            (filters.time === "밤" || filters.time === "새벽" ? 1 : 0)) %
        2
    )
        points = [...points].reverse();
    const loops = Math.max(1, walkFilters[0].options.findIndex(value => value === filters.duration) + 1);
    const routes = Array.from({ "length": loops }, () => points).flat();
    const distance = routes.reduce(
        (sum, point, index) => sum + (index ? metersBetween(routes[index - 1], point) : 0),
        0
    );
    const speed = filters.intensity === "활동적이게" ? 80 : filters.intensity === "보통" ? 65 : 50;
    return {
        ...course,
        "routes": routes,
        "distance": distance,
        "minutes": Math.round(distance / speed),
        "reversed": points[0].latitude !== course.points[0][0],
    };
}
export function metersBetween(a: MapCoordinate, b: MapCoordinate) {
    const radians = Math.PI / 180;
    const dLat = (b.latitude - a.latitude) * radians;
    const dLon = (b.longitude - a.longitude) * radians;
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(a.latitude * radians) * Math.cos(b.latitude * radians) * Math.sin(dLon / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export const formatDistance = (meters: number) => `${(meters / 1000).toFixed(1)}km`;
export const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}분`;

export type WalkCourse = ReturnType<typeof mockCourseFor> & { "source"?: "planner" | "static" };
const selectedCourses = new Map<string, WalkCourse>();
export async function courseFor(filters: WalkFilters = defaultFilters, alternative = 0): Promise<WalkCourse> {
    if (USE_MOCK) return mockCourseFor(filters, alternative);
    const key = JSON.stringify([filters.duration, filters.course, filters.social, filters.intensity, filters.time, alternative]);
    const cached = selectedCourses.get(key);
    if (cached) return cached;
    let position: { "latitude": number; "longitude": number } | undefined;
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.granted) {
        const current = await Location.getLastKnownPositionAsync({ "maxAge": 60000 }) ??
            await Location.getCurrentPositionAsync({ "accuracy": Location.Accuracy.Balanced });
        position = { "latitude": current.coords.latitude, "longitude": current.coords.longitude };
    }
    const course = await api<WalkCourse>("/v1/walk-courses/recommendations", {
        "method": "POST", "timeout": 45000, "data": { ...filters, "alternative": alternative, ...position },
    });
    selectedCourses.set(key, course);
    return course;
}
export function clearCourseCache() { selectedCourses.clear(); }
