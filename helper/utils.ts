import { useRefreshToken } from "../api";

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
    return localStorage.setItem(BearerTokenKey, bearer_token);
};

export const setRefreshToken = ({ refresh_token }: { refresh_token: string }) => {
    return localStorage.setItem(RefreshTokenKey, refresh_token);
};

// A Bearer in JWT
export const isTokenExpired = (token: string): boolean => {
    try {
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
            throw new Error("Invalid token");
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
        console.error("Error decoding token", error);
        return true; // Treat token as expired if there's an error decoding it
    }
};

export const useHeaders = () => {
    const { submit } = useRefreshToken();

    const getHeaders = async () => {
        const token = getBToken();
        if (!token) {
            console.log('did not find bearer_token',);
            return undefined;
        }
        if (isTokenExpired(token)) {
            const refresh_token = getRefreshToken();
            if (!refresh_token) {
                console.log('did not find refresh_token',);
                return undefined;
            }
            const result = await submit({ refresh_token });
            console.log('Got refresh token', result);
            const newBToken = result?.data?.newIdToken;
            if (newBToken) {
                setBToken({ bearer_token: newBToken ?? "" });
            }
            const newRefreshToken = result?.data?.newRefreshToken ?? "";
            if (newRefreshToken) {
                setRefreshToken({ refresh_token });
            }

            return {
                Authorization: `Bearer ${newBToken}`,
                "Content-Type": "application/json",
            };
        }

        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    return { getHeaders }
}

export function setQueryParam(key: string, value: string) {
    const url = new URL(window.location.href); // Get the current URL
    url.searchParams.set(key, value); // Set or update the parameter
    window.history.pushState({}, "", url); // Update the URL without reloading
}