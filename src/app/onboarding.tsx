import { useEffect, useRef, useState } from "react";
import type { ComponentRef } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { router } from "expo-router";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, DarkColors, LightColors } from "@/../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { isValidMonthDay } from "@/modules/petBirthday";
import SelectionDropdown from "@/components/SelectionDropdown";
import {
    APIOnboarding,
    ONBOARDING_AGE_GROUPS,
    ONBOARDING_WALK_CONDITIONS,
    ONBOARDING_WALK_DURATIONS,
} from "@/modules/rest/onboarding";

import SvgProgressTrack from "@/assets/svg/onboarding/progress-track.svg";
import SvgProgressFill from "@/assets/svg/onboarding/progress-5.svg";
import SvgDivider from "@/assets/svg/onboarding/divider.svg";
import dayjs from "dayjs";

const questions = [
    { "title": "아이의 나이는 몇 살 인가요?", "options": ONBOARDING_AGE_GROUPS },
    { "title": "아이의 평소 산책량은 얼마나 되나요?", "options": ONBOARDING_WALK_DURATIONS },
    { "title": "아이의 평소 산책 컨디션은 어떠한가요?", "options": ONBOARDING_WALK_CONDITIONS },
];
const progressWidths = [0, 75.0006, 100, 150, 230, 290];

