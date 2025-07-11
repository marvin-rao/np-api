import { useGet } from "./helper/ApiRequestsBase";
import { useProjectGetBase } from "./np/projects";

type Avatar = {
  original?: string;
};

export interface ProjectUser {
  name: string;
  firstname: string;
  lastname: string;
  avatar?: Avatar;
  id: string;
  accountId?: string;
  role?: "admin" | "user";
}

export const useUsers = () => {
  return useProjectGetBase<ProjectUser[]>({ path: "users" });
};

export const useAccountProfile = () => {
  return useGet<{ name: string; avatar: Avatar; email: string }>({
    path: "account/profile",
    options: {},
  });
};

// export const useRefreshToken = () => {
//   const apiBaseUrl = "https://newpaper.app/api/";
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<Error | null>(null);

//   const submit = async (
//     { refresh_token }: { refresh_token: string },
//     onSuccess?: (data: SuccessResult) => void
//   ): Promise<SuccessResult | undefined> => {
//     if (!apiBaseUrl) {
//       alert("Dev:Provide apiBaseUrl in Auth Context");
//       return;
//     }

//     return apiRequest<{ refresh_token: string }, SuccessResult>({
//       url: "https://newpaper.app/api/account/refresh_token",
//       onSuccess: (data) => onSuccess?.(data),
//       body: { refresh_token },
//       onError: setError,
//       onLoadingChange: setLoading,
//       method: "post",
//       headers: {
//         Authorization: `Bearer ${getBToken()}`,
//         "Content-Type": "application/json",
//       },
//     });
//   };

//   return { submit, error, loading };
// };
