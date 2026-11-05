import dayjs from "dayjs";
import type { MissingPet } from "./careData";

// Design fixtures only. Replace with the emergency service when its API is available.
export const missingPetExamples: MissingPet[] = ["윤 솜", "김갱얼쥐", "복실이"].map((name, index) => ({
    "id": `design-example-${index}`,
    "name": name,
    "type": "비숑",
    "gender": "female",
    "age": 5,
    "birth": "",
    "neutering": true,
    "diseases": "",
    "picture": "",
    "specials": "귀여움, 간식을 매우매우 좋아함, 완전 이쁘게 생김 모델 수준",
    "missingSince": dayjs().startOf("day").subtract(4, "day").valueOf(),
    "lastPosition": "근린 공원",
    "lastTime": "6시 경",
    "ownerName": "보호자",
}));

export type ShelterPet = {
    "id": string;
    "shelter": string;
    "region": string;
    "district": string;
    "town": string;
    "type": string;
    "gender": string;
    "age": string;
    "size": string;
    "found": string;
    "specials": string;
};
export const shelterExamples: ShelterPet[] = [0, 1, 2].map(index => ({
    "id": `shelter-example-${index}`,
    "shelter": "해맑음 보호소",
    "region": "서울",
    "district": "강서구",
    "town": "방화동",
    "type": "비숑",
    "gender": "여자",
    "age": "5살 추정",
    "size": "소형견",
    "found": "신방화역",
    "specials": "하얀 털, 작은 체구",
}));

export const checklistGroups = [
    {
        "title": "실종 직후",
        "items": [
            "마지막 목격 장소 주변 수색",
            "골목·주차장 등 숨을 만한 곳 확인",
            "가족 및 지인에게 실종 사실 알리기",
            "익숙한 목소리로 강아지 부르기",
        ],
    },
    {
        "title": "실종 초기",
        "items": [
            "인근 동물보호센터에 실종 알리기",
            "주변 동물병원에 실종 알리기",
            "보호 중인 동물 조회",
            "주변 상점·관리사무소에 문의",
            "주변 CCTV 확인 요청",
            "동물등록 분실 신고",
        ],
    },
    {
        "title": "수색 진행 중",
        "items": [
            "새로운 목격 장소 주변 수색",
            "동물보호센터 보호 현황 재확인",
            "미수색 지역 확인",
            "실종 전단지 배포",
            "평소 산책 경로 재수색",
            "주변 주민에게 목격 여부 문의",
        ],
    },
];
