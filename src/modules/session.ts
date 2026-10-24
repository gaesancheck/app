import * as SecureStore from "expo-secure-store";
import type { UserData } from "./userData";

export type SessionData = {
    userData: UserData;
    jwt: string;
};

const STORAGE_KEY = "session";

function isSessionData(value: unknown): value is SessionData {
    return (
        typeof value === "object" &&
        value !== null &&
        "jwt" in value &&
        typeof value.jwt === "string" &&
        value.jwt.trim().length > 0 &&
        "userData" in value &&
        typeof value.userData === "object" &&
        value.userData !== null &&
        "loggedIn" in value.userData &&
        typeof value.userData.loggedIn === "boolean"
    );
}

export const session = {
    async get(): Promise<SessionData | null> {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (stored === null) return null;

        try {
            const data: unknown = JSON.parse(stored);
            return isSessionData(data) ? data : null;
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
