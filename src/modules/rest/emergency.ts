import { emergencyService } from "../emergencyService";

export type APIMissingPetInfo = {
    "name": string;
    "gender": "male" | "female";
    "age": number;
    "neutering": boolean;
    "lastPosition": string;
    "lastTime": string;
    "specials": string;
    "missingSince": number;
    "picture": string;
};

export const APIEmergency = emergencyService;
