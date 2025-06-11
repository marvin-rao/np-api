import { useState } from "react";
import {
  AuthProvider,
  AuthProviderProps,
  useAuthSession,
} from "../../helper/provider";
import { useProjectId } from "../projects";
import { WorkspaceSelector } from "./WorkspaceSelector";

export const openWorkspace = ({ id }: { id: string }) => {
  window.location.href = `../../../../workspace/${id}/`;
};

export const NewPaperProvider = (props: AuthProviderProps) => {
  const { projectId } = useProjectId();
  const { shouldLogin } = useAuthSession();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <AuthProvider {...props}>
      {!props.requireAuth && !shouldLogin && !projectId && (
        <WorkspaceSelector
          open={isOpen}
          onSelect={(workspace) => {
            openWorkspace({ id: workspace.id });
            setIsOpen(false);
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
      {props.children}
    </AuthProvider>
  );
};
