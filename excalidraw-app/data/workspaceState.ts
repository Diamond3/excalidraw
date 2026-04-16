import { atom } from "../app-jotai";

export type WorkspaceState = {
  id: string;
  name: string;
  encryptionKey: string;
} | null;

export const currentWorkspaceAtom = atom<WorkspaceState>(null);
