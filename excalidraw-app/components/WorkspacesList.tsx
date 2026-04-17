import { useCallback, useEffect, useState } from "react";
import { decompressData } from "@excalidraw/excalidraw/data/encode";

import type { ImportedDataState } from "@excalidraw/excalidraw/data/types";

import { appJotaiStore } from "../app-jotai";
import { currentWorkspaceAtom } from "../data/workspaceState";

import "./WorkspacesList.scss";

const API_URL = import.meta.env.VITE_APP_API_URL;

type Workspace = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export const WorkspacesList = ({
  onLoad,
}: {
  onLoad: (data: ImportedDataState) => void;
}) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/workspaces`);
      if (!response.ok) {
        throw new Error("Failed to fetch workspaces");
      }
      const data = await response.json();
      setWorkspaces(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const loadWorkspace = async (workspace: Workspace) => {
    if (!confirm("Loading this workspace will replace your current scene. Any unsaved changes will be lost. Continue?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/workspaces/${workspace.id}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load workspace");
      }

      const buffer = await response.arrayBuffer();

      const workspaceKeys = JSON.parse(
        localStorage.getItem("excalidraw-workspace-keys") || "{}",
      );
      const decryptionKey = workspaceKeys[workspace.id];

      if (!decryptionKey) {
        alert("Decryption key not found for this workspace. It may have been saved from a different browser.");
        return;
      }

      const { data: decodedBuffer } = await decompressData(
        new Uint8Array(buffer),
        { decryptionKey },
      );

      const sceneData: ImportedDataState = JSON.parse(
        new TextDecoder().decode(decodedBuffer),
      );

      appJotaiStore.set(currentWorkspaceAtom, {
        id: workspace.id,
        name: workspace.name,
        encryptionKey: decryptionKey,
      });

      onLoad({
        elements: sceneData.elements || null,
        appState: sceneData.appState || null,
        files: sceneData.files || undefined,
      });
    } catch (err: any) {
      console.error("Error loading workspace:", err);
      alert("Failed to load workspace: " + err.message);
    }
  };

  const deleteWorkspace = async (e: React.MouseEvent, workspace: Workspace) => {
    e.stopPropagation();
    if (!confirm(`Delete "${workspace.name}"?`)) {
      return;
    }

    try {
      await fetch(`${API_URL}/api/workspaces/${workspace.id}`, {
        method: "DELETE",
      });

      const workspaceKeys = JSON.parse(
        localStorage.getItem("excalidraw-workspace-keys") || "{}",
      );
      delete workspaceKeys[workspace.id];
      localStorage.setItem(
        "excalidraw-workspace-keys",
        JSON.stringify(workspaceKeys),
      );

      const current = appJotaiStore.get(currentWorkspaceAtom);
      if (current?.id === workspace.id) {
        appJotaiStore.set(currentWorkspaceAtom, null);
      }

      setWorkspaces((prev) => prev.filter((w) => w.id !== workspace.id));
    } catch (err: any) {
      console.error("Error deleting workspace:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="workspaces-list__loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="workspaces-list__error">
        <p>{error}</p>
        <button onClick={fetchWorkspaces}>Retry</button>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="workspaces-list__empty">
        <p>No workspaces yet.</p>
        <p className="workspaces-list__hint">
          Use the export dialog to save your current scene as a workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="workspaces-list">
      {workspaces.map((workspace) => (
        <button
          key={workspace.id}
          className="workspaces-list__item"
          onClick={() => loadWorkspace(workspace)}
        >
          <div className="workspaces-list__item-name">{workspace.name}</div>
          <div className="workspaces-list__item-date">
            {formatDate(workspace.updated_at)}
          </div>
          <button
            className="workspaces-list__item-delete"
            onClick={(e) => deleteWorkspace(e, workspace)}
            title="Delete workspace"
          >
            &times;
          </button>
        </button>
      ))}
    </div>
  );
};