export default function Page() {
    const safeArea = useSafeAreaInsets();
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors, safeArea);
    const { height, width } = useWindowDimensions();
    const progressTrackWidth = Math.max(0, width - safeArea.left - safeArea.right - 94);
    const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
    const opacity = useRef(new Animated.Value(1)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;
    const transitionPending = useRef(false);
    const savePending = useRef(false);
    const [step, setStep] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
    const [region, setRegion] = useState("");
    const [petName, setPetName] = useState("");
    const [breed, setBreed] = useState("");
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    const [birth, setBirth] = useState("");
    const [neutering, setNeutering] = useState("");
    const [diseases, setDiseases] = useState("");
    const [checkingSession, setCheckingSession] = useState(true);
    const [transitioning, setTransitioning] = useState(false);
    const [saving, setSaving] = useState(false);
    const isPetForm = step === 4;
    const disabled = transitioning || saving;
    const canContinue =
        step < 3
            ? answers[step] !== null
            : step === 3
              ? Boolean(region.trim())
              : Boolean(
                    petName.trim() &&
                        breed.trim() &&
                        gender &&
                        age.trim() &&
                        isValidMonthDay(birth) &&
                        neutering &&
                        diseases.trim()
                );

    useEffect(() => {
        let active = true;
        APIOnboarding.getStatus()
            .then(result => {
                if (!active) return;
                if (!result.success) {
                    if (result.status === 401) router.replace("/login");
                    else throw new Error(result.data.message);
                } else if (!result.data.needs_onboarding) {
                    router.replace("/(tabs)/home");
                }
            })
            .catch(error => {
                if (active) {
                    Alert.alert("온보딩 정보 확인 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
                    router.replace("/login");
                }
            })
            .finally(() => {
                if (active) setCheckingSession(false);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const animation = Animated.timing(progressWidth, {
            "toValue": (progressWidths[completed] / 290) * progressTrackWidth,
            "duration": 450,
            "easing": Easing.out(Easing.cubic),
            "useNativeDriver": false,
        });
        animation.start();
        return () => animation.stop();
    }, [completed, progressWidth, progressTrackWidth]);

    useEffect(() => {
        if (!transitionPending.current) return;
        scroll.current?.scrollTo({ "y": 0, "animated": false });
        const animation = Animated.timing(opacity, {
            "toValue": 1,
            "duration": 180,
            "easing": Easing.out(Easing.cubic),
            "useNativeDriver": true,
        });
        animation.start(({ finished }) => {
            if (finished) {
                transitionPending.current = false;
                setTransitioning(false);
            }
        });
        return () => animation.stop();
    }, [step, opacity]);

    useEffect(
        () => () => {
            opacity.stopAnimation();
        },
        [opacity]
    );

    const changeStep = (nextStep: number) => {
        if (transitionPending.current || savePending.current) return;
        Keyboard.dismiss();
        transitionPending.current = true;
        setTransitioning(true);
        setCompleted(nextStep);
        Animated.timing(opacity, {
            "toValue": 0,
            "duration": 140,
            "easing": Easing.in(Easing.cubic),
            "useNativeDriver": true,
        }).start(({ finished }) => {
            if (finished) setStep(nextStep);
        });
    };

    const next = async () => {
        if (!canContinue || transitionPending.current || savePending.current) return;
        if (!isPetForm) {
            changeStep(step + 1);
            return;
        }
        Keyboard.dismiss();
        savePending.current = true;
        setSaving(true);
        try {
            const result = await APIOnboarding.complete({
                "age_group": ONBOARDING_AGE_GROUPS[answers[0]!],
                "walk_duration": ONBOARDING_WALK_DURATIONS[answers[1]!],
                "walk_condition": ONBOARDING_WALK_CONDITIONS[answers[2]!],
                "region": region.trim(),
                "pet": {
                    "name": petName.trim(),
                    "type": breed.trim(),
                    "gender": gender as "female" | "male",
                    "age": Number(age),
                    "birth": birth,
                    "neutering": neutering === "yes",
                    "diseases": diseases.trim(),
                },
            });
            if (!result.success) {
                if (result.status === 401) {
                    router.replace("/login");
                    return;
                }
                throw new Error(result.data.message);
            }
            router.replace("/(tabs)/home");
        } catch (error) {
            Alert.alert(
                "확인해주세요",
                error instanceof Error ? error.message : "저장하지 못했어요. 다시 시도해주세요."
            );
        } finally {
            savePending.current = false;
            setSaving(false);
        }
    };

    if (checkingSession)
        return (
            <View style={[styles.container, styles.loading]}>
                <ActivityIndicator color={colors.green_light2} />
            </View>
        );

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView
                ref={scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[
                    styles.content,
                    isPetForm && styles.petContent,
                    { "minHeight": Math.max(height, isPetForm ? 975 : 852) },
                ]}
            >
                <Animated.View style={[styles.header, isPetForm && { "opacity": opacity }]}>
                    <Text style={styles.headerText}>
                        {isPetForm ? "마지막으로, 아이의 정보를" : "시작에 앞서, 간단한 설문을"}
                    </Text>
                    <Text style={styles.headerText}>{isPetForm ? "입력해주세요." : "진행해주세요."}</Text>
                </Animated.View>
                {isPetForm ? (
                    <Animated.View
                        style={[styles.petForm, { "opacity": opacity }]}
                        pointerEvents={disabled ? "none" : "auto"}
                    >
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>강아지 이름</Text>
                            <TextInput
                                accessibilityLabel="강아지 이름"
                                style={styles.fieldInput}
                                value={petName}
                                onChangeText={setPetName}
                                maxLength={30}
                                editable={!disabled}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>종</Text>
                            <TextInput
                                accessibilityLabel="종"
                                style={styles.fieldInput}
                                value={breed}
                                onChangeText={setBreed}
                                maxLength={50}
                                editable={!disabled}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>성별</Text>
                            <SelectionDropdown
                                disabled={disabled}
                                value={gender}
                                options={[
                                    { "label": "여자", "value": "female" },
                                    { "label": "남자", "value": "male" },
                                ]}
                                onChange={value => setGender(String(value))}
                                containerStyle={styles.fieldSelect}
                            >
                                <Text style={[styles.fieldSelectText, !gender && styles.fieldPlaceholder]}>
                                    {gender === "female" ? "여자" : gender === "male" ? "남자" : "눌러서 선택"}
                                </Text>
                            </SelectionDropdown>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>나이</Text>
                            <TextInput
                                accessibilityLabel="나이"
                                style={styles.fieldInput}
                                value={age}
                                onChangeText={value => setAge(value.replace(/\D/g, ""))}
                                keyboardType="number-pad"
                                maxLength={2}
                                editable={!disabled}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>생일</Text>
                            <TextInput
                                accessibilityLabel="생일"
                                style={styles.fieldInput}
                                value={birth}
                                onChangeText={value => {
                                    const digits = value.replace(/\D/g, "").slice(0, 4);
                                    setBirth(digits.length > 2 ? `${digits.slice(0, 2)}.${digits.slice(2)}` : digits);
                                }}
                                placeholder={dayjs().format("MM.DD")}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="number-pad"
                                maxLength={5}
                                editable={!disabled}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>중성화 여부</Text>
                            <SelectionDropdown
                                disabled={disabled}
                                value={neutering}
                                options={[
                                    { "label": "했어요", "value": "yes" },
                                    { "label": "안 했어요", "value": "no" },
                                ]}
                                onChange={value => setNeutering(String(value))}
                                containerStyle={styles.fieldSelect}
                            >
                                <Text style={[styles.fieldSelectText, !neutering && styles.fieldPlaceholder]}>
                                    {neutering === "yes" ? "했어요" : neutering === "no" ? "안 했어요" : "눌러서 선택"}
                                </Text>
                            </SelectionDropdown>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>질병 여부</Text>
                            <TextInput
                                accessibilityLabel="질병 여부"
                                style={styles.fieldInput}
                                value={diseases}
                                onChangeText={setDiseases}
                                maxLength={300}
                                editable={!disabled}
                            />
                        </View>
                    </Animated.View>
                ) : (
                    <View style={styles.survey}>
                        <View
                            style={styles.progress}
                            accessibilityRole="progressbar"
                            accessibilityLabel="온보딩 진행"
                            accessibilityValue={{ "min": 0, "max": 5, "now": completed }}
                        >
                            <Text style={styles.progressText}>{completed}/5 완료</Text>
                            <View style={styles.progressTrack}>
                                <SvgProgressTrack width={(progressTrackWidth * 320) / 290} />
                            </View>
                            <Animated.View style={[styles.progressFill, { "width": progressWidth }]}>
                                <SvgProgressFill width={progressTrackWidth} />
                            </Animated.View>
                        </View>
                        <Animated.View
                            style={[styles.question, { "opacity": opacity }]}
                            pointerEvents={disabled ? "none" : "auto"}
                        >
                            <Text style={styles.questionText}>
                                {step === 3 ? "현재 거주중인 지역을 입력해주세요." : questions[step].title}
                            </Text>
                            {step === 3 ? (
                                <TextInput
                                    accessibilityLabel="거주 지역"
                                    style={[styles.regionInput, !region && styles.regionPlaceholder]}
                                    value={region}
                                    onChangeText={setRegion}
                                    placeholder="지역을 입력해주세요"
                                    placeholderTextColor="#9CA3AF"
                                    maxLength={100}
                                    returnKeyType="done"
                                    onSubmitEditing={Keyboard.dismiss}
                                />
                            ) : (
                                <View style={styles.options} accessibilityRole="radiogroup">
                                    {questions[step].options.map((option, index) => (
                                        <View key={option}>
                                            <Pressable
                                                accessibilityRole="radio"
                                                accessibilityState={{ "checked": answers[step] === index }}
                                                style={[
                                                    styles.option,
                                                    answers[step] === index && styles.optionSelected,
                                                ]}
                                                onPress={() =>
                                                    setAnswers(current =>
                                                        current.map((value, question) =>
                                                            question === step ? index : value
                                                        )
                                                    )
                                                }
                                                disabled={disabled}
                                            >
                                                <Text style={styles.optionText}>{option}</Text>
                                            </Pressable>
                                            {index < 4 && (
                                                <View style={styles.divider}>
                                                    <SvgDivider width="100%" style={styles.dividerImage} />
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </Animated.View>
                    </View>
                )}
                <View style={styles.buttons}>
                    {step > 0 && (
                        <Pressable
                            accessibilityRole="button"
                            disabled={disabled}
                            style={[styles.button, styles.previousButton]}
                            onPress={() => changeStep(step - 1)}
                        >
                            <Text style={[styles.buttonText, styles.previousButtonText]}>이전으로 되돌아가기</Text>
                        </Pressable>
                    )}
                    <Pressable
                        accessibilityRole="button"
                        disabled={disabled || !canContinue}
                        style={[styles.button, isPetForm && (disabled || !canContinue) && styles.buttonDisabled]}
                        onPress={() => void next()}
                    >
                        <Text style={styles.buttonText}>{isPetForm ? "앱 시작하기" : "다음으로 이동하기"}</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const getStyles = (colors: Colors, safeArea: EdgeInsets) =>
    StyleSheet.create({
        "container": {
            "flex": 1,
            "flexDirection": "column",
            "backgroundColor": "#F7F8F3",
            "width": "100%",
            "paddingLeft": safeArea.left,
            "paddingRight": safeArea.right,
        },
        "loading": {
            "justifyContent": "center",
            "alignItems": "center",
        },
        "content": {
            "flexGrow": 1,
            "paddingTop": Platform.select({
                "android": safeArea.top + 14,
                "ios": 76,
            }),
            "paddingBottom": Math.max(103, safeArea.bottom + 24),
        },
        "petContent": {
            "paddingBottom": Math.max(38, safeArea.bottom),
        },
        "header": {
            "flexDirection": "column",
            "paddingHorizontal": 32,
        },
        "headerText": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 28,
            "lineHeight": 30,
            "letterSpacing": 0.84,
            "color": "#2F3A2D",
        },
        "survey": {
            "flexDirection": "column",
            "marginTop": 23,
            "marginHorizontal": 32,
            "gap": 23,
        },
        "progress": {
            "height": 53.4,
            "backgroundColor": "#FAFBF7",
            "borderColor": "#9A9A9A",
            "borderWidth": 0.7,
            "borderRadius": 7,
            "paddingHorizontal": 15,
            "paddingTop": 10,
            "overflow": "hidden",
        },
        "progressText": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 17,
            "lineHeight": 20.4,
            "letterSpacing": -0.34,
            "color": "#000000",
        },
        "progressTrack": {
            "position": "absolute",
            "left": 15,
            "top": 38.7,
            "height": 4,
        },
        "progressFill": {
            "position": "absolute",
            "left": 14.3,
            "top": 38.3,
            "height": 4,
            "borderRadius": 2,
            "overflow": "hidden",
        },
        "question": {
            "flexDirection": "column",
            "gap": 23,
        },
        "questionText": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 26,
            "lineHeight": 28,
            "letterSpacing": 0.78,
            "color": "#2F3A2D",
        },
        "options": {
            "backgroundColor": "#FFFFFF",
            "borderColor": "#9A9A9A",
            "borderWidth": 0.7,
            "borderRadius": 10,
            "overflow": "hidden",
        },
        "option": {
            "height": 55,
            "justifyContent": "center",
            "paddingHorizontal": 15,
        },
        "optionSelected": {
            "backgroundColor": "rgba(104,143,110,0.2)",
        },
        "optionText": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 24,
            "lineHeight": 28,
            "letterSpacing": 0.72,
            "color": "#474747",
        },
        "divider": {
            "height": 0.7,
            "width": "100%",
        },
        "dividerImage": {
            "minHeight": 0.7,
        },
        "regionInput": {
            "height": 55,
            "backgroundColor": "#FFFFFF",
            "borderColor": "#E5E7EB",
            "borderWidth": 1,
            "borderRadius": 8,
            "paddingHorizontal": 18,
            "fontFamily": "Ownglyph PDH",
            "fontSize": 20,
            "color": "#474747",
        },
        "regionPlaceholder": {
            "fontSize": 18,
        },
        "petForm": {
            "flexDirection": "column",
            "marginTop": 50,
            "paddingHorizontal": 32,
            "gap": 20,
        },
        "field": {
            "flexDirection": "column",
            "gap": 8,
        },
        "fieldLabel": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 20,
            "lineHeight": 22,
            "letterSpacing": 0.6,
            "color": "#000000",
        },
        "fieldInput": {
            "height": 35,
            "backgroundColor": "#FFFFFF",
            "borderColor": colors.green_light2,
            "borderWidth": 0.5,
            "borderRadius": 5,
            "paddingHorizontal": 12,
            "paddingVertical": 5,
            "fontFamily": "Ownglyph PDH",
            "fontSize": 20,
            "color": "#474747",
        },
        "fieldSelect": {
            "height": 35,
            "backgroundColor": "#FFFFFF",
            "borderColor": colors.green_light2,
            "borderWidth": 0.5,
            "borderRadius": 5,
            "paddingHorizontal": 12,
            "justifyContent": "center",
        },
        "fieldSelectText": {
            "width": "100%",
            "height": 23,
            "fontFamily": "Ownglyph PDH",
            "fontSize": 20,
            "color": "#474747",
        },
        "fieldPlaceholder": {
            "color": "#9CA3AF",
        },
        "buttons": {
            "flexDirection": "column",
            "marginTop": "auto",
            "marginHorizontal": 32,
            "paddingTop": 54,
            "gap": 12,
        },
        "button": {
            "height": 55,
            "backgroundColor": colors.green_light2,
            "borderRadius": 10,
            "alignItems": "center",
            "justifyContent": "center",
        },
        "buttonText": {
            "fontFamily": "Ownglyph PDH",
            "fontSize": 25,
            "color": "#FFFFFF",
        },
        "buttonDisabled": {
            "opacity": 0.4,
        },
        "previousButton": {
            "backgroundColor": "transparent",
            "borderColor": colors.green_light2,
            "borderWidth": 1.5,
        },
        "previousButtonText": {
            "color": colors.green_light2,
        },
    });
