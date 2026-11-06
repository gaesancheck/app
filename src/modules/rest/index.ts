import axios, { AxiosRequestConfig, AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";

import session from "../session";
import { uploadPayload } from "../uploads";
import { router } from "expo-router";

export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export type RESTSuccess<D> = {
    "success": true;
} & RESTResponseData<D>;

export type RESTFailed<D> = {
    "success": false;
} & RESTResponseData<APIError>;

export type RESTResponseData<D> = {
    "status": number;
    "headers": AxiosResponseHeaders | RawAxiosResponseHeaders;
    "options"?: AxiosRequestConfig;
    "data": D;
};

export type RESTResponse<S, F> = RESTSuccess<S> | RESTFailed<F>;

export async function REST<S = any, F = any, D = any>(
    route: string,
    config?: AxiosRequestConfig<D>
): Promise<RESTResponse<S, F>> {
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
    if (!baseUrl) {
        throw new Error("API 서버가 아직 설정되지 않았습니다.");
    }

    const url = new URL(baseUrl);
    if (
        (url.protocol !== "https:" && !(__DEV__ && url.protocol === "http:")) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
    ) {
        throw new Error("API 서버 주소 설정을 확인해주세요.");
    }

    const authenticated = !route.startsWith("/v1/auth/");
    const current = authenticated ? await session.get() : null;
    const data = config?.data && route !== "/v1/uploads" && authenticated
        ? await uploadPayload(config.data, REST) : config?.data;
    const r = await axios(route, {
        "timeout": 45000,
        ...config,
        "data": data as D,
        "headers": { ...config?.headers, ...(current ? { "Authorization": `Bearer ${current.jwt}` } : {}) },
        "baseURL": baseUrl.replace(/\/+$/, ""),
        "validateStatus": () => true,
    }).catch((error: unknown) => {
        if (axios.isAxiosError(error) && !error.response) {
            throw new Error("API 서버에 연결할 수 없습니다. 네트워크와 API 서버 실행 상태를 확인해주세요.");
        }
        throw error;
    });

    if (r.status === 401 && authenticated && (await session.get())?.jwt === current?.jwt) {
        await session.clear();
        router.replace("/login");
    }
    if (Math.floor(r.status / 100) !== 2) {
        return {
            "success": false,
            "headers": r.headers,
            "status": r.status,
            "data": { "status": r.status, "message": r.data?.message ?? "요청을 처리하지 못했어요." },
        };
    }

    return {
        "success": true,
        "headers": r.headers,
        "status": r.status,
        "data": r.status === 204 ? null : r.data,
    };
}

export async function api<T>(route: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await REST<T>(route, config);
    if (!response.success) throw new Error(response.data.message);
    return response.data;
}
