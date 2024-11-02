import React, { useState } from "react";
import {
  AuthProvider,
  AuthProviderProps,
  useAuthSession,
} from "../../helper/provider";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { useProjectId } from "../projects";
import { setQueryParam } from "../../helper/utils";

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
