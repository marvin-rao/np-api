import { useState } from "react";
import {
  AuthProvider,
  AuthProviderProps,
  useAuthSession,
} from "../../helper/provider";
import { useProjectId } from "../projects";
import { OsDesignProvider } from "../design/OsDesignContext";
import { WorkspaceSelector } from "./workspace/WorkspaceSelector";

export const openWorkspace = ({ id }: { id: string }) => {
  window.location.href = `../../../../workspace/${id}/`;
};

export interface NewPaperProviderProps extends AuthProviderProps {
  /** Opt into the macOS / iPad-style flush controls in shared chrome. */
  osDesign?: boolean;
}

export const NewPaperProvider = (props: NewPaperProviderProps) => {
  const { projectId } = useProjectId();
  const { shouldLogin } = useAuthSession();
  const [isOpen, setIsOpen] = useState(true);
  const { osDesign = false, ...authProps } = props;

  return (
    <OsDesignProvider value={osDesign}>
      <AuthProvider {...authProps}>
        {!props.ignoreWorkspace && !shouldLogin && !projectId && (
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
    </OsDesignProvider>
  );
};
