import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserData = {
    loggedIn: boolean;
};

const STORAGE_KEY = "userData";

export const userData = {
    async get(): Promise<UserData> {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === null) return { loggedIn: false };

        try {
            const data: unknown = JSON.parse(stored);
            if (
                typeof data === "object" &&
                data !== null &&
                "loggedIn" in data &&
                typeof data.loggedIn === "boolean"
            ) {
                return { loggedIn: data.loggedIn };
            }
        } catch {
            // Invalid saved data falls back to the logged-out state.
        }

        return { loggedIn: false };
    },

    async set(data: UserData): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },
};

export default userData;
