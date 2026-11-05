import { MapCoordinate } from "../../modules/kakao-map";

declare global {
    type APIError = {
        "status": number;
        "message": string;
    };

    // 매우 좋음, 좋음, 보통, 나쁨, 매우 나쁨
    type WalkRecordRate = 5 | 4 | 3 | 2 | 1;
    // 흐림, 구름 조금, 구름 많음, 맑음, 비, 천둥, 눈
    type WalkRecordWeather = "cloudy" | "partly_cloudy" | "mostly_cloudy" | "clear" | "rainy" | "thunder" | "snowy";

    interface WalkRecord {
        "id": string;
        "date": string;
        "rate": WalkRecordRate;
        "routes": MapCoordinate[];
        "duration": number;
        "distance": number;
        "destination": string;
        "picture"?: string;
        "weather"?: WalkRecordWeather;
        "content": string;
    }

    type EmergencyMapRoute = MapCoordinate[];

    type EmergencyRouteInfo = {
        "name": string;
        "coordinate": MapCoordinate;
        "count": number;
    };
}

export {};
