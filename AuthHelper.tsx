// @ts-ignore
import React, { createContext, useContext, useEffect, useState } from "react";

// Provider
const AuthContext = createContext({ loginPageUrl: "", apiBaseUrl: "" });

const useAuthData = () => {
  return useContext(AuthContext);
};

type AuthProviderProps = {
  children: any;
  loginPageUrl: string;
  apiBaseUrl: string;
};

export const AuthProvider = (props: AuthProviderProps) => {
  const { children, loginPageUrl, apiBaseUrl } = props;
  return (
    <AuthContext.Provider value={{ loginPageUrl, apiBaseUrl }}>
      {children}
    </AuthContext.Provider>
  );
};

// End Provider

type FetchOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  queryString?: string;
};

type UseFetchWithTokenProps = {
  path: string;
  options: FetchOptions;
};

export const openLogin = ({ loginPageUrl }: { loginPageUrl: string }) => {
  const width = 500; // Popup width
  const height = 600; // Popup height

  // Get the center of the screen
  const left = window.screenX + (window.innerWidth - width) / 2;
  const top = window.screenY + (window.innerHeight - height) / 2;

  // Get the current domain as the redirect URL
  const redirectUrl = window.location.origin;

  // Construct the login URL with a redirect parameter and tokenType=b_token
  const loginUrl = `${loginPageUrl}?redirectUrl=${encodeURIComponent(
    redirectUrl
  )}&tokenType=b_token`;

  // Open the popup centered in the screen
  window.open(
    loginUrl,
    "_blank",
    `width=${width},height=${height},left=${left},top=${top}`
  );
};

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

export const useAuthSession = () => {
  const shouldLogin = () => {
    const token = getBToken();
    if (token) {
      if (!isTokenExpired(token)) {
        return false;
      }
    }
    return true;
  };
  return {
    shouldLogin: shouldLogin(),
  };
};

export const useGet = <T,>({ path, options = {} }: UseFetchWithTokenProps) => {
  const { apiBaseUrl } = useAuthData();
  const [data, setData] = useState<T>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const token = getBToken();

    try {
      const response = await fetch(
        apiBaseUrl + path + (options?.queryString ?? ""),
        {
          method: options.method || "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(options.body),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setData(result?.data ?? undefined);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [path]);

  return { data, loading, error, refetch: fetchData };
};

type UsePostProps = {
  path: string;
};

export const useRequest = ({
  path,
  method,
}: UsePostProps & { method: "post" | "patch" | "delete" }) => {
  const { apiBaseUrl } = useAuthData();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async (body: any, onSuccess: (data: any) => void) => {
    if (!apiBaseUrl) {
      alert("Dev:Provide apiBaseUrl in Auth Context");
      return;
    }
    setLoading(true);
    setError(null);

    const token = getBToken();

    try {
      const response = await fetch(apiBaseUrl + path, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      console.log("result", result);
      onSuccess(result?.data ?? undefined);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, submit };
};

export const usePost = ({ path }: UsePostProps) => {
  return useRequest({ path, method: "post" });
};

export const useDelete = ({ path }: UsePostProps) => {
  return useRequest({ path, method: "delete" });
};

export const usePatch = ({ path }: UsePostProps) => {
  return useRequest({ path, method: "patch" });
};

export const LoginButton = () => {
  const { loginPageUrl } = useAuthData();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column", // Stack the text and button vertically
        justifyContent: "center", // Center vertically
        alignItems: "center", // Center horizontally
        height: "220px", // Take up the full viewport height
        textAlign: "center", // Center the text inside the container
      }}
    >
      <p style={{ fontSize: "18px", marginBottom: "20px", color: "#333" }}>
        Login to continue.
      </p>

      <button
        onClick={() => {
          if (!loginPageUrl) {
            alert("Dev:Provide loginPageUrl in Auth Context");
            return;
          }
          openLogin({ loginPageUrl });
        }}
        style={{
          backgroundColor: "#3B77CB", // Green background
          color: "white", // White text
          padding: "12px 20px", // Padding for the button
          fontSize: "16px", // Font size for button text
          border: "none", // Remove button borders
          borderRadius: "8px", // Rounded corners
          cursor: "pointer", // Pointer cursor on hover
          transition: "background-color 0.3s ease", // Smooth transition for hover effect
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Add shadow for depth
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.backgroundColor = "darkblue")
        } // Darker green on hover
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3B77CB")} // Revert back to the original color
      >
        Login
      </button>
    </div>
  );
};
