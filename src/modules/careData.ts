import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, Paths } from "expo-file-system";
import { APIMy, type APIMyInfo } from "./rest/my";
import { api, USE_MOCK } from "./rest";
import session from "./session";
import { mockCareData } from "./careData.mock";
export type Pet = NonNullable<APIMyInfo["petInfo"]> & { "id": string; "specials": string };
export type Attachment = { "name": string; "url": string };
export type Inquiry = {
    "id": string;
    "contactType": string;
    "title": string;
    "content": string;
    "attachments": Attachment[];
    "createdAt": number;
    "answer"?: string;
};
export type MissingPet = Pet & {
    "missingSince": number;
    "lastPosition": string;
    "lastTime": string;
    "ownerName": string;
    "ownerId"?: string;
};
export type Report = {
    "id": string;
    "petId": string;
    "petName": string;
    "time": string;
    "position": string;
    "content": string;
    "pictures": string[];
    "createdAt": number;
    "senderId"?: string;
    "senderName"?: string;
    "ownerId"?: string;
    "messages": { "id": string; "content": string; "createdAt": number; "senderId"?: string; "senderName"?: string }[];
};
export type CareData = {
    "account": APIMyInfo["account"];
    "pets": Pet[];
    "inquiries": Inquiry[];
    "emergency": MissingPet | null;
    "checks": string[];
    "reports": Report[];
};
async function getRemote(): Promise<CareData> {
    const [me, pets, inquiries, emergency, reports] = await Promise.all([
        api<APIMyInfo>("/v1/me"), api<Pet[]>("/v1/me/pets"), api<Inquiry[]>("/v1/me/contacts"),
        api<Pick<CareData, "emergency" | "checks">>("/v1/me/emergency"), api<Report[]>("/v1/reports"),
    ]);
    return { "account": me.account, "pets": pets, "inquiries": inquiries, ...emergency, "reports": reports };
}
export function normalizeBirth(birth: string): string {
    return /^\d{8}$/.test(birth) ? `${birth.slice(4, 6)}.${birth.slice(6, 8)}` : birth;
}
export const careData = USE_MOCK ? mockCareData : {
    "get": getRemote,
    async "update"(change: (current: CareData) => CareData): Promise<CareData> {
        // Legacy checklist screens still use the aggregate updater; domain writes use their own endpoints.
        const current = await getRemote();
        const next = change(current);
        if (JSON.stringify(next.checks) !== JSON.stringify(current.checks))
            await api("/v1/me/emergency/checks", { "method": "PUT", "data": { "checks": next.checks } });
        return getRemote();
    },
    async "savePet"(pet: Pet, existing: boolean): Promise<Pet> {
        const { id, ...data } = pet;
        return api<Pet>(existing ? `/v1/me/pets/${encodeURIComponent(id)}` : "/v1/me/pets", {
            "method": existing ? "PUT" : "POST", "data": { ...data, "birth": normalizeBirth(data.birth), "diseases": data.diseases.trim() || "없음" },
        });
    },
    async "deletePet"(id: string): Promise<void> { await api(`/v1/me/pets/${encodeURIComponent(id)}`, { "method": "DELETE" }); },
    async "clear"(): Promise<void> {},
    async "clearAll"(): Promise<void> {
        for (const name of ["care-attachments", "community-attachments"]) {
            const directory = new Directory(Paths.document, name);
            if (directory.exists) directory.delete();
        }
        await AsyncStorage.clear();
        await session.clear();
    },
};
export function newPet(): Pet {
    return {
        "id": Crypto.randomUUID(),
        "name": "",
        "type": "",
        "gender": "female",
        "age": 0,
        "birth": "",
        "neutering": false,
        "diseases": "",
        "picture": "",
        "specials": "",
    };
}
