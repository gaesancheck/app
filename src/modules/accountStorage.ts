import * as Crypto from "expo-crypto";
import session from "./session";

/** Storage scoping only; reading these claims does not validate a token. */
export async function getAccountIdentity(): Promise<string> {
    const current = await session.get();
    if (!current) return "guest";
    let identity = current.jwt;
    try {
        const encoded = current.jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const bytes = atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "="));
        const claims = JSON.parse(
            decodeURIComponent(
                Array.from(bytes, byte => `%${byte.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")
            )
        );
        if (typeof claims.sub === "string" && claims.sub)
            identity = JSON.stringify([typeof claims.iss === "string" ? claims.iss : "", claims.sub]);
    } catch {
        /* Opaque tokens are scoped by their hash. */
    }
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, identity);
}

export async function accountStorageKey(prefix: string): Promise<string> {
    return `${prefix}.${await getAccountIdentity()}`;
}
