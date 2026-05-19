import { useProjects } from "../../..";
import { useProjectId } from "../../projects";
import { Workspace } from "../../types";
import { WorkspacesModalView } from "./WorkspacesModalView";

type Props = {
  onSelect: (workspace: Workspace) => void;
  onClose: () => void;
  open: boolean;
  /** Explicit dark-mode override; when omitted the modal follows the host theme. */
  dark?: boolean;
};

export const WorkspaceSelector = (props: Props) => {
  const { open, onSelect, onClose, dark } = props;
  const { data, loading, refetch } = useProjects();
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
      onWorkspaceCreated={refetch}
      dark={dark}
    />
  );
};
