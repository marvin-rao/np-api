export const getBToken = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("b_token");
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

export const getHeaders = () => {
    const token = getBToken();
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};