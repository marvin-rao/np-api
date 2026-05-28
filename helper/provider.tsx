import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
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
  onSessionExpired: () => {},
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
  onSessionExpired: () => void;
};

const ONE_DAY = 1000 * 60 * 60 * 24;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Treat data as fresh for 24h — don't refetch on every mount.
      staleTime: ONE_DAY,
      // Keep evicted (unmounted) queries in cache for 7d. Required for the
      // persister to have anything to write between sessions, since the
      // default 5min gcTime drops queries before they ever get persisted.
      gcTime: ONE_DAY * 7,
      // Serve cached data when offline; only mark as "paused" once back
      // online does react-query attempt a network round trip.
      networkMode: "offlineFirst",
      refetchOnWindowFocus: "always",
      refetchOnReconnect: "always",
    },
    mutations: {
      // Queue mutations while offline; auto-fire on reconnect.
      networkMode: "offlineFirst",
    },
  },
});

// IndexedDB-backed persister. localStorage caps at ~5MB which the Files App
// (file lists + thumbnails metadata) blows past quickly, so we go straight to
// IDB via idb-keyval.
const createPersister = (callerProduct: string) =>
  createAsyncStoragePersister({
    storage: {
      getItem: (key) => idbGet<string>(key).then((v) => v ?? null),
      setItem: (key, value) => idbSet(key, value),
      removeItem: (key) => idbDel(key),
    },
    key: `np-rq-cache-${callerProduct}`,
    throttleTime: 1000,
  });

export const AuthProvider = (props: AuthProviderProps) => {
  const {
    children,
    loginPageUrl,
    apiBaseUrl,
    callerProduct,
    onSessionExpired,
  } = props;

  useEffect(() => {
    const bearer_token = getUrlBearerToken();
    const refresh_token = getUrlRefreshToken();
    // Embedded SpaceOS apps only get `b_token` injected (no refresh token,
    // since the parent shell handles refresh). Accept the bearer alone in
    // that case so we don't fall through to the (third-party-blocked)
    // cookie session check and flash the login UI.
    if (bearer_token) {
      setBToken({ bearer_token });
      if (refresh_token) {
        setRefreshToken({ refresh_token });
      }

      setTimeout(() => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("bearer_token");
        currentUrl.searchParams.delete("b_token");
        currentUrl.searchParams.delete("refresh_token");
        currentUrl.searchParams.delete("c_token");

        // Check if there's a stored return path and use it
        const storedPath = sessionStorage.getItem(AUTH_RETURN_PATH_KEY);
        let cleanUrl = currentUrl.toString();

        console.log("ReturnUrl", storedPath);

        if (storedPath) {
          const baseUrl = currentUrl.origin;
          cleanUrl = baseUrl + storedPath;
          sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);
          window.location.href = cleanUrl;
          return;
        }

        if (window.location.href !== cleanUrl) {
          window.location.href = cleanUrl;
        }
      }, 100);
    }
  }, []);

  const persister = useMemo(() => createPersister(callerProduct), [callerProduct]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // Persisted entries older than 7d are tossed on rehydrate.
        maxAge: ONE_DAY * 7,
        // Bump this string (e.g. on schema changes) to invalidate every
        // persisted cache for this app.
        buster: "v1",
        dehydrateOptions: {
          // OPT-IN persistence: only queries that explicitly set
          //   meta: { persist: true }
          // are written to disk. Everything else stays in-memory only.
          // This keeps signed URLs, auth payloads, and other volatile
          // responses out of long-term storage by default.
          shouldDehydrateQuery: (query) => {
            const persist =
              (query.meta as { persist?: boolean } | undefined)?.persist === true;
            return query.state.status === "success" && persist;
          },
        },
      }}
    >
      <AuthContext.Provider
        value={{ loginPageUrl, apiBaseUrl, callerProduct, onSessionExpired }}
      >
        {children}
      </AuthContext.Provider>
    </PersistQueryClientProvider>
  );
};

export const useAuthSession = () => {
  const { apiBaseUrl } = useAuthData();
  // Start as `true` so consumers can render a spinner on the very first
  // render — before the session fetch effect has had a chance to run.
  // Otherwise there's a one-frame flash of the unauthenticated UI.
  const [loading, setLoading] = useState(true);
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
