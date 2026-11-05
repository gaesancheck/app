import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import { Image } from "react-native";
import session from "./session";
import { accountStorageKey } from "./accountStorage";

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
};
export type PostFilter = {
    "category"?: "popular" | "recent" | "missing" | "others";
    "query"?: string;
    "collection"?: "mine" | "bookmarked" | "liked" | "commented";
    "sort"?: "recent" | "oldest" | "likes";
    "nextFrom"?: string;
};
type Store = { "posts": CommunityPost[]; "history": string[] };
let queue: Promise<unknown> = Promise.resolve();
async function key() {
    return accountStorageKey("community.v1");
}

function seed(): Store {
    const picture = Image.resolveAssetSource(require("../../assets/images/community/bath.png"))!.uri;
    return {
        "history": [],
        "posts": [
            {
                "id": "community-bath",
                "title": "강아지가 이상해요",
                "content":
                    "강아지가 이상해요. 강아지가 목욕탕을 너무 좋아해요. 장난이 아니라 진짜 바나나우유 들고 아저씨마냥 목욕탕에서 힐링을 해요 ㅜㅜ 아니 심지어 저번에는 친구 강아지랑 둘이 탕에서 데이트를 즐기더라니까요?? 정말 애들은 빨리 큰다는 말이 맞나봐요..",
                "hearts": 12,
                "wroteAt": Date.now() - 86400000,
                "liked": false,
                "bookmarked": false,
                "mine": false,
                "category": "others",
                "attachments": [
                    { "id": "bath-1", "url": picture },
                    { "id": "bath-2", "url": picture },
                ],
                "comments": [
                    {
                        "id": "comment-1",
                        "wroteBy": { "username": "김갱얼쥐" },
                        "content": "아이고야",
                        "wroteAt": Date.now() - 3600000,
                    },
                    {
                        "id": "comment-2",
                        "wroteBy": { "username": "개산책ismylife" },
                        "content": "강아지를 사랑하세요",
                        "wroteAt": Date.now() - 1800000,
                    },
                ],
            },
            {
                "id": "community-market",
                "title": "오늘 방신시장에서",
                "content":
                    "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한 거 알고 계신 분 있으면 댓글로 알려주세요.",
                "hearts": 8,
                "wroteAt": Date.now() - 7200000,
                "liked": false,
                "bookmarked": false,
                "mine": false,
                "category": "others",
                "attachments": [],
                "comments": [],
            },
            {
                "id": "community-walk",
                "title": "산책하기 좋은 날이에요",
                "content":
                    "오늘은 바람도 시원하고 산책하기 좋네요. 여러분은 어떤 산책길을 좋아하시나요? 좋은 장소를 함께 나눠주세요!",
                "hearts": 5,
                "wroteAt": Date.now() - 3600000,
                "liked": false,
                "bookmarked": false,
                "mine": false,
                "category": "others",
                "attachments": [],
                "comments": [],
            },
        ],
    };
}
async function read(storageKey: string): Promise<Store> {
    const value = await AsyncStorage.getItem(storageKey);
    if (!value) return seed();
    const data = JSON.parse(value) as Store;
    if (!Array.isArray(data.posts) || !Array.isArray(data.history)) throw new Error("게시물을 불러오지 못했어요.");
    return data;
}
function change<T>(fn: (data: Store) => T | Promise<T>): Promise<T> {
    const op = queue.then(async () => {
        const storageKey = await key();
        const data = await read(storageKey);
        await syncMissing(data);
        const result = await fn(data);
        await AsyncStorage.setItem(storageKey, JSON.stringify(data));
        return result;
    });
    queue = op.catch(() => undefined);
    return op;
}
async function syncMissing(data: Store) {
    const { emergencyService } = await import("./emergencyService");
    const pets = await emergencyService.getMissingPets();
    const currentIdentity = await emergencyService.currentIdentity().catch(() => "");
    const ids = new Set(pets.map(p => p.id));
    data.posts = data.posts.filter(p => !p.missingPetId || ids.has(p.missingPetId));
    for (const pet of pets) {
        const previous = data.posts.find(p => p.missingPetId === pet.id);
        if (previous) {
            previous.title = `${pet.name}을(를) 찾고 있어요`;
            previous.content = [
                `${pet.ownerName}님의 반려동물 ${pet.name}을(를) 찾고 있어요.`,
                `마지막으로 본 장소: ${pet.lastPosition}`,
                `마지막으로 본 시간: ${pet.lastTime}`,
                pet.specials && `특징: ${pet.specials}`,
                "목격하셨다면 제보해주세요.",
            ]
                .filter(Boolean)
                .join("\n");
            previous.wroteAt = pet.missingSince;
            previous.attachments = pet.picture ? [{ "id": pet.id, "url": pet.picture }] : [];
            previous.mine = !!pet.ownerId && pet.ownerId === currentIdentity;
            continue;
        }
        data.posts.push({
            "id": `missing-${pet.id}`,
            "missingPetId": pet.id,
            "title": `${pet.name}을(를) 찾고 있어요`,
            "content": [
                `${pet.ownerName}님의 반려동물 ${pet.name}을(를) 찾고 있어요.`,
                `마지막으로 본 장소: ${pet.lastPosition}`,
                `마지막으로 본 시간: ${pet.lastTime}`,
                pet.specials && `특징: ${pet.specials}`,
                "목격하셨다면 제보해주세요.",
            ]
                .filter(Boolean)
                .join("\n"),
            "wroteAt": pet.missingSince,
            "hearts": 0,
            "liked": false,
            "bookmarked": false,
            "mine": !!pet.ownerId && pet.ownerId === currentIdentity,
            "category": "missing",
            "attachments": pet.picture ? [{ "id": pet.id, "url": pet.picture }] : [],
            "comments": [],
        });
    }
}
async function savePicture(url: string) {
    if (!url.startsWith("file:") && !url.startsWith("content:")) return url;
    const directory = new Directory(Paths.document, "community-attachments");
    directory.create({ "idempotent": true, "intermediates": true });
    const file = new File(
        directory,
        `${Crypto.randomUUID()}.${
            url
                .split(".")
                .pop()
                ?.split("?")[0]
                ?.match(/^(jpg|jpeg|png|webp|heic)$/i)?.[0] || "jpg"
        }`
    );
    new File(url).copy(file);
    return file.uri;
}
export const communityData = {
    "listPosts"(filter: PostFilter = {}): Promise<CommunityPost[]> {
        return change(data => {
            let posts = data.posts.filter(
                p =>
                    (!filter.query ||
                        `${p.title} ${p.content}`
                            .toLocaleLowerCase()
                            .includes(filter.query.trim().toLocaleLowerCase())) &&
                    (!filter.category ||
                        !["missing", "others"].includes(filter.category) ||
                        p.category === filter.category) &&
                    (!filter.collection ||
                        (filter.collection === "mine"
                            ? p.mine
                            : filter.collection === "bookmarked"
                              ? p.bookmarked
                              : filter.collection === "liked"
                                ? p.liked
                                : p.comments.some(c => c.mine)))
            );
            posts.sort((a, b) =>
                filter.sort === "oldest"
                    ? a.wroteAt - b.wroteAt
                    : filter.sort === "likes" || (!filter.sort && filter.category === "popular")
                      ? b.hearts - a.hearts || b.wroteAt - a.wroteAt
                      : b.wroteAt - a.wroteAt
            );
            if (filter.nextFrom) posts = posts.slice(posts.findIndex(p => p.id === filter.nextFrom) + 1);
            return posts;
        });
    },
    "getPost"(id: string) {
        return change(data => data.posts.find(p => p.id === id) ?? null);
    },
    "writePost"(input: { "title": string; "content": string; "attachments"?: { "url": string; "id"?: string }[] }) {
        return change(async data => {
            if (!input.title.trim() || !input.content.trim()) throw new Error("제목과 내용을 입력해주세요.");
            const attachments = await Promise.all(
                (input.attachments ?? [])
                    .slice(0, 10)
                    .map(async a => ({ "id": Crypto.randomUUID(), "url": await savePicture(a.url) }))
            );
            const post: CommunityPost = {
                "id": Crypto.randomUUID(),
                "title": input.title.trim(),
                "content": input.content.trim(),
                "wroteAt": Date.now(),
                "attachments": attachments,
                "comments": [],
                "hearts": 0,
                "liked": false,
                "bookmarked": false,
                "mine": true,
                "category": "others",
            };
            data.posts.unshift(post);
            return post;
        });
    },
    "toggleLike"(id: string, enabled?: boolean) {
        return change(data => {
            const p = data.posts.find(p => p.id === id);
            if (!p) throw new Error("게시물을 찾을 수 없어요.");
            const next = enabled ?? !p.liked;
            p.hearts = Math.max(0, p.hearts + (next === p.liked ? 0 : next ? 1 : -1));
            p.liked = next;
            return p;
        });
    },
    "toggleBookmark"(id: string, enabled?: boolean) {
        return change(data => {
            const p = data.posts.find(p => p.id === id);
            if (!p) throw new Error("게시물을 찾을 수 없어요.");
            p.bookmarked = enabled ?? !p.bookmarked;
            return p;
        });
    },
    "addComment"(id: string, content: string) {
        return change(data => {
            const p = data.posts.find(p => p.id === id);
            if (!p) throw new Error("게시물을 찾을 수 없어요.");
            if (!content.trim()) throw new Error("댓글을 입력해주세요.");
            p.comments.push({
                "id": Crypto.randomUUID(),
                "content": content.trim(),
                "wroteAt": Date.now(),
                "wroteBy": { "username": "나" },
                "mine": true,
            });
            return p;
        });
    },
    "deletePost"(id: string) {
        return change(data => {
            const post = data.posts.find(p => p.id === id);
            if (!post?.mine) throw new Error("내 게시물만 삭제할 수 있어요.");
            if (post.missingPetId) throw new Error("실종 게시물은 긴급 화면에서 실종 해제 후 삭제할 수 있어요.");
            data.posts = data.posts.filter(p => p.id !== id);
        });
    },
    "getHistory"() {
        return change(data => data.history);
    },
    "saveSearch"(query: string) {
        return change(data => {
            const value = query.trim();
            if (value) data.history = [value, ...data.history.filter(q => q !== value)].slice(0, 20);
            return data.history;
        });
    },
    "removeSearch"(query?: string) {
        return change(data => {
            data.history = query === undefined ? [] : data.history.filter(q => q !== query);
            return data.history;
        });
    },
    "publishMissingPet"(pet: {
        "id": string;
        "name": string;
        "gender"?: string;
        "age"?: number | string;
        "neutering"?: boolean | string;
        "lastPosition"?: string;
        "lastTime"?: string;
        "specials"?: string;
        "picture"?: string;
        "ownerName"?: string;
        "missingSince"?: number;
    }) {
        return change(data => {
            const existing = data.posts.find(p => p.missingPetId === pet.id);
            const post: CommunityPost = {
                "id": existing?.id ?? Crypto.randomUUID(),
                "title": `${pet.name}을(를) 찾고 있어요`,
                "content": [
                    `${pet.ownerName || "보호자"}님의 반려동물 ${pet.name}을(를) 찾고 있어요.`,
                    pet.gender && `성별: ${pet.gender}`,
                    pet.age !== undefined && `나이: ${pet.age}살`,
                    pet.lastPosition && `마지막으로 본 장소: ${pet.lastPosition}`,
                    pet.lastTime && `마지막으로 본 시간: ${pet.lastTime}`,
                    pet.specials && `특징: ${pet.specials}`,
                    "목격하셨다면 제보해주세요.",
                ]
                    .filter(Boolean)
                    .join("\n"),
                "wroteAt": pet.missingSince ?? Date.now(),
                "hearts": existing?.hearts ?? 0,
                "liked": existing?.liked ?? false,
                "bookmarked": existing?.bookmarked ?? false,
                "mine": true,
                "category": "missing",
                "missingPetId": pet.id,
                "attachments": pet.picture ? [{ "id": pet.id, "url": pet.picture }] : [],
                "comments": existing?.comments ?? [],
            };
            data.posts = [post, ...data.posts.filter(p => p.missingPetId !== pet.id)];
            return post;
        });
    },
    async "clear"() {
        const operation = queue.then(async () => {
            await AsyncStorage.removeItem(await key());
        });
        queue = operation.catch(() => undefined);
        return operation;
    },
    "removeMissingPet"(petId: string) {
        return change(data => {
            data.posts = data.posts.filter(p => p.missingPetId !== petId);
        });
    },
};
export const publishMissingPet = communityData.publishMissingPet;
export const removeMissingPet = communityData.removeMissingPet;
