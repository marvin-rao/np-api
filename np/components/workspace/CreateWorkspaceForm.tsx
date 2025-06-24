import { useState } from "react";
import { Workspace } from "../../types";
import { style } from "./styles";

type Props = {
  onSubmit: (data: { name: string; description: string }) => void;
  onCancel: () => void;
  loading: boolean;
};

export const CreateWorkspaceForm = ({ onSubmit, onCancel, loading }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError("Workspace name is required");
      isValid = false;
    } else if (name.trim().length < 3) {
      setNameError("Workspace name must be at least 3 characters");
      isValid = false;
    } else {
      setNameError("");
    }

    if (description.trim().length > 500) {
      setDescriptionError("Description must be less than 500 characters");
      isValid = false;
    } else {
      setDescriptionError("");
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ name: name.trim(), description: description.trim() });
    }
  };

  return (
    <div style={{ ...style.overlay } as React.CSSProperties}>
      <div style={style.modal}>
        <div style={style.header}>
          <div style={style.title}>Create New Workspace</div>
          <div style={style.subtitle}>Set up a new workspace for your team</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: "1.5rem" }}>
            {/* Workspace Name Field */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Workspace Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  ...style.searchInput,
                  borderColor: nameError ? "#dc2626" : "#d1d5db",
                  boxShadow: nameError
                    ? "0 0 0 3px rgba(220, 38, 38, 0.1)"
                    : "none",
                  padding: "0.75rem",
                }}
                placeholder="Enter workspace name..."
                maxLength={100}
                disabled={loading}
                autoFocus
              />
              {nameError && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#dc2626",
                    marginTop: "0.25rem",
                  }}
                >
                  {nameError}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  ...style.searchInput,
                  borderColor: descriptionError ? "#dc2626" : "#d1d5db",
                  boxShadow: descriptionError
                    ? "0 0 0 3px rgba(220, 38, 38, 0.1)"
                    : "none",
                  padding: "0.75rem",
                  height: "80px",
                  resize: "vertical" as const,
                  fontFamily: "inherit",
                }}
                placeholder="Describe your workspace..."
                maxLength={500}
                disabled={loading}
              />
              {descriptionError && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#dc2626",
                    marginTop: "0.25rem",
                  }}
                >
                  {descriptionError}
                </p>
              )}
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginTop: "0.25rem",
                }}
              >
                {description.length}/500 characters
              </p>
            </div>
          </div>

          <div
            style={{
              ...style.footer,
              justifyContent: "space-between",
              padding: "1rem 1.5rem",
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                ...style.cancelButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              style={{
                padding: "0.5rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "white",
                backgroundColor: loading || !name.trim() ? "#9ca3af" : "#2563eb",
                border: "none",
                borderRadius: "0.375rem",
                cursor: loading || !name.trim() ? "not-allowed" : "pointer",
                transition: "all 0.15s ease-in-out",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {loading && (
                <svg
                  style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    style={{ opacity: 0.25 }}
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    style={{ opacity: 0.75 }}
                  />
                </svg>
              )}
              {loading ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </form>

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};
