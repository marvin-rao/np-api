
const BearerTokenKey = "BearerTokenKey1"
const RefreshTokenKey = "RefreshTokenKey1"

export const getUrlBearerToken = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("bearer_token");
};

export const getUrlRefreshToken = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("refresh_token");
};

export const getBToken = () => {
    return localStorage.getItem(BearerTokenKey);
};

export const getRefreshToken = () => {
    return localStorage.getItem(RefreshTokenKey);
};

export const setBToken = ({ bearer_token }: { bearer_token: string }) => {
    localStorage.setItem(BearerTokenKey, bearer_token);
};

export const setRefreshToken = ({ refresh_token }: { refresh_token: string }) => {
    localStorage.setItem(RefreshTokenKey, refresh_token);
};

export const logout = () => {
    localStorage.setItem(BearerTokenKey, undefined as unknown as string);
    localStorage.setItem(RefreshTokenKey, undefined as unknown as string);
};

// A Bearer in JWT
export const isTokenExpired = (token: string): boolean => {
    try {
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
            console.log("Invalid token");
            return true; // Treat token as expired if it doesn't have 3 parts
        }

        // Decode the payload of the JWT, which is the second part (base64url encoded)
        const payload = JSON.parse(atob(tokenParts[1]));

        // Check if the token has an expiration time (`exp`)
        if (!payload.exp) {
            return true; // Treat token as expired if no `exp` field is present
        }

        // Convert current time and `exp` to seconds and compare
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime > payload.exp;
    } catch (error) {
        console.log("Error decoding token", error);
        return true; // Treat token as expired if there's an error decoding it
    }
};

export const useHeaders = () => {

    const getHeaders = async (): Promise<Record<string, string>> => {
        const token = getBToken();
        if (!token || isTokenExpired(token)) {
            console.log('did not find bearer_token',);
            return {
                "Content-Type": "application/json",
            };
        }

        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        return headers;
    };

    return { getHeaders }
}

export function setQueryParam(key: string, value: string) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);

    window.history.pushState({}, "", url);

    // Dispatch a popstate event to inform React Router of the URL change
    window.dispatchEvent(new PopStateEvent("popstate"));
}