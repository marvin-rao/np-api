import { useGet } from "../../helper/ApiRequestsBase";
import { useProjectId, useProjectRequest } from "../projects";
import { ObjectId } from "../types";

interface EntityHookOptions<TName extends string> {
  entityName: TName;
  path: string;
}

// Helper type to capitalize first letter
type Capitalize<S extends string> = S extends `${infer F}${infer R}`
  ? `${Uppercase<F>}${R}`
  : S;

// Create specific hook names based on entity name
type EntityHookNames<TName extends string> = {
  get: `use${Capitalize<TName>}s`;
  add: `useAdd${Capitalize<TName>}`;
  update: `useUpdate${Capitalize<TName>}`;
  delete: `useDelete${Capitalize<TName>}`;
};

// Type for the returned hooks object
type EntityHooks<TName extends string, T> = {
  [K in EntityHookNames<TName>[keyof EntityHookNames<TName>]]: K extends EntityHookNames<TName>["get"]
    ? () => ReturnType<typeof useGet<T[]>>
    : K extends EntityHookNames<TName>["delete"]
    ? () => ReturnType<typeof useProjectRequest<ObjectId>>
    : () => ReturnType<typeof useProjectRequest<T>>;
};

export function generateEntityHooks<TName extends string, T extends ObjectId>(
  options: EntityHookOptions<TName>
): EntityHooks<TName, T> {
  const { entityName, path } = options;

  const capitalizedName =
    entityName.charAt(0).toUpperCase() + entityName.slice(1);

  const useGetEntities = () => {
    const { projectId } = useProjectId();
    return useGet<T[]>({
      path,
      options: { queryString: `?projectId=${projectId}` },
    });
  };

  const useAddEntity = () => {
    return useProjectRequest<T>({ path, method: "post" });
  };

  const useUpdateEntity = () => {
    return useProjectRequest<T>({ path, method: "PATCH" });
  };

  const useDeleteEntity = () => {
    return useProjectRequest<ObjectId>({ path, method: "delete" });
  };

  return {
    [`use${capitalizedName}s`]: useGetEntities,
    [`useAdd${capitalizedName}`]: useAddEntity,
    [`useUpdate${capitalizedName}`]: useUpdateEntity,
    [`useDelete${capitalizedName}`]: useDeleteEntity,
  } as EntityHooks<TName, T>;
}
