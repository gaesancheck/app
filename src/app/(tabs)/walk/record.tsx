import { useEffect, useRef, useState } from "react";
import { Alert, AppState, Linking, View } from "react-native";
import { router, useLocalSearchParams, usePreventRemove } from "expo-router";
import * as Location from "expo-location";
import * as Crypto from "expo-crypto";
import dayjs from "dayjs";
import { CareButton, CareScreen, CareText, showCareError } from "@/components/CareUI";
import { RouteMap } from "@/components/EmergencyUI";
import { CourseStops, WalkMetrics } from "@/components/WalkUI";
import { courseFor, defaultFilters, metersBetween, type WalkFilters } from "@/modules/walkData";
import userData from "@/modules/userData";
import type { MapCoordinate } from "../../../../modules/kakao-map";

export default function Page() {
    const params = useLocalSearchParams<Record<string, string>>();
    const recommended = params.recommended === "1";
    const filters = { ...defaultFilters, ...params } as WalkFilters;
    const course = courseFor(filters, Number(params.alternative) || 0);
    const [points, setPoints] = useState<MapCoordinate[]>([]);
    const [seconds, setSeconds] = useState(0);
    const [distance, setDistance] = useState(0);
    const [paused, setPaused] = useState(false);
    const [status, setStatus] = useState("현재 위치를 확인하고 있어요.");
    const [saving, setSaving] = useState(false);
    const [alternative, setAlternative] = useState(Number(params.alternative) || 0);
    const watch = useRef<Location.LocationSubscription | null>(null);
    const live = useRef(true);
    const mounted = useRef(true);
    const [recording, setRecording] = useState(true);
    const pointsRef = useRef<MapCoordinate[]>([]);
    const distanceRef = useRef(0);
    const elapsed = useRef(0);
    const started = useRef(Date.now());
    const date = useRef(dayjs().format("YYYYMMDD"));
    const lastSample = useRef<{ "point": MapCoordinate; "timestamp": number } | null>(null);
    const generation = useRef(0);
    function stopLocation() {
        generation.current++;
        watch.current?.remove();
        watch.current = null;
        lastSample.current = null;
    }
    async function startLocation() {
        stopLocation();
        const request = generation.current;
        try {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (!mounted.current || request !== generation.current) return;
            if (!permission.granted) {
                setStatus("위치 권한이 없어 시간만 기록하고 있어요. 설정에서 위치 접근을 허용해주세요.");
                return;
            }
            if (!(await Location.hasServicesEnabledAsync())) {
                setStatus("위치 서비스를 켜면 이동 경로와 거리를 기록할 수 있어요.");
                return;
            }
            if (!mounted.current || request !== generation.current || !live.current) return;
            setStatus("앱을 사용하는 동안 이동 경로를 기록해요.");
            const subscription = await Location.watchPositionAsync(
                { "accuracy": Location.Accuracy.High, "timeInterval": 3000, "distanceInterval": 5 },
                location => {
                    if (
                        !mounted.current ||
                        !live.current ||
                        request !== generation.current ||
                        (location.coords.accuracy !== null && location.coords.accuracy > 50)
                    )
                        return;
                    const point = { "latitude": location.coords.latitude, "longitude": location.coords.longitude };
                    const previous = lastSample.current;
                    const delta = previous ? metersBetween(previous.point, point) : 0;
                    if (
                        previous &&
                        (location.timestamp <= previous.timestamp ||
                            delta / Math.max(1, (location.timestamp - previous.timestamp) / 1000) > 12)
                    )
                        return;
                    if (delta < 3 && previous) return;
                    lastSample.current = { "point": point, "timestamp": location.timestamp };
                    pointsRef.current = [...pointsRef.current, point];
                    distanceRef.current += delta;
                    setPoints(pointsRef.current);
                    setDistance(distanceRef.current);
                }
            );
            if (!mounted.current || request !== generation.current) subscription.remove();
            else watch.current = subscription;
        } catch {
            if (mounted.current) setStatus("현재 위치를 받지 못했어요. 위치 서비스를 확인하고 다시 연결해주세요.");
        }
    }
    function pause() {
        if (!live.current) return;
        elapsed.current += Math.max(0, (Date.now() - started.current) / 1000);
        live.current = false;
        stopLocation();
        setPaused(true);
        setSeconds(Math.floor(elapsed.current));
    }
    function resume() {
        started.current = Date.now();
        live.current = true;
        setPaused(false);
        void startLocation();
    }
    useEffect(() => {
        mounted.current = true;
        void startLocation();
        const timer = setInterval(() => {
            if (live.current) setSeconds(Math.floor(elapsed.current + (Date.now() - started.current) / 1000));
        }, 1000);
        const app = AppState.addEventListener("change", state => {
            if (state === "background") {
                pause();
                setStatus("앱이 비활성화되어 산책 기록을 일시 정지했어요.");
            }
        });
        return () => {
            mounted.current = false;
            clearInterval(timer);
            app.remove();
            stopLocation();
        };
    }, []);
    usePreventRemove(recording, ({ repeat }) => {
        Alert.alert("산책을 나갈까요?", "저장하지 않은 산책 기록은 사라져요.", [
            { "text": "계속 산책", "style": "cancel" },
            {
                "text": "나가기",
                "style": "destructive",
                "onPress": () => {
                    setRecording(false);
                    setTimeout(repeat, 0);
                },
            },
        ]);
    });
    async function finish() {
        if (saving) return;
        pause();
        setSaving(true);
        const record: WalkRecord = {
            "id": Crypto.randomUUID(),
            "date": date.current,
            "rate": 3,
            "routes": pointsRef.current,
            "duration": Math.floor(elapsed.current),
            "distance": Math.round(distanceRef.current),
            "destination": recommended ? course.name : "자유 산책",
            "content": "",
        };
        try {
            const current = await userData.get();
            await userData.set({ ...current, "walkRecords": [...current.walkRecords, record] });
            setRecording(false);
            setTimeout(() => router.replace({ "pathname": "/(tabs)/home/write", "params": { "id": record.id } }), 0);
        } catch (error) {
            showCareError(error);
            setSaving(false);
        }
    }
    const preview = courseFor(filters, alternative);
    return (
        <CareScreen
            title={recommended ? "경로 추천 산책" : "자유 산책"}
            footer={
                <CareButton outline disabled={saving} onPress={finish}>
                    {saving ? "산책 저장 중" : "산책 종료하기"}
                </CareButton>
            }
        >
            {recommended && !points.length && (
                <CareText style={{ "fontSize": 13, "marginBottom": 8 }}>추천 경로 미리보기</CareText>
            )}
            <RouteMap points={points.length ? points : recommended ? preview.routes : []} height={280} />
            <WalkMetrics
                seconds={seconds}
                distance={distance}
                destination={recommended ? filters.course.replace(" 위주", "") : "없음"}
            />
            <View style={{ "marginTop": 14, "gap": 12 }}>
                <CareText style={{ "fontSize": 13, "color": "#6E6E6E" }}>{status}</CareText>
                <View style={{ "flexDirection": "row", "gap": 10 }}>
                    <CareButton small outline onPress={paused ? resume : pause}>
                        {paused ? "산책 계속하기" : "일시 정지"}
                    </CareButton>
                    <CareButton
                        small
                        outline
                        onPress={() => {
                            if (paused) resume();
                            else void startLocation();
                        }}
                    >
                        위치 다시 연결
                    </CareButton>
                </View>
                {status.includes("권한") && (
                    <CareButton
                        small
                        outline
                        onPress={() => {
                            void Linking.openSettings();
                        }}
                    >
                        위치 권한 설정
                    </CareButton>
                )}
                {recommended && (
                    <>
                        <CareText style={{ "marginTop": 12 }}>경로 추천</CareText>
                        <CourseStops stops={preview.reversed ? [...preview.stops].reverse() : preview.stops} />
                        <CareButton small onPress={() => setAlternative(value => value + 1)}>
                            새 경로 추천
                        </CareButton>
                    </>
                )}
            </View>
        </CareScreen>
    );
}
