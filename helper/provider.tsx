import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import {
  getBToken,
  getUrlBearerToken,
  getUrlRefreshToken,
  isTokenExpired,
  setBToken,
  setRefreshToken,
} from "./utils";

const AuthContext = createContext({ loginPageUrl: "", apiBaseUrl: "" });

export const useAuthData = () => {
  return useContext(AuthContext);
};

export type AuthProviderProps = {
  children: any;
  loginPageUrl: string;
  apiBaseUrl: string;
  ignoreWorkspace?: boolean;
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
  const { children, loginPageUrl, apiBaseUrl } = props;

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
        const cleanUrl = currentUrl.toString();
        if (window.location.href !== cleanUrl) {
          window.location.href = cleanUrl;
        }
      }, 100);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ loginPageUrl, apiBaseUrl }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export const useAuthSession = () => {
  const { apiBaseUrl } = useAuthData();
  const [loading, setLoading] = useState(false);

  const hasCookieSession = async () => {
    setLoading(true);
    const response = await fetch("https://newpaper.app/api/account/session", {
      method: "GET",
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    const data = result?.data;
    console.log("data", data);
    const bearer_token = data?.bearer_token;
    if (bearer_token) {
      setBToken({ bearer_token });
    }
    setLoading(false);
  };

  useEffect(() => {
    hasCookieSession();
  }, [apiBaseUrl]);

  const shouldLogin = () => {
    // First check for Cookies and their validity
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
    loading,
  };
};
