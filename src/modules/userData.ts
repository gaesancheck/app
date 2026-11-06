import { api, USE_MOCK } from "./rest";
import session from "./session";
import { mockUserData } from "./userData.mock";
export type UserData = { "loggedIn": boolean; "walkRecords": WalkRecord[] };
export const SAVE_DEFAULT: UserData = { "loggedIn": false, "walkRecords": [] };
export const userData = {
    async "get"(): Promise<UserData> {
        if (USE_MOCK) return mockUserData.get();
        if (!(await session.get())) return { ...SAVE_DEFAULT, "walkRecords": [] };
        return { "loggedIn": true, "walkRecords": await api<WalkRecord[]>("/v1/walk-records") };
    },
    async "getRecord"(id: string): Promise<WalkRecord> {
        if (USE_MOCK) {
            const record = (await mockUserData.get()).walkRecords.find(item => item.id === id);
            if (!record) throw new Error("산책 기록을 찾을 수 없어요.");
            return record;
        }
        return api<WalkRecord>(`/v1/walk-records/${encodeURIComponent(id)}`);
    },
    async "saveRecord"(record: WalkRecord, existing = false): Promise<WalkRecord> {
        if (USE_MOCK) {
            const data = await mockUserData.get();
            await mockUserData.update("walkRecords", existing ? data.walkRecords.map(item => item.id === record.id ? record : item) : [...data.walkRecords, record]);
            return record;
        }
        const { id, ...data } = record;
        return api<WalkRecord>(existing ? `/v1/walk-records/${encodeURIComponent(id)}` : "/v1/walk-records", {
            "method": existing ? "PUT" : "POST", "data": data,
        });
    },
    async "deleteRecord"(id: string): Promise<void> {
        if (USE_MOCK) { const data = await mockUserData.get(); await mockUserData.update("walkRecords", data.walkRecords.filter(item => item.id !== id)); return; }
        await api(`/v1/walk-records/${encodeURIComponent(id)}`, { "method": "DELETE" });
    },
    async "set"(data: UserData): Promise<void> {
        if (USE_MOCK) await mockUserData.set(data);
        // Production login state belongs to SecureStore; records use explicit CRUD methods.
    },
    async "update"<K extends keyof UserData>(key: K, value: UserData[K]): Promise<void> {
        if (USE_MOCK) await mockUserData.update(key, value);
        else throw new Error("산책 기록은 개별 저장·삭제로 변경해주세요.");
    },
    async "clear"(): Promise<void> { await mockUserData.clear(); },
};
export default userData;
