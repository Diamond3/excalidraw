import React, { useState } from "react";

import { Card } from "@excalidraw/excalidraw/components/Card";
import { ToolButton } from "@excalidraw/excalidraw/components/ToolButton";
import { serializeAsJSON } from "@excalidraw/excalidraw/data/json";
import {
  compressData,
} from "@excalidraw/excalidraw/data/encode";
import {
  generateEncryptionKey,
} from "@excalidraw/excalidraw/data/encryption";
import { isInitializedImageElement } from "@excalidraw/element";
import { save } from "@excalidraw/excalidraw/components/icons";

import type {
  FileId,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";
import type {
  AppState,
  BinaryFileData,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";

import { FILE_UPLOAD_MAX_BYTES } from "../app_constants";
import { encodeFilesForUpload } from "../data/FileManager";
import { saveFilesToFirebase } from "../data/firebase";
import { appJotaiStore } from "../app-jotai";
import { currentWorkspaceAtom } from "../data/workspaceState";

import type { WorkspaceState } from "../data/workspaceState";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const saveWorkspace = async (
  elements: readonly NonDeletedExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
  name: string,
  existingWorkspace?: WorkspaceState,
) => {
  const encryptionKey = existingWorkspace?.encryptionKey
    || await generateEncryptionKey("string");

  const payload = await compressData(
    new TextEncoder().encode(
      serializeAsJSON(elements, appState, files, "database"),
    ),
    { encryptionKey },
  );

  const params = new URLSearchParams({ name, key: encryptionKey });
  if (existingWorkspace?.id) {
    params.set("id", existingWorkspace.id);
  }

  const response = await fetch(
    `${API_URL}/api/workspaces?${params.toString()}`,
    {
      method: "POST",
      body: payload.buffer,
    },
  );

  const json = await response.json();

  if (!json.id) {
    throw new Error("Failed to save workspace");
  }

  // Save associated files
  const filesMap = new Map<FileId, BinaryFileData>();
  for (const element of elements) {
    if (isInitializedImageElement(element) && files[element.fileId]) {
      filesMap.set(element.fileId, files[element.fileId]);
    }
  }

  if (filesMap.size) {
    const filesToUpload = await encodeFilesForUpload({
      files: filesMap,
      encryptionKey,
      maxBytes: FILE_UPLOAD_MAX_BYTES,
    });

    await saveFilesToFirebase({
      prefix: `/files/workspaces/${json.id}`,
      files: filesToUpload,
    });
  }

  // Store the key in localStorage
  const workspaceKeys = JSON.parse(
    localStorage.getItem("excalidraw-workspace-keys") || "{}",
  );
  workspaceKeys[json.id] = encryptionKey;
  localStorage.setItem(
    "excalidraw-workspace-keys",
    JSON.stringify(workspaceKeys),
  );

  const workspace: WorkspaceState = {
    id: json.id,
    name: json.name,
    encryptionKey,
  };
  appJotaiStore.set(currentWorkspaceAtom, workspace);

  return workspace;
};

// Keep the old export name for compatibility with App.tsx imports
export const exportToExcalidrawPlus = async (
  elements: readonly NonDeletedExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
  name: string,
) => {
  const workspaceName = window.prompt("Workspace name:", name || "Untitled");
  if (!workspaceName) {
    return;
  }
  return saveWorkspace(elements, appState, files, workspaceName);
};

export const ExportToExcalidrawPlus: React.FC<{
  elements: readonly NonDeletedExcalidrawElement[];
  appState: Partial<AppState>;
  files: BinaryFiles;
  name: string;
  onError: (error: Error) => void;
  onSuccess: () => void;
}> = ({ elements, appState, files, name, onError, onSuccess }) => {
  const [saving, setSaving] = useState(false);

  return (
    <Card color="primary">
      <div className="Card-icon" style={{ fontSize: "2rem" }}>
        {save}
      </div>
      <h2>Save Workspace</h2>
      <div className="Card-details">
        Save the current scene to a workspace on the server.
      </div>
      <ToolButton
        className="Card-button"
        type="button"
        title="Save Workspace"
        aria-label="Save Workspace"
        showAriaLabel={true}
        disabled={saving}
        onClick={async () => {
          try {
            setSaving(true);
            await exportToExcalidrawPlus(elements, appState, files, name);
            onSuccess();
          } catch (error: any) {
            console.error(error);
            if (error.name !== "AbortError") {
              onError(new Error("Failed to save workspace"));
            }
          } finally {
            setSaving(false);
          }
        }}
      />
    </Card>
  );
};
