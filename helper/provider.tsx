import React, { createContext, useContext } from "react";
import { getBToken, isTokenExpired } from "./utils";

const AuthContext = createContext({ loginPageUrl: "", apiBaseUrl: "" });

export const useAuthData = () => {
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
