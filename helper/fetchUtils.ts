import { getBToken, isTokenExpired } from "./utils";

// PATCH, because in fetch patch doesn't normalize to PATCH
// https://github.com/nodejs/node/issues/51336
export type RequestMethod = "post" | "PATCH" | "delete" | "GET";

export const appFetch = async ({
    headers,
    method,
    url,
    body,
}: {
    body: any;
    method: RequestMethod;
    url: string;
    headers?: any;
}) => {
    const token = getBToken();
    const hasValidToken = token && !isTokenExpired(token);
    const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
        credentials: hasValidToken ? "omit" : "include",
    });

    return response;
};