import React, { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import Sidebar from "../layout/Sidebar";
import WorkspaceTabs from "../layout/WorkspaceTabs";
import GraphEditor from "../graph/GraphEditor";

export default function GraphEditorView() {
  const setWorkspaces = useAppStore((s) => s.setWorkspaces);
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace);
  const addWorkspace = useAppStore((s) => s.addWorkspace);
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const ws = await window.workspaceAPI.list();
        if (cancelled) return;
        setWorkspaces(ws as any[]);

        // If no active workspace, set one
        if (!activeWorkspaceId) {
          if (ws.length > 0) {
            const active = await window.workspaceAPI.getActive();
            const id = active || ws[0].id;
            if (!cancelled) setActiveWorkspace(id);
          } else {
            // No workspaces exist — create default
            console.log("No workspaces found. Creating default...");
            const newWs = await window.workspaceAPI.create("Default Workspace", "#7c3aed");
            if (!cancelled) {
              addWorkspace(newWs);
              setActiveWorkspace(newWs.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load workspaces:", err);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [activeWorkspaceId]); // re-run if activeWorkspaceId changes externally

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <WorkspaceTabs />
        <div className="flex-1 relative">
          <GraphEditor />
        </div>
      </div>
    </div>
  );
}
