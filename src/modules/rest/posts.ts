import { RESTResponse } from ".";
import { communityData, CommunityComment, CommunityPost, PostFilter } from "../communityData";
export type APIPost = Omit<CommunityPost, "comments"> & { "comments": number };
export type APIPostDetails = CommunityPost;
export type APIPostComment = CommunityComment;
export type APIPostCategory = "popular" | "recent" | "missing" | "others";
async function response<T>(action: () => Promise<T>): Promise<RESTResponse<T, APIError>> {
    try {
        return { "status": 200, "headers": {}, "success": true, "data": await action() };
    } catch (e) {
        return {
            "status": 400,
            "headers": {},
            "success": false,
            "data": { "message": e instanceof Error ? e.message : "게시물을 처리하지 못했어요." } as APIError,
        };
    }
}
export const APIPosts = {
    "getPosts"(data: PostFilter = {}) {
        return response(async () =>
            (await communityData.listPosts(data)).map(p => ({ ...p, "comments": p.comments.length }))
        );
    },
    "writeNewPost"(data: {
        "title": string;
        "content": string;
        "wroteAt"?: number;
        "attachments": { "id"?: string; "url": string }[];
    }) {
        return response(() => communityData.writePost(data));
    },
    "heartPost"(data: { "id": string; "bookmark"?: boolean; "heart"?: boolean }) {
        return response(async () => {
            if (data.bookmark !== undefined) await communityData.toggleBookmark(data.id, data.bookmark);
            if (data.heart !== undefined) await communityData.toggleLike(data.id, data.heart);
            return null;
        });
    },
    "getPost"(id: string) {
        return response(async () => {
            const post = await communityData.getPost(id);
            if (!post) throw new Error("게시물을 찾을 수 없어요.");
            return post;
        });
    },
    "addComment"(id: string, content: string) {
        return response(() => communityData.addComment(id, content));
    },
    "deletePost"(id: string) {
        return response(() => communityData.deletePost(id));
    },
};
