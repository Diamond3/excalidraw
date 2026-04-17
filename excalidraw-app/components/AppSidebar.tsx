import { DefaultSidebar, Sidebar } from "@excalidraw/excalidraw";
import { file } from "@excalidraw/excalidraw/components/icons";
import { useUIAppState } from "@excalidraw/excalidraw/context/ui-appState";

import { WorkspacesList } from "./WorkspacesList";

import "./AppSidebar.scss";

import type { ImportedDataState } from "@excalidraw/excalidraw/data/types";

export const AppSidebar = ({
  onLoadWorkspace,
}: {
  onLoadWorkspace: (data: ImportedDataState) => void;
}) => {
  const { openSidebar } = useUIAppState();

  return (
    <DefaultSidebar>
      <DefaultSidebar.TabTriggers>
        <Sidebar.TabTrigger
          tab="workspaces"
          style={{ opacity: openSidebar?.tab === "workspaces" ? 1 : 0.4 }}
        >
          {file}
        </Sidebar.TabTrigger>
      </DefaultSidebar.TabTriggers>
      <Sidebar.Tab tab="workspaces">
        <div style={{ padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.9rem" }}>
          Workspaces
        </div>
        <WorkspacesList onLoad={onLoadWorkspace} />
      </Sidebar.Tab>
    </DefaultSidebar>
  );
};
