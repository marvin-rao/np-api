import { getBToken, isTokenExpired } from "./utils";

// PATCH, because in fetch patch doesn't normalize to PATCH
// https://github.com/nodejs/node/issues/51336
export type RequestMethod = "post" | "PATCH" | "delete" | "GET";

export const appFetch = async ({
    method,
    url,
    body,
}: {
    body: any;
    method: RequestMethod;
    url: string;
}) => {
    const token = getBToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    const hasValidToken = token && !isTokenExpired(token);

    if (hasValidToken) {
        headers.Authorization = `Bearer ${token}`;
        console.log("Adding Authorization header");
    }

    const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
        credentials: hasValidToken ? "omit" : "include",
    });

    return response;
};