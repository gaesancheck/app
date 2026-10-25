import axios, { AxiosRequestConfig, AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';
import type { NativeOAuthExchangeRequest, OAuthExchangeRequest } from './oauthConfig';

type RESTSuccess<D> = {
    "success": true,
} & RESTResponseData<D>;

type RESTFailed<D> = {
    "success": false
} & RESTResponseData<APIError>;

type RESTResponseData<D> = {
    "status": number,
    "headers": AxiosResponseHeaders | RawAxiosResponseHeaders,
    "options"?: AxiosRequestConfig,
    "data": D
};

type RESTResponse<S, F> = RESTSuccess<S> | RESTFailed<F>;

async function REST<S = any, F = any, D = any>(route: string, config?: AxiosRequestConfig<D>): Promise<RESTResponse<S, F>> {
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
    if (!baseUrl) {
        throw new Error("로그인 서버가 아직 설정되지 않았습니다.");
    }

    const url = new URL(baseUrl);
    if (
        (url.protocol !== "https:" && !(__DEV__ && url.protocol === "http:")) ||
        url.username || url.password || url.search || url.hash
    ) {
        throw new Error("로그인 서버 주소 설정을 확인해주세요.");
    }

    const r = await axios(route, {
        ...config,
        baseURL: baseUrl.replace(/\/+$/, ""),
        "validateStatus": () => true
    });

    if (Math.floor(r.status / 100) !== 2) {
        return {
            "success": false,
            "headers": r.headers,
            "status": r.status,
            "data": r.data
        };
    }

    return {
        "success": true,
        "headers": r.headers,
        "status": r.status,
        "data": r.data
    };
}

type POSTAPIAuthLogin = {
    "id": string,
    "password": string,
    "keepMeLoggedIn": boolean
};

type POSTAPIAuthFindID = {
    "email"?: string,
    "phoneNumber"?: string
};

type POSTAPIAuthFindPW = {
    "email": string;
};

export type APIAuthSession = {
    "access_token": string,
    "expires_in": number
};

export const APIAuth = {
    async login(data: POSTAPIAuthLogin): Promise<RESTResponse<APIAuthSession, APIError>> {
        // POST /v1/auth/login
        // Content-Type: application/json
        // body: POSTApiAuthLogin
        // status: 200
        await new Promise(resolve => setTimeout(resolve, 500));

        if (data.id !== "test" || data.password !== "test") return {
            "status": 401,
            "success": false,
            "headers": {},
            "data": {
                "status": 401,
                "message": "이메일 또는 비밀번호가 틀렸습니다."
            }
        };

        return {
            "status": 200,
            "success": true,
            "headers": {},
            "data": {
                "access_token": "access_token",
                "expires_in": data.keepMeLoggedIn ? -1 : 604800
            }
        };
    },
    async findId(data: POSTAPIAuthFindID): Promise<RESTResponse<null, APIError>> {
        // POST /v1/auth/findId
        // Content-Type: application/json
        // body: null
        // status: 204
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": null
        };
    },
    async findPw(data: POSTAPIAuthFindPW): Promise<RESTResponse<null, APIError>> {
        // POST /v1/auth/findPw
        // Content-Type: application/json
        // body: null
        // status: 200
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": null
        };
    },
    async authorizeGoogle(data: OAuthExchangeRequest): Promise<RESTResponse<APIAuthSession, APIError>> {
        return REST<APIAuthSession, APIError>("/v1/auth/oauth/google/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data,
            timeout: 15000,
        });
    },
    async authorizeNaver(data: NativeOAuthExchangeRequest): Promise<RESTResponse<APIAuthSession, APIError>> {
        return REST<APIAuthSession, APIError>("/v1/auth/oauth/naver/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data,
            timeout: 15000,
        });
    },
    async authorizeKakao(data: NativeOAuthExchangeRequest): Promise<RESTResponse<APIAuthSession, APIError>> {
        return REST<APIAuthSession, APIError>("/v1/auth/oauth/kakao/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data,
            timeout: 15000,
        });
    }
};
