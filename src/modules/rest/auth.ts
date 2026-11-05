import { REST, type RESTResponse } from ".";
import type { NativeOAuthExchangeRequest, OAuthExchangeRequest } from "../oauthConfig";

export type APIAuthSession = {
    "access_token": string,
    "expires_in": number,
    "needs_onboarding"?: boolean
};

export const APIAuth = {
    async authorizeGoogle(data: OAuthExchangeRequest): Promise<RESTResponse<APIAuthSession, APIError>> {
        // POST /v1/auth/oauth/google/exchange
        // Content-Type: application/json
        // requestBody: OAuthExchangeRequest
        // status: 200 (APIAuthSession), 400 (invalid request), 401 (invalid/expired code or PKCE), 500 (server error)
        return REST<APIAuthSession, APIError>("/v1/auth/oauth/google/exchange", {
            "method": "POST",
            "headers": { "Content-Type": "application/json" },
            "data": data,
            "timeout": 15000,
        });
    },
    async authorizeApple(data: OAuthExchangeRequest): Promise<RESTResponse<APIAuthSession, APIError>> {
        // Backend contract: docs/APPLE_OAUTH_API.md. The server implementation is separate.
        return REST<APIAuthSession, APIError>("/v1/auth/oauth/apple/exchange", {
            "method": "POST",
            "headers": { "Content-Type": "application/json" },
            "data": data,
            "timeout": 15000,
        });
    },
    async authorizeNaver(data: NativeOAuthExchangeRequest): Promise<RESTResponse<APIAuthSession, APIError>> {
        // POST /v1/auth/oauth/naver/exchange
        // Content-Type: application/json
        // requestBody: NativeOAuthExchangeRequest
        // status: 200 (APIAuthSession), 400 (invalid request), 401 (provider token rejected), 500 (server error)
        return REST<APIAuthSession, APIError>("/v1/auth/oauth/naver/exchange", {
            "method": "POST",
            "headers": { "Content-Type": "application/json" },
            "data": data,
            "timeout": 15000,
        });
    },
    async authorizeKakao(data: NativeOAuthExchangeRequest): Promise<RESTResponse<APIAuthSession, APIError>> {
        // POST /v1/auth/oauth/kakao/exchange
        // Content-Type: application/json
        // requestBody: NativeOAuthExchangeRequest
        // status: 200 (APIAuthSession), 400 (invalid request), 401 (provider token rejected), 500 (server error)
        return REST<APIAuthSession, APIError>("/v1/auth/oauth/kakao/exchange", {
            "method": "POST",
            "headers": { "Content-Type": "application/json" },
            "data": data,
            "timeout": 15000,
        });
    },
};
