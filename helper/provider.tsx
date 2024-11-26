import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";
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
    if (bearer_token) {
      setBToken({ bearer_token });
    }
    const refresh_token = getUrlRefreshToken();
    if (refresh_token) {
      setRefreshToken({ refresh_token });
    }
    setTimeout(() => {
      const rootPath = `${window.location.origin}/`;
      window.location.href = rootPath;
    }, 300);
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
