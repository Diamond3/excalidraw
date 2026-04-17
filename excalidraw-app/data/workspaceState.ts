import { appJotaiStore, atom } from "../app-jotai";

export type WorkspaceState = {
  id: string;
  name: string;
  encryptionKey: string;
} | null;

const STORAGE_KEY = "excalidraw-current-workspace";

const loadPersistedWorkspace = (): WorkspaceState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.encryptionKey === "string"
    ) {
      return parsed;
    }
  } catch {
    // ignore malformed entries
  }
  return null;
};

const baseAtom = atom<WorkspaceState>(loadPersistedWorkspace());

export const currentWorkspaceAtom = atom(
  (get) => get(baseAtom),
  (_get, set, next: WorkspaceState) => {
    set(baseAtom, next);
    try {
      if (next) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // storage full or unavailable — in-memory state still updated
    }
  },
);

// keep tabs in sync if the workspace changes in another tab
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }
    appJotaiStore.set(currentWorkspaceAtom, loadPersistedWorkspace());
  });
}

// scene version that was last saved to (or loaded from) the server
export const lastSyncedSceneVersionAtom = atom<number>(-1);

// derived flag — current scene differs from last synced
export const workspaceDirtyAtom = atom<boolean>(false);
