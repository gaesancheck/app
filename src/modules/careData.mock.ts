import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import { APIMy, type APIMyInfo } from "./rest/my";
import session from "./session";
import { accountStorageKey } from "./accountStorage";

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
const STORAGE_KEY = "careData.v1";
let queue: Promise<unknown> = Promise.resolve();

async function storageKey(): Promise<string> {
    const key = await accountStorageKey(STORAGE_KEY);
    const current = await session.get();
    if (current && (await AsyncStorage.getItem(key)) === null) {
        const previous = `${STORAGE_KEY}.${await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, current.jwt)}`;
        const stored = await AsyncStorage.getItem(previous);
        if (stored) {
            await AsyncStorage.setItem(key, stored);
            if (previous !== key) await AsyncStorage.removeItem(previous);
        }
    }
    return key;
}

async function read(key: string): Promise<CareData> {
    const saved = await AsyncStorage.getItem(key);
    if (saved) {
        const parsed = JSON.parse(saved) as CareData;
        if (
            !parsed.account ||
            !Array.isArray(parsed.pets) ||
            !Array.isArray(parsed.inquiries) ||
            !Array.isArray(parsed.checks) ||
            !Array.isArray(parsed.reports)
        ) {
            throw new Error("저장된 정보를 불러오지 못했어요.");
        }
        return parsed;
    }
    const response = await APIMy.getMyInfo();
    if (!response.success) throw new Error(response.data.message);
    const initial: CareData = {
        "account": response.data.account,
        "pets": response.data.petInfo ? [{ ...response.data.petInfo, "id": Crypto.randomUUID(), "specials": "" }] : [],
        "inquiries": [],
        "emergency": null,
        "checks": [],
        "reports": [],
    };
    await AsyncStorage.setItem(key, JSON.stringify(initial));
    return initial;
}

export const mockCareData = {
    async "savePet"(pet: Pet, existing: boolean): Promise<Pet> {
        await this.update(current => ({ ...current, "pets": existing ? current.pets.map(item => item.id === pet.id ? pet : item) : [...current.pets, pet] }));
        return pet;
    },
    async "deletePet"(id: string): Promise<void> { await this.update(current => ({ ...current, "pets": current.pets.filter(pet => pet.id !== id) })); },
    "clearAll"(): Promise<void> {
        const operation = queue.then(async () => {
            const attachments = new Directory(Paths.document, "care-attachments");
            if (attachments.exists) attachments.delete();
            const communityAttachments = new Directory(Paths.document, "community-attachments");
            if (communityAttachments.exists) communityAttachments.delete();
            await AsyncStorage.clear();
            await session.clear();
        });
        queue = operation.catch(() => undefined);
        return operation;
    },
    async "get"(): Promise<CareData> {
        const operation = queue.then(async () => read(await storageKey()));
        queue = operation.catch(() => undefined);
        return operation;
    },
    "update"(change: (current: CareData) => CareData): Promise<CareData> {
        const operation = queue.then(async () => {
            const key = await storageKey();
            const next = change(await read(key));
            await AsyncStorage.setItem(key, JSON.stringify(next));
            return next;
        });
        queue = operation.catch(() => undefined);
        return operation;
    },
    async "clear"(): Promise<void> {
        await queue;
        const key = await storageKey();
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
            const current = JSON.parse(saved) as CareData;
            const localFiles = new Set([
                current.account.profile,
                ...current.pets.map(pet => pet.picture),
                ...current.inquiries.flatMap(inquiry => inquiry.attachments.map(file => file.url)),
                ...current.reports.flatMap(report => report.pictures),
                current.emergency?.picture,
            ]);
            const directory = new Directory(Paths.document, "care-attachments").uri.replace(/\/$/, "") + "/";
            for (const uri of localFiles) {
                if (uri?.startsWith(directory)) {
                    const file = new File(uri);
                    if (file.exists) file.delete();
                }
            }
        }
        await AsyncStorage.removeItem(key);
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
