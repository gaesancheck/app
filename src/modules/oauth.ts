import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import { APIAuth } from "./rest/auth";
import { OAUTH_REDIRECT_URI, type OAuthProvider } from "./oauthConfig";
import session from "./session";
import userData from "./userData";
import { loginWithNativeProvider } from "../../modules/social-login";

let signingIn = false;

async function randomToken(): Promise<string> {
    const bytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

/** Naver/Kakao use native SDKs; Google keeps the server-mediated browser flow. */
export async function signInWithOAuth(
    provider: OAuthProvider,
    keepMeLoggedIn: boolean,
): Promise<"success" | "cancelled"> {
    if (signingIn) throw new Error("이미 로그인이 진행 중입니다.");
    signingIn = true;

    try {
        let response: Awaited<ReturnType<typeof APIAuth.authorizeGoogle>>;
        if (provider === "naver" || provider === "kakao") {
            const result = await loginWithNativeProvider(provider);
            if (result.status === "cancelled") return "cancelled";
            if (!result.accessToken || result.expiresAt <= Date.now()) {
                throw new Error("유효한 소셜 로그인 토큰을 받지 못했습니다.");
            }
            // Provider tokens are not app sessions. The backend verifies them before issuing JWTs.
            const request = { access_token: result.accessToken, keep_me_logged_in: keepMeLoggedIn };
            response = provider === "naver"
                ? await APIAuth.authorizeNaver(request)
                : await APIAuth.authorizeKakao(request);
        } else {
            // Validate configuration before opening the browser.
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
            const authorizeUrl = new URL(`${baseUrl.replace(/\/+$/, "")}/v1/auth/oauth/${provider}/authorize`);
            const [state, verifier] = await Promise.all([randomToken(), randomToken()]);
            const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier, {
                encoding: Crypto.CryptoEncoding.BASE64,
            });
            const challenge = digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

            authorizeUrl.searchParams.set("redirect_uri", OAUTH_REDIRECT_URI);
            authorizeUrl.searchParams.set("state", state);
            authorizeUrl.searchParams.set("code_challenge", challenge);
            authorizeUrl.searchParams.set("code_challenge_method", "S256");
            authorizeUrl.searchParams.set("keep_me_logged_in", String(keepMeLoggedIn));

            const result = await WebBrowser.openAuthSessionAsync(authorizeUrl.toString(), OAUTH_REDIRECT_URI);
            if (result.type === "cancel" || result.type === "dismiss") return "cancelled";
            if (result.type !== "success") throw new Error("로그인 창을 열지 못했습니다. 다시 시도해주세요.");

            const callback = new URL(result.url);
            const expected = new URL(OAUTH_REDIRECT_URI);
            if (
                callback.protocol !== expected.protocol || callback.host !== expected.host ||
                callback.pathname !== expected.pathname || callback.username || callback.password ||
                callback.hash || callback.searchParams.getAll("state").length !== 1 ||
                callback.searchParams.get("state") !== state
            ) {
                throw new Error("로그인 요청을 확인할 수 없습니다. 다시 시도해주세요.");
            }
            if (callback.searchParams.get("error") === "access_denied") return "cancelled";
            if (callback.searchParams.has("error")) throw new Error("소셜 인증에 실패했습니다. 다시 시도해주세요.");

            const code = callback.searchParams.get("code");
            if (!code || callback.searchParams.getAll("code").length !== 1) {
                throw new Error("로그인 인증 코드가 없습니다.");
            }

            response = await APIAuth.authorizeGoogle({
                code,
                state,
                code_verifier: verifier,
                redirect_uri: OAUTH_REDIRECT_URI,
            });
        }
        if (!response.success) throw new Error("로그인 서버 인증에 실패했습니다. 다시 시도해주세요.");

        const data = response.data;
        if (
            !data || typeof data.access_token !== "string" || !data.access_token.trim() ||
            typeof data.expires_in !== "number" || !Number.isFinite(data.expires_in) ||
            (data.expires_in <= 0 && data.expires_in !== -1)
        ) {
            throw new Error("로그인 서버의 응답 형식이 올바르지 않습니다.");
        }

        const [previousSession, savedUser] = await Promise.all([session.get(), userData.get()]);
        await session.set({
            jwt: data.access_token,
            ...(data.expires_in === -1 ? {} : { expiresAt: Date.now() + data.expires_in * 1000 }),
        });
        try {
            await userData.set({ ...savedUser, loggedIn: true });
        } catch (error) {
            if (previousSession) await session.set(previousSession);
            else await session.clear();
            throw error;
        }
        return "success";
    } finally {
        signingIn = false;
    }
}
