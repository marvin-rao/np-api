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
  }, []);

  return (
    <AuthContext.Provider value={{ loginPageUrl, apiBaseUrl }}>
      {children}
    </AuthContext.Provider>
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
