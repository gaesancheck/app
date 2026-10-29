import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserData = {
    loggedIn: boolean;
    walkRecords: WalkRecord[];
};

const STORAGE_KEY = "userData";

export const SAVE_DEFAULT: UserData = {
    "loggedIn": false,
    "walkRecords": []
}

export const userData = {
    async get(): Promise<UserData> {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === null) return SAVE_DEFAULT;

        try {
            const data: unknown = JSON.parse(stored);
            return data as UserData;
        } catch {
            // Invalid saved data falls back to the logged-out state.
        }

        return SAVE_DEFAULT;
    },

    async set(data: UserData): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },
};

export default userData;
