import { RESTResponse, REST } from '.';
import type { NativeOAuthExchangeRequest, OAuthExchangeRequest } from '../oauthConfig';

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

type POSTAPISignup = {
    "name": string,
    "telNo": string,
    "id": string,
    "password": string
};

export const APIAuth = {
    async login(data: POSTAPIAuthLogin): Promise<RESTResponse<APIAuthSession, APIError>> {
        // POST /v1/auth/login
        // Content-Type: application/json
        // requestBody: POSTAPIAuthLogin
        // status: 200 (APIAuthSession), 401 (invalid credentials)
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
        // requestBody: POSTAPIAuthFindID
        // status: 204 (no content)
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
        // requestBody: POSTAPIAuthFindPW
        // status: 204 (no content)
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            "status": 204,
            "success": true,
            "headers": {},
            "data": null
        };
    },
    async authorizeGoogle(data: OAuthExchangeRequest): Promise<RESTResponse<APIAuthSession, APIError>> {
        // POST /v1/auth/oauth/google/exchange
        // Content-Type: application/json
        // requestBody: OAuthExchangeRequest
        // status: 200 (APIAuthSession), 400 (invalid request), 401 (invalid/expired code or PKCE), 500 (server error)
        return REST<APIAuthSession, APIError>("/v1/auth/oauth/google/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data,
            timeout: 15000,
        });
    },
    async authorizeNaver(data: NativeOAuthExchangeRequest): Promise<RESTResponse<APIAuthSession, APIError>> {
        // POST /v1/auth/oauth/naver/exchange
        // Content-Type: application/json
        // requestBody: NativeOAuthExchangeRequest
        // status: 200 (APIAuthSession), 400 (invalid request), 401 (provider token rejected), 500 (server error)
        return REST<APIAuthSession, APIError>("/v1/auth/oauth/naver/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data,
            timeout: 15000,
        });
    },
    async authorizeKakao(data: NativeOAuthExchangeRequest): Promise<RESTResponse<APIAuthSession, APIError>> {
        // POST /v1/auth/oauth/kakao/exchange
        // Content-Type: application/json
        // requestBody: NativeOAuthExchangeRequest
        // status: 200 (APIAuthSession), 400 (invalid request), 401 (provider token rejected), 500 (server error)
        return REST<APIAuthSession, APIError>("/v1/auth/oauth/kakao/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data,
            timeout: 15000,
        });
    },
    async signUp(data: POSTAPISignup): Promise<RESTResponse<APIAuthSession, APIError>> {
        // POST /v1/auth/signup
        // Content-Type: application/json
        // requestBody: POSTAPISignup
        // status: 200 (APIAuthSession), 400 (invalid request), and more

        return {
            "status": 200,
            "success": true,
            "headers": {},
            "data": {
                "access_token": "access_token",
                "expires_in": 604800
            }
        };
    }
};
