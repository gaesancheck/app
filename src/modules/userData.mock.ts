import AsyncStorage from "@react-native-async-storage/async-storage";
import { accountStorageKey } from "./accountStorage";

export type UserData = {
    "loggedIn": boolean;
    "walkRecords": WalkRecord[];
};
const STORAGE_KEY = "userData";
export const SAVE_DEFAULT: UserData = { "loggedIn": false, "walkRecords": [] };

export const mockUserData = {
    async "get"(): Promise<UserData> {
        const key = await accountStorageKey(STORAGE_KEY);
        let stored = await AsyncStorage.getItem(key);
        if (stored === null && !key.endsWith(".guest")) {
            const legacy = await AsyncStorage.getItem(STORAGE_KEY);
            if (legacy) {
                try {
                    const data = JSON.parse(legacy) as UserData;
                    if (data.loggedIn && Array.isArray(data.walkRecords)) {
                        stored = legacy;
                        await AsyncStorage.setItem(key, legacy);
                    }
                } catch {
                    /* Ignore invalid old data. */
                }
                await AsyncStorage.removeItem(STORAGE_KEY);
            }
        }
        if (stored !== null) {
            try {
                const data = JSON.parse(stored) as UserData;
                if (typeof data.loggedIn === "boolean" && Array.isArray(data.walkRecords)) return data;
            } catch {
                /* Invalid saved data falls back to an empty account. */
            }
        }
        return { ...SAVE_DEFAULT, "walkRecords": [] };
    },
    async "set"(data: UserData): Promise<void> {
        await AsyncStorage.setItem(await accountStorageKey(STORAGE_KEY), JSON.stringify(data));
    },
    async "update"<K extends keyof UserData>(key: K, value: UserData[K]): Promise<void> {
        await this.set({ ...(await this.get()), [key]: value });
    },
    async "clear"(): Promise<void> {
        await AsyncStorage.removeItem(await accountStorageKey(STORAGE_KEY));
    },
};
export default mockUserData;
