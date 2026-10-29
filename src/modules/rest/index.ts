import axios, { AxiosRequestConfig, AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';

export type RESTSuccess<D> = {
    "success": true,
} & RESTResponseData<D>;

export type RESTFailed<D> = {
    "success": false
} & RESTResponseData<APIError>;

export type RESTResponseData<D> = {
    "status": number,
    "headers": AxiosResponseHeaders | RawAxiosResponseHeaders,
    "options"?: AxiosRequestConfig,
    "data": D
};

export type RESTResponse<S, F> = RESTSuccess<S> | RESTFailed<F>;

export async function REST<S = any, F = any, D = any>(route: string, config?: AxiosRequestConfig<D>): Promise<RESTResponse<S, F>> {
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

