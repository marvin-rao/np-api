import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getBToken,
  getUrlBearerToken,
  getUrlRefreshToken,
  isTokenExpired,
  setBToken,
  setRefreshToken,
} from "./utils";

const AUTH_RETURN_PATH_KEY = "np_auth_return_path";

export { AUTH_RETURN_PATH_KEY };

const AuthContext = createContext({
  loginPageUrl: "",
  apiBaseUrl: "",
  callerProduct: "",
});

export const useAuthData = () => {
  return useContext(AuthContext);
};

export type AuthProviderProps = {
  children: any;
  loginPageUrl: string;
  apiBaseUrl: string;
  ignoreWorkspace?: boolean;
  callerProduct: "recruit" | "career" | "filesapp";
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: "always",
    },
  },
});

export const AuthProvider = (props: AuthProviderProps) => {
  const { children, loginPageUrl, apiBaseUrl, callerProduct } = props;

  useEffect(() => {
    const bearer_token = getUrlBearerToken();
    const refresh_token = getUrlRefreshToken();
    if (bearer_token && refresh_token) {
      setBToken({ bearer_token });
      setRefreshToken({ refresh_token });

      setTimeout(() => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("bearer_token");
        currentUrl.searchParams.delete("refresh_token");

        // Check if there's a stored return path and use it
        const storedPath = sessionStorage.getItem(AUTH_RETURN_PATH_KEY);
        let cleanUrl = currentUrl.toString();

        if (storedPath) {
          const baseUrl = currentUrl.origin;
          cleanUrl = baseUrl + storedPath;
          sessionStorage.removeItem(AUTH_RETURN_PATH_KEY); // Clean up
        }

        if (window.location.href !== cleanUrl) {
          window.location.href = cleanUrl;
        }
      }, 100);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ loginPageUrl, apiBaseUrl, callerProduct }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export const useAuthSession = () => {
  const { apiBaseUrl } = useAuthData();
  const [loading, setLoading] = useState(false);
  const [cookieIsPresent, setCookieIsPresent] = useState<boolean>(false);

  const hasCookieSession = async () => {
    setLoading(true);
    const response = await fetch("https://newpaper.app/api/account/session", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error(`Error: ${response.status}`);
    }

    setCookieIsPresent(true);
    setLoading(false);
  };

  useEffect(() => {
    hasCookieSession();
  }, [apiBaseUrl]);

  const shouldLogin = useMemo(() => {
    if (cookieIsPresent) {
      return false;
    }
    const token = getBToken();
    if (token) {
      if (!isTokenExpired(token)) {
        return false;
      }
    }
    return true;
  }, [cookieIsPresent]);

  return { shouldLogin, loading };
};
