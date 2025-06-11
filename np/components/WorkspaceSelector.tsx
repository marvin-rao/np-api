import { useProjects } from "../..";
import { useProjectId } from "../projects";
import { Workspace } from "../types";
import { WorkspacesModalView } from "./WorkspacesModalView";

type Props = {
  onSelect: (workspace: Workspace) => void;
  onClose: () => void;
  open: boolean;
};

export const WorkspaceSelector = (props: Props) => {
  const { open, onSelect, onClose } = props;
  const { data, loading } = useProjects();
  const { projectId } = useProjectId();
  const workspaceData = data ?? [];

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
