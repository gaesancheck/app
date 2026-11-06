import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import session from "./session";
import { careData, type MissingPet, type Report } from "./careData";
import { missingPetExamples, shelterExamples, type ShelterPet } from "./emergencyData";
import { mockCommunityData as communityData } from "./communityData.mock";
import { getAccountIdentity } from "./accountStorage";

const STORAGE_KEY = "emergency.service.v1";
type EmergencyStore = { "pets": MissingPet[]; "reports": Report[]; "removedReportIds": string[] };
let queue: Promise<unknown> = Promise.resolve();

async function identity(): Promise<string> {
    const current = await session.get();
    if (!current) throw new Error("다시 로그인해주세요.");
    return getAccountIdentity();
}
async function read(): Promise<EmergencyStore> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { "pets": missingPetExamples, "reports": [], "removedReportIds": [] };
    const store = JSON.parse(raw) as EmergencyStore;
    return {
        "pets": store.pets ?? [],
        "reports": store.reports ?? [],
        "removedReportIds": store.removedReportIds ?? [],
    };
}
function transact<T>(change: (store: EmergencyStore) => T | Promise<T>, write = false): Promise<T> {
    const operation = queue.then(async () => {
        const store = await read();
        const result = await change(store);
        if (write) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        return result;
    });
    queue = operation.catch(() => undefined);
    return operation;
}

export const mockEmergencyService = {
    "currentIdentity": identity,
    async "getMissingPets"(): Promise<MissingPet[]> {
        const saved = await careData.get();
        return transact(store => {
            const pets = [...store.pets];
            if (saved.emergency && !pets.some(pet => pet.id === saved.emergency?.id)) pets.unshift(saved.emergency);
            return pets;
        });
    },
    async "registerMissing"(pet: MissingPet): Promise<void> {
        const next = { ...pet, "ownerId": await identity() };
        await transact(store => {
            store.pets = [next, ...store.pets.filter(item => item.id !== pet.id)];
        }, true);
        await communityData.publishMissingPet(next);
        await careData.update(current => ({ ...current, "emergency": next, "checks": [] }));
    },
    async "resolveMissing"(petId: string): Promise<void> {
        await communityData.removeMissingPet(petId);
        await transact(store => {
            store.pets = store.pets.filter(item => item.id !== petId);
        }, true);
        await careData.update(current => ({ ...current, "emergency": null, "checks": [] }));
    },
    async "getShelterPets"(): Promise<ShelterPet[]> {
        return shelterExamples;
    },
    async "getReports"(incoming = false): Promise<Report[]> {
        const [accountId, saved] = await Promise.all([identity(), careData.get()]);
        return transact(store => {
            const combined = [
                ...store.reports,
                ...saved.reports.filter(
                    item =>
                        !store.removedReportIds.includes(item.id) &&
                        !store.reports.some(report => report.id === item.id)
                ),
            ];
            return combined
                .filter(report =>
                    incoming ? report.ownerId === accountId : !report.senderId || report.senderId === accountId
                )
                .sort((a, b) => b.createdAt - a.createdAt);
        });
    },
    async "getReport"(id: string): Promise<Report | null> {
        const [sent, received] = await Promise.all([this.getReports(false), this.getReports(true)]);
        return [...sent, ...received].find(report => report.id === id) ?? null;
    },
    async "submitReport"(data: Omit<Report, "id" | "createdAt" | "messages">): Promise<Report> {
        const [senderId, saved, pets] = await Promise.all([identity(), careData.get(), this.getMissingPets()]);
        const pet = pets.find(item => item.id === data.petId);
        if (!pet) throw new Error("실종동물 정보를 찾을 수 없어요.");
        const report: Report = {
            ...data,
            "id": Crypto.randomUUID(),
            "createdAt": Date.now(),
            "messages": [],
            "senderId": senderId,
            "senderName": saved.account.name,
            "ownerId": pet.ownerId,
        };
        await transact(store => {
            store.reports.unshift(report);
        }, true);
        await careData.update(current => ({
            ...current,
            "reports": [report, ...current.reports.filter(item => item.id !== report.id)],
        }));
        return report;
    },
    async "sendMessage"(reportId: string, content: string): Promise<Report> {
        const [accountId, saved] = await Promise.all([identity(), careData.get()]);
        const report = await this.getReport(reportId);
        if (!report) throw new Error("제보를 찾을 수 없어요.");
        if (!content.trim()) throw new Error("내용을 입력해주세요.");
        const message = {
            "id": Crypto.randomUUID(),
            "content": content.trim(),
            "createdAt": Date.now(),
            "senderId": accountId,
            "senderName": saved.account.name,
        };
        return transact(store => {
            if (store.removedReportIds.includes(reportId)) throw new Error("종료된 제보예요.");
            const current = store.reports.find(item => item.id === reportId) ?? report;
            const next = { ...current, "messages": [...current.messages, message] };
            store.reports = [next, ...store.reports.filter(item => item.id !== reportId)];
            return next;
        }, true);
    },
    async "deleteAccountData"(): Promise<void> {
        const accountId = await identity();
        await transact(store => {
            store.pets = store.pets.filter(pet => pet.ownerId !== accountId);
            store.removedReportIds = [
                ...new Set([
                    ...store.removedReportIds,
                    ...store.reports
                        .filter(report => report.ownerId === accountId || report.senderId === accountId)
                        .map(report => report.id),
                ]),
            ];
            store.reports = store.reports.filter(
                report => report.ownerId !== accountId && report.senderId !== accountId
            );
        }, true);
    },
};
