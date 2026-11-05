export type OAuthProvider = "google" | "naver" | "kakao" | "apple";

// The backend redirects here with a short-lived, single-use APP code, never a JWT.
export const OAUTH_REDIRECT_URI = "pawstep://login";

export type OAuthExchangeRequest = {
    "code": string;
    "state": string;
    "code_verifier": string;
    "redirect_uri": string;
};

export type NativeOAuthExchangeRequest = {
    "access_token": string;
    "keep_me_logged_in": boolean;
};
