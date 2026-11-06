import { REST, USE_MOCK } from ".";
import { mockMy } from "./my.mock";
export type APIMyInfo = {
    "account": {
        "id": string;
        "name": string;
        "profile"?: string;
        /** UNIX Timestamp in milliseconds */
        "registeredAt": number;
    };
    "petInfo": APIPetInfo | null;
};

export type APIPetInfo = {
    "name": string;
    "type": string;
    "gender": "female" | "male";
    "age": number;
    /** MM.DD; legacy records may contain YYYYMMDD. */
    "birth": string;
    "neutering": boolean;
    "diseases": string;
    "picture": string;
    "size"?: string;
    "walkDuration"?: string;
    "walkCondition"?: string;
};

export type APIFaQ = {
    "id": string;
    "name": string;
    "answer": string;
};

type POSTAPIContact = {
    "contactType": string;
    "title": string;
    "content": string;
    "attachments": {
        "name": string;
        "url": string;
    }[];
};

type PUTAPIMyInfo = Partial<{
    "id": string;
    "password": string;
    "picture": string;
    "name": string;
}>;

type PUTAPIPetInfo = Partial<APIPetInfo>;

export const APIMy = USE_MOCK ? mockMy : {
    "getMyInfo": () => REST<APIMyInfo>("/v1/me"),
    "changeInfo": (data: PUTAPIMyInfo) => REST<null>("/v1/me", { "method": "PUT", "data": { ...(data.name === undefined ? {} : { "name": data.name }), ...(data.picture === undefined ? {} : { "picture": data.picture }) } }),
    "changePetInfo": (data: PUTAPIPetInfo) => REST<null>("/v1/me/pet", { "method": "PUT", "data": data }),
    "getFaQs": () => REST<APIFaQ[]>("/v1/me/faqs"),
    "deleteMyAccount": () => REST<null>("/v1/me", { "method": "DELETE" }),
    "sendContact": (data: POSTAPIContact) => REST<null>("/v1/me/contact", { "method": "POST", "data": data }),
};
