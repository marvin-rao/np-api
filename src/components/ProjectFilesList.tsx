import React from "react";
import { useFilesAppFiles } from "../../np/filesapp";
import type { AppFile } from "../../np/types";

const ProjectFilesList: React.FC = () => {
  const { data: files, loading, error, refetch } = useFilesAppFiles();

  if (loading && !files) return <p>Loading files…</p>;
  if (error) return <p style={{ color: "red" }}>{String(error)}</p>;
  if (!files?.length) return <p>No files found in this workspace.</p>;

  return (
    <div style={{ marginTop: "1.5rem", textAlign: "left" }}>
      <h3>Project Files</h3>
      <button onClick={() => refetch()} style={{ marginBottom: "0.75rem" }}>
        Refresh
      </button>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {(files as AppFile[] | undefined)?.map((f: AppFile) => (
          <li key={f.id} style={{ marginBottom: "0.5rem" }}>
            <a href={f.url} target="_blank" rel="noopener noreferrer">
              {f.name || f.id}
            </a>{" "}
            <span style={{ color: "#888" }}>
              ({Math.round(f.size / 1024)} KB)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectFilesList;
