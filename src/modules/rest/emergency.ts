import { RESTResponse, REST } from '.';

// -------------------
// 긴급 디자인 완성되면 수정
// -------------------

export type APIMissingPetInfo = {
    "name": string,
    "gender": "male" | "female",
    "age": number,
    "neutering": boolean,
    "lastPosition": string,
    "lastSeen": {
        "hours"?: number,
        "minutes"?: number
    },
    "specials": string,
    "missingSince": number,
    "picture": string
};


export const APIEmergency = {

}