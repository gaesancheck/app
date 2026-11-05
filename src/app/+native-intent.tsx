/** Native social SDK callbacks are handled by the SDK, not by screen routing. */
export function redirectSystemPath({ path, initial }: { "path": string; "initial": boolean }): string {
    try {
        const url = new URL(path, "pawstep://app");
        const isKakaoCallback = /^kakao[0-9a-f]+:$/i.test(url.protocol) && url.hostname === "oauth";
        const isNaverCallback = url.protocol === "kr.pro203s.pawstep.naver:";
        if (isKakaoCallback || isNaverCallback) {
            // An empty path suppresses navigation while the pending SDK promise resolves.
            return initial ? "/login" : "";
        }
    } catch {
        // Leave unrelated links to Expo Router.
    }
    return path;
}
