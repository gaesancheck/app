import { RESTResponse, REST } from ".";

export type APIMyInfo = {
    "account": {
        "id": string;
        "name": string;
        "profile"?: string;
        /** UNIX Timestamp in milliseconds */
        "registeredAt": number;
    };
    "petInfo": APIPetInfo;
};

type APIPetInfo = {
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

export const APIMy = {
    async "getMyInfo"(): Promise<RESTResponse<APIMyInfo, APIError>> {
        // GET /v1/me
        // status: 200 (APIMyInfo), 401 (unauthorized), and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 200,
            "success": true,
            "headers": {},
            "data": {
                "account": {
                    "id": "sample",
                    "name": "갱얼쥐",
                    "registeredAt": new Date().getTime(),
                },
                "petInfo": {
                    "name": "갱얼쥐",
                    "picture": "https://f.ny64.kr/photos/help.jpg",
                    "age": 5,
                    "birth": "20220607",
                    "diseases": "없음",
                    "gender": "female",
                    "type": "포메라니안",
                    "neutering": true,
                },
            },
        };
    },
    async "changeInfo"(data: PUTAPIMyInfo): Promise<RESTResponse<null, APIError>> {
        // PUT /v1/me
        // jsonBody: PUTAPIMyInfo
        // status: 204 (null), 401 (unauthorized), and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": null,
        };
    },
    async "changePetInfo"(data: PUTAPIPetInfo): Promise<RESTResponse<null, APIError>> {
        // PUT /v1/me/pet
        // jsonBody: PUTAPIPetInfo
        // status: 204 (null), 401 (unauthorized), and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": null,
        };
    },
    async "getFaQs"(): Promise<RESTResponse<APIFaQ[], APIError>> {
        // GET /v1/me/faqs
        // status: 200 (APIFaQ[]), 401 (unauthorized), and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 200,
            "success": true,
            "headers": {},
            "data": [
                {
                    "id": "1",
                    "name": "문의는 어디서 하나요?",
                    "answer":
                        "마이 > 문의하러가기 > 문의 페이지에서 문의를 작성할 수 있어요. 답변은 답변된 문의에서 확인해주세요.",
                },
                {
                    "id": "2",
                    "name": "산책 기록은 어디에서 확인하나요?",
                    "answer": "홈에서 날짜를 선택하거나 목록 아이콘을 눌러 산책 기록을 확인할 수 있어요.",
                },
                {
                    "id": "3",
                    "name": "반려견 정보는 어떻게 수정하나요?",
                    "answer": "마이 > 반려동물 정보에서 반려견을 선택해 정보를 수정하고 완료를 눌러주세요.",
                },
                {
                    "id": "4",
                    "name": "실종모드는 어떻게 사용하나요?",
                    "answer":
                        "긴급 탭에서 실종모드를 켜고 실종 날짜, 시각, 위치를 입력해주세요. 체크리스트와 제보를 함께 확인할 수 있어요.",
                },
                {
                    "id": "5",
                    "name": "실종된 반려견을 발견했어요.",
                    "answer": "긴급 탭의 실종동물 목록에서 제보하기를 눌러 목격 시각, 장소와 사진을 등록해주세요.",
                },
                {
                    "id": "6",
                    "name": "산책 경로가 기록되지 않아요.",
                    "answer":
                        "기기 설정에서 개산책의 위치 접근을 허용해주세요. 위치 신호가 약하면 기록이 늦어질 수 있어요.",
                },
                {
                    "id": "7",
                    "name": "회원 탈퇴는 어디에서 하나요?",
                    "answer": "마이 화면 아래의 계정 탈퇴를 눌러 진행할 수 있어요.",
                },
            ],
        };
    },
    async "deleteMyAccount"(): Promise<RESTResponse<null, APIError>> {
        // DELETE /v1/me
        // status: 204 (null), 400 (invalid request), and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": null,
        };
    },
    async "sendContact"(data: POSTAPIContact): Promise<RESTResponse<null, APIError>> {
        // POST /v1/me/contact
        // status: 204 (null), 400 (invalid request), and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": null,
        };
    },
};
