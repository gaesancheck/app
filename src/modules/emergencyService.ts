import { api, USE_MOCK } from "./rest";
import type { APIMyInfo } from "./rest/my";
import { mockEmergencyService } from "./emergencyService.mock";
import type { MissingPet, Report } from "./careData";
import type { ShelterPet } from "./emergencyData";
export const emergencyService = USE_MOCK ? mockEmergencyService : {
    "currentIdentity": async () => (await api<APIMyInfo>("/v1/me")).account.id,
    "getMissingPets": () => api<MissingPet[]>("/v1/missing-pets"),
    async "registerMissing"(pet: MissingPet): Promise<void> {
        const { ownerId, ownerName, ...data } = pet;
        await api("/v1/missing-pets", { "method": "POST", "data": data });
    },
    async "resolveMissing"(petId: string): Promise<void> {
        await api(`/v1/missing-pets/${encodeURIComponent(petId)}`, { "method": "DELETE" });
    },
    "getShelterPets": (params: Record<string, string | number> = {}) => api<ShelterPet[]>("/v1/shelter-pets", { "params": params }),
    "getReports": (incoming = false) => api<Report[]>("/v1/reports", { "params": { "incoming": incoming } }),
    "getReport": (id: string): Promise<Report | null> => api<Report>(`/v1/reports/${encodeURIComponent(id)}`),
    "submitReport": (data: Omit<Report, "id" | "createdAt" | "messages">) => api<Report>("/v1/reports", {
        "method": "POST", "data": { "petId": data.petId, "petName": data.petName, "time": data.time, "position": data.position, "content": data.content, "pictures": data.pictures },
    }),
    "sendMessage": (id: string, content: string) => api<Report>(`/v1/reports/${encodeURIComponent(id)}/messages`, { "method": "POST", "data": { "content": content } }),
    // Account cascade deletion is performed by DELETE /v1/me; never make another authenticated request afterwards.
    async "deleteAccountData"(): Promise<void> {},
};
