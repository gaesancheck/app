import { RESTResponse, REST } from "."

export type APIMyInfo = {
    "account": {
        "id": string,
        "name": string,
        "profile"?: string,
        /** UNIX Timestamp in milliseconds */
        "registeredAt": number
    },
    "petInfo": APIPetInfo
}

type APIPetInfo = {
    "name": string,
    "type": string,
    "gender": "female" | "male";
    "age": number,
    /** YYYYMMDD */
    "birth": string,
    "neutering": boolean,
    "diseases": string,
    "picture": string
};

export type APIFaQ = {
    "id": string,
    "name": string,
    "answer": string
};

type POSTAPIContact = {
    "contactType": string,
    "title": string,
    "content": string,
    "attachments": {
        "name": string,
        "url": string
    }[];
};

type PUTAPIMyInfo = Partial<{
    "id": string,
    "password": string,
    "picture": string
}>;

type PUTAPIPetInfo = Partial<APIPetInfo>;

export const APIMy = {
    async getMyInfo(): Promise<RESTResponse<APIMyInfo, APIError>> {
        // GET /v1/me
        // status: 200 (APIMyInfo), 401 (unauthorized), and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": {
                "account": {
                    "id": "sample",
                    "name": "갱얼쥐",
                    "registeredAt": new Date().getTime()
                },
                "petInfo": {
                    "name": "갱얼쥐",
                    "picture": "https://f.ny64.kr/photos/help.jpg",
                    "age": 5,
                    "birth": "20220607",
                    "diseases": "없음",
                    "gender": "female",
                    "type": "포메라니안",
                    "neutering": true
                }
            }
        };
    },
    async changeInfo(data: PUTAPIMyInfo): Promise<RESTResponse<null, APIError>> {
        // PUT /v1/me
        // jsonBody: PUTAPIMyInfo
        // status: 204 (null), 401 (unauthorized), and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": null
        };
    },
    async changePetInfo(data: PUTAPIPetInfo): Promise<RESTResponse<null, APIError>> {
        // PUT /v1/me/pet
        // jsonBody: PUTAPIPetInfo
        // status: 204 (null), 401 (unauthorized), and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": null
        };
    },
    async getFaQs(): Promise<RESTResponse<APIFaQ[], APIError>> {
        // GET /v1/me/faqs
        // status: 204 (null), 401 (unauthorized), and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": [
                {
                    "id": Math.random().toString(),
                    "name": "문의 어디서해요",
                    "answer": "치이카와 인어 섬 가셔서 섬 주민에게 도움 받으시면 됩니다."
                },
                {
                    "id": Math.random().toString(),
                    "name": "문의 어디서해요",
                    "answer": "치이카와 인어 섬 가셔서 섬 주민에게 도움 받으시면 됩니다."
                },
                {
                    "id": Math.random().toString(),
                    "name": "문의 어디서해요",
                    "answer": "치이카와 인어 섬 가셔서 섬 주민에게 도움 받으시면 됩니다."
                },
                {
                    "id": Math.random().toString(),
                    "name": "문의 어디서해요",
                    "answer": "치이카와 인어 섬 가셔서 섬 주민에게 도움 받으시면 됩니다."
                },
                {
                    "id": Math.random().toString(),
                    "name": "문의 어디서해요",
                    "answer": "치이카와 인어 섬 가셔서 섬 주민에게 도움 받으시면 됩니다."
                },
                {
                    "id": Math.random().toString(),
                    "name": "문의 어디서해요",
                    "answer": "치이카와 인어 섬 가셔서 섬 주민에게 도움 받으시면 됩니다."
                },
                {
                    "id": Math.random().toString(),
                    "name": "문의 어디서해요",
                    "answer": "치이카와 인어 섬 가셔서 섬 주민에게 도움 받으시면 됩니다."
                }
            ]
        };
    },
    async deleteMyAccount(): Promise<RESTResponse<null, APIError>> {
        // DELETE /v1/me
        // status: 204 (null), 400 (invalid request), and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": null
        };
    },
    async sendContact(data: POSTAPIContact): Promise<RESTResponse<null, APIError>> {
        // POST /v1/me/contact
        // status: 204 (null), 400 (invalid request), and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": null
        };
    }
};