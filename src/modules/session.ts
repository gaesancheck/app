import * as SecureStore from "expo-secure-store";

export type SessionData = {
    jwt: string;
    expiresAt?: number;
};

const STORAGE_KEY = "session";

function isSessionData(value: unknown): value is SessionData {
    return (
        typeof value === "object" &&
        value !== null &&
        "jwt" in value &&
        typeof value.jwt === "string" &&
        value.jwt.trim().length > 0 &&
        (!("expiresAt" in value) ||
            (typeof value.expiresAt === "number" && Number.isFinite(value.expiresAt)))
    );
}

export const session = {
    async get(): Promise<SessionData | null> {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (stored === null) return null;

        try {
            const data: unknown = JSON.parse(stored);
            if (!isSessionData(data)) return null;
            if (data.expiresAt !== undefined && data.expiresAt <= Date.now()) return null;
            return data;
        } catch {
            return null;
        }
    },

    async set(data: SessionData): Promise<void> {
        if (!isSessionData(data)) {
            throw new Error("Invalid session data");
        }

        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(data));
    },

    async clear(): Promise<void> {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
    },
};

export default session;
