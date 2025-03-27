import { useProjects } from "../..";
import { Workspace } from "../types";
import { DEMO_WORKSPACES } from "./DemoWorkspaces";
import { WorkspacesModalView } from "./WorkspacesModalView";
import { useProjectId } from "../projects";

type Props = {
  onSelect: (workspace: Workspace) => void;
  onClose: () => void;
  demoMode: boolean;
  open: boolean;
};

export const WorkspaceSelector = (props: Props) => {
  const { open, onSelect, onClose, demoMode } = props;
  const { data, loading } = useProjects();
  const { projectId } = useProjectId();
  const workspaceData = demoMode ? DEMO_WORKSPACES : data ?? [];

  if (!open) return null;

  return (
    <WorkspacesModalView
      workspaces={workspaceData}
      onSelect={onSelect}
      onClose={onClose}
      loading={loading}
      currentWorkspaceId={projectId}
    />
  );
};
