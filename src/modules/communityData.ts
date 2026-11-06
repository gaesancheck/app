import AsyncStorage from "@react-native-async-storage/async-storage";
import { accountStorageKey } from "./accountStorage";
import { api, USE_MOCK } from "./rest";
import { mockCommunityData } from "./communityData.mock";
export type CommunityComment = {
    "id": string;
    "wroteBy": { "username": string; "profile"?: string };
    "content": string;
    "wroteAt": number;
    "mine"?: boolean;
};
export type CommunityPost = {
    "id": string;
    "wroteAt": number;
    "title": string;
    "content": string;
    "hearts": number;
    "liked": boolean;
    "bookmarked": boolean;
    "mine": boolean;
    "category": "others" | "missing";
    "attachments": { "id": string; "url": string }[];
    "comments": CommunityComment[];
    "missingPetId"?: string;
    "commentCount"?: number;
};
export type PostFilter = {
    "category"?: "popular" | "recent" | "missing" | "others";
    "query"?: string;
    "collection"?: "mine" | "bookmarked" | "liked" | "commented";
    "sort"?: "recent" | "oldest" | "likes";
    "nextFrom"?: string;
};
export type PostSummary = Omit<CommunityPost, "comments"> & { "comments": number };
const postPath = (id: string) => `/v1/posts/${encodeURIComponent(id)}`;
async function readHistory(): Promise<string[]> {
    const raw = await AsyncStorage.getItem(await accountStorageKey("community.search.v1"));
    return raw ? JSON.parse(raw) : [];
}
async function storeHistory(history: string[]): Promise<string[]> {
    await AsyncStorage.setItem(await accountStorageKey("community.search.v1"), JSON.stringify(history));
    return history;
}
export const communityData = USE_MOCK ? mockCommunityData : {
    async "listPosts"(filter: PostFilter = {}): Promise<CommunityPost[]> {
        const results: CommunityPost[] = [];
        let cursor = filter.nextFrom;
        do {
            const page = await api<PostSummary[]>("/v1/posts", { "params": { ...filter, "nextFrom": cursor } });
            results.push(...page.map(post => ({ ...post, "commentCount": post.comments, "comments": [] })));
            const next = page.at(-1)?.id;
            if (page.length < 20 || filter.nextFrom || next === cursor) break;
            cursor = next;
        } while (cursor);
        return results;
    },
    "getPost"(id: string): Promise<CommunityPost | null> { return api<CommunityPost>(postPath(id)); },
    "writePost"(input: { "title": string; "content": string; "attachments"?: { "url": string; "id"?: string }[] }): Promise<CommunityPost> {
        return api<CommunityPost>("/v1/posts", { "method": "POST", "data": input });
    },
    async "toggleLike"(id: string, enabled?: boolean): Promise<CommunityPost> {
        const current = await api<CommunityPost>(postPath(id));
        await api(`${postPath(id)}/reactions`, { "method": "PUT", "data": { "heart": enabled ?? !current.liked } });
        return api<CommunityPost>(postPath(id));
    },
    async "toggleBookmark"(id: string, enabled?: boolean): Promise<CommunityPost> {
        const current = await api<CommunityPost>(postPath(id));
        await api(`${postPath(id)}/reactions`, { "method": "PUT", "data": { "bookmark": enabled ?? !current.bookmarked } });
        return api<CommunityPost>(postPath(id));
    },
    "addComment"(id: string, content: string): Promise<CommunityPost> {
        return api<CommunityPost>(`${postPath(id)}/comments`, { "method": "POST", "data": { "content": content } });
    },
    async "deletePost"(id: string): Promise<void> { await api(postPath(id), { "method": "DELETE" }); },
    "getHistory": readHistory,
    async "saveSearch"(query: string) {
        const value = query.trim(), history = await readHistory();
        return storeHistory(value ? [value, ...history.filter(item => item !== value)].slice(0, 20) : history);
    },
    async "removeSearch"(query?: string) { return storeHistory(query === undefined ? [] : (await readHistory()).filter(item => item !== query)); },
    async "clear"(): Promise<void> { await AsyncStorage.removeItem(await accountStorageKey("community.search.v1")); },
};
