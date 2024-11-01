import React, { useCallback, useEffect, useState } from "react";
import { useProjects } from "../../api";
import { Workspace } from "../types";

// Demo workspaces data remains the same
const DEMO_WORKSPACES = [
  {
    id: "eng-2024",
    name: "Engineering",
    description: "Technical team workspace for product development",
    members: 45,
    lastActive: "2 hours ago",
  },
  {
    id: "mkt-2024",
    name: "Marketing",
    description: "Campaign planning and content management",
    members: 23,
    lastActive: "5 mins ago",
  },
  {
    id: "sales-2024",
    name: "Sales",
    description: "Client accounts and sales pipeline",
    members: 34,
    lastActive: "1 hour ago",
  },
  {
    id: "design-2024",
    name: "Design",
    description: "UI/UX and brand design projects",
    members: 18,
    lastActive: "Just now",
  },
  {
    id: "hr-2024",
    name: "Human Resources",
    description: "Employee management and recruitment",
    members: 12,
    lastActive: "3 hours ago",
  },
  {
    id: "prod-2024",
    name: "Product",
    description: "Product strategy and roadmap planning",
    members: 28,
    lastActive: "30 mins ago",
  },
  {
    id: "cs-2024",
    name: "Customer Success",
    description: "Customer support and success management",
    members: 31,
    lastActive: "15 mins ago",
  },
];

export const WorkspaceSelector = ({
  open,
  onSelect,
  onClose,
  demoMode,
}: {
  onSelect: (workspace: Workspace) => void;
  onClose: () => void;
  demoMode: boolean;
  open: boolean;
}) => {
  const { data } = useProjects();
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);

  const workspaceData = demoMode ? DEMO_WORKSPACES : data ?? [];

  const filteredWorkspaces = workspaceData.filter(
    (workspace) =>
      workspace.name.toLowerCase().includes(filter.toLowerCase()) ||
      workspace.description.toLowerCase().includes(filter.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            Math.min(prev + 1, filteredWorkspaces.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredWorkspaces[focusedIndex]) {
            setSelectedId(filteredWorkspaces[focusedIndex].id);
            onSelect(filteredWorkspaces[focusedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    },
    [open, filteredWorkspaces, focusedIndex, onSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setFocusedIndex(0);
  }, [filter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Select Workspace
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose a workspace to continue
          </p>
        </div>

        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-150"
            placeholder="Search workspaces..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="max-h-[calc(100vh-24rem)] overflow-y-auto">
          {filteredWorkspaces.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No workspaces found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredWorkspaces.map((workspace, index) => (
                <button
                  key={workspace.id}
                  className={`w-full px-6 py-4 flex items-start text-left 
                    transition-all duration-200 ease-in-out
                    hover:bg-blue-50/80 focus:outline-none group
                    ${focusedIndex === index ? "bg-blue-50" : ""}
                    ${selectedId === workspace.id ? "bg-blue-100" : ""}
                    ${
                      hoveredId === workspace.id
                        ? "shadow-md translate-x-1"
                        : ""
                    }`}
                  onClick={() => {
                    setSelectedId(workspace.id);
                    onSelect(workspace);
                  }}
                  onMouseEnter={() => setHoveredId(workspace.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div
                    className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-md 
                    transition-all duration-200 ease-in-out
                    ${
                      hoveredId === workspace.id
                        ? "bg-blue-200 scale-110"
                        : "bg-blue-100"
                    }
                    text-blue-600 font-medium`}
                  >
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div
                        className={`font-medium text-gray-900 truncate transition-all duration-200
                        ${hoveredId === workspace.id ? "text-blue-600" : ""}`}
                      >
                        {workspace.name}
                      </div>
                      {workspace.lastActive && (
                        <span className="ml-2 text-xs text-gray-500">
                          {workspace.lastActive}
                        </span>
                      )}
                    </div>
                    {workspace.description && (
                      <div className="text-sm text-gray-500 line-clamp-2 group-hover:text-gray-600">
                        {workspace.description}
                      </div>
                    )}
                    {workspace.members && (
                      <div className="mt-1 text-xs text-gray-500">
                        {workspace.members} members
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 
              focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md
              transition-all duration-150 hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
