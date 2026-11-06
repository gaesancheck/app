import { File } from "expo-file-system";
import type { REST } from "./rest";

export type UploadedFile = { "id": string; "name": string; "url": string };
const types: Record<string, string> = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp",
    "gif": "image/gif", "heic": "image/heic", "pdf": "application/pdf",
};
export async function uploadFile(uri: string, name: string | undefined, request: typeof REST): Promise<UploadedFile> {
    const file = new File(uri);
    const filename = name ?? file.name;
    const extension = filename.split(".").pop()?.toLowerCase() ?? "";
    const type = types[extension];
    if (!type) throw new Error("jpg, png, webp, gif, heic, pdf 파일만 첨부할 수 있어요.");
    if (file.size > 10 * 1024 * 1024) throw new Error("첨부 파일은 10MB 이하여야 해요.");
    const form = new FormData();
    // React Native multipart accepts a device URI descriptor and streams its bytes.
    form.append("file", { "uri": uri, "name": filename, "type": type } as unknown as Blob);
    const response = await request<UploadedFile>("/v1/uploads", {
        "method": "POST", "data": form, "headers": { "Content-Type": "multipart/form-data" }, "timeout": 45000,
    });
    if (!response.success) throw new Error(response.data.message);
    return response.data;
}

/** Resolve device files before any JSON mutation; local URIs never reach persisted server data. */
export async function uploadPayload(value: unknown, request: typeof REST): Promise<unknown> {
    if (Array.isArray(value)) return Promise.all(value.map(item => uploadPayload(item, request)));
    if (value && typeof value === "object") {
        const object = value as Record<string, unknown>;
        if (typeof object.url === "string" && /^(file|content|ph):\/\//.test(object.url)) {
            const uploaded = await uploadFile(object.url, typeof object.name === "string" ? object.name : undefined, request);
            return { ...object, "url": uploaded.url };
        }
        return Object.fromEntries(await Promise.all(Object.entries(object).map(async ([key, item]) => [key, await uploadPayload(item, request)])));
    }
    if (typeof value === "string" && /^(file|content|ph):\/\//.test(value)) return (await uploadFile(value, undefined, request)).url;
    return value;
}
