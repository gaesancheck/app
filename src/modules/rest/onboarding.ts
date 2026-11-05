import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import type { RESTResponse } from ".";
import session from "../session";
import { careData, newPet, type Pet } from "../careData";
import { isValidMonthDay } from "../petBirthday";

export const ONBOARDING_AGE_GROUPS = ["0-3살", "4-6살", "7-9살", "9-12살", "13살 이상"] as const;
export const ONBOARDING_WALK_DURATIONS = ["30분 미만", "30분-1시간", "1시간-1시간 30분", "1시간 30분-2시간", "2시간 이상"] as const;
export const ONBOARDING_WALK_CONDITIONS = ["최고예요!", "좋아요", "평범한 것 같아요", "조금 힘들어해요", "많이 힘들어해요"] as const;

export type APIOnboardingStatus = {
    "needs_onboarding": boolean;
    "nickname"?: string;
    "completed_at"?: number;
    "answers"?: CompleteOnboardingRequest;
};
export type CompleteOnboardingRequest = {
    "age_group": typeof ONBOARDING_AGE_GROUPS[number];
    "walk_duration": typeof ONBOARDING_WALK_DURATIONS[number];
    "walk_condition": typeof ONBOARDING_WALK_CONDITIONS[number];
    "region": string;
    "pet": Pick<Pet, "name" | "type" | "gender" | "age" | "birth" | "neutering" | "diseases">;
};
const STORAGE_PREFIX = "onboarding.v1.";

async function storageKey(accessToken: string): Promise<string> {
    let identity = JSON.stringify(["token", accessToken]);
    try {
        const encoded = accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const bytes = atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "="));
        const decoded = decodeURIComponent(Array.from(bytes, value => `%${value.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""));
        const claims: unknown = JSON.parse(decoded);
        if (typeof claims === "object" && claims !== null && "sub" in claims && typeof claims.sub === "string" && claims.sub) {
            // Only a stable mock storage key, never proof of authentication or token validation.
            const issuer = "iss" in claims && typeof claims.iss === "string" ? claims.iss : "";
            identity = JSON.stringify(["subject", issuer, claims.sub]);
        }
    } catch {
        // Opaque mock tokens use their token hash instead; tokens are never stored in AsyncStorage.
    }
    return STORAGE_PREFIX + await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, identity);
}

async function getMockOnboardingStatus(accessToken: string): Promise<APIOnboardingStatus> {
    const stored = await AsyncStorage.getItem(await storageKey(accessToken));
    if (!stored) return { "needs_onboarding": true };
    const value: unknown = JSON.parse(stored);
    if (typeof value !== "object" || value === null || !("needs_onboarding" in value) || typeof value.needs_onboarding !== "boolean") {
        throw new Error("온보딩 정보를 불러오지 못했어요.");
    }
    return value as APIOnboardingStatus;
}

function unauthorized(): RESTResponse<never, APIError> {
    return { "status": 401, "success": false, "headers": {}, "data": { "status": 401, "message": "다시 로그인해주세요." } };
}

// Local mock adapters. Replace these bodies with the documented REST endpoints when available.
export const APIOnboarding = {
    async clear(): Promise<void> {
        const current = await session.get();
        if (current) await AsyncStorage.removeItem(await storageKey(current.jwt));
    },
    async getStatus(): Promise<RESTResponse<APIOnboardingStatus, APIError>> {
        // GET /v1/me/onboarding — Authorization: Bearer <app JWT>
        const current = await session.get();
        if (!current) return unauthorized();
        const status = await getMockOnboardingStatus(current.jwt);
        return {
            "status": 200, "success": true, "headers": {},
            "data": { ...status, "needs_onboarding": current.needsOnboarding ?? status.needs_onboarding },
        };
    },
    async complete(data: CompleteOnboardingRequest): Promise<RESTResponse<APIOnboardingStatus, APIError>> {
        // PUT /v1/me/onboarding — JSON: CompleteOnboardingRequest
        const current = await session.get();
        if (!current) return unauthorized();
        const invalid = (message: string): RESTResponse<never, APIError> => ({
            "status": 400, "success": false, "headers": {},
            "data": { "status": 400, "message": message },
        });
        if (!ONBOARDING_AGE_GROUPS.includes(data.age_group) || !ONBOARDING_WALK_DURATIONS.includes(data.walk_duration)
            || !ONBOARDING_WALK_CONDITIONS.includes(data.walk_condition)) return invalid("설문 항목을 모두 선택해주세요.");
        const region = data.region.trim();
        if (!region || region.length > 100) return invalid("거주 지역을 1~100자로 입력해주세요.");
        const pet = { ...data.pet, "name": data.pet.name.trim(), "type": data.pet.type.trim(), "diseases": data.pet.diseases.trim(), "birth": data.pet.birth.trim() };
        if (!pet.name || pet.name.length > 30 || !pet.type || pet.type.length > 50) return invalid("강아지 이름과 종을 확인해주세요.");
        if (pet.gender !== "female" && pet.gender !== "male") return invalid("성별을 선택해주세요.");
        if (!Number.isInteger(pet.age) || pet.age < 0 || pet.age > 99) return invalid("나이를 0~99살 사이로 입력해주세요.");
        if (!isValidMonthDay(pet.birth)) {
            return invalid("생일을 올바른 MM.DD 형식으로 입력해주세요.");
        }
        if (typeof pet.neutering !== "boolean" || !pet.diseases || pet.diseases.length > 300) return invalid("중성화 여부와 질병 여부를 입력해주세요. 질병이 없다면 '없음'으로 입력해주세요.");
        const answers: CompleteOnboardingRequest = { ...data, "region": region, "pet": pet };
        const status: APIOnboardingStatus = { "needs_onboarding": false, "answers": answers, "completed_at": Date.now() };
        await careData.update(saved => ({
            ...saved,
            "pets": saved.pets.length ? saved.pets.map((existing, index) => index === 0 ? { ...existing, ...pet, "walkDuration": answers.walk_duration, "walkCondition": answers.walk_condition } : existing) : [{ ...newPet(), ...pet, "walkDuration": answers.walk_duration, "walkCondition": answers.walk_condition }],
        }));
        await AsyncStorage.setItem(await storageKey(current.jwt), JSON.stringify(status));
        await session.set({ ...current, "needsOnboarding": false });
        return { "status": 200, "success": true, "headers": {}, "data": status };
    },
};
