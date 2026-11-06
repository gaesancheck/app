import { REST, USE_MOCK } from ".";
import type { CommunityComment, CommunityPost, PostFilter, PostSummary } from "../communityData";
import { mockPosts } from "./posts.mock";
export type APIPost = PostSummary;
export type APIPostDetails = CommunityPost;
export type APIPostComment = CommunityComment;
export type APIPostCategory = "popular" | "recent" | "missing" | "others";
const path = (id: string) => `/v1/posts/${encodeURIComponent(id)}`;
export const APIPosts = USE_MOCK ? mockPosts : {
    "getPosts": (data: PostFilter = {}) => REST<APIPost[]>("/v1/posts", { "params": data }),
    "getPost": (id: string) => REST<APIPostDetails>(path(id)),
    "writeNewPost": (data: { "title": string; "content": string; "wroteAt"?: number; "attachments": { "id"?: string; "url": string }[] }) => REST<APIPostDetails>("/v1/posts", { "method": "POST", "data": { "title": data.title, "content": data.content, "attachments": data.attachments } }),
    "heartPost": ({ id, ...data }: { "id": string; "bookmark"?: boolean; "heart"?: boolean }) => REST<null>(`${path(id)}/reactions`, { "method": "PUT", "data": data }),
    "addComment": (id: string, content: string) => REST<APIPostDetails>(`${path(id)}/comments`, { "method": "POST", "data": { "content": content } }),
    "deletePost": (id: string) => REST<null>(path(id), { "method": "DELETE" }),
};
