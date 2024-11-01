import React, { useState } from "react";
import {
  AuthProvider,
  AuthProviderProps,
  useAuthSession,
} from "../../helper/provider";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { useProjectId } from "../projects";

function setQueryParam(key: string, value: string) {
  const url = new URL(window.location.href); // Get the current URL
  url.searchParams.set(key, value); // Set or update the parameter
  window.history.pushState({}, "", url); // Update the URL without reloading
}

export const NewPaperProvider = (props: AuthProviderProps) => {
  const { projectId } = useProjectId();
  const { shouldLogin } = useAuthSession();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <AuthProvider {...props}>
      {!shouldLogin && !projectId && (
        <WorkspaceSelector
          open={isOpen}
          demoMode={false}
          onSelect={(workspace) => {
            setQueryParam("projectId", workspace.id);
            setIsOpen(false);
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
      {props.children}
    </AuthProvider>
  );
};
