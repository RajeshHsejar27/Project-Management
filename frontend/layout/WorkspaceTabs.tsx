import React from "react";
import { Plus, X } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useNavigate } from "react-router-dom";

export default function WorkspaceTabs() {
  const workspaces = useAppStore((s) => s.workspaces);
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace);
  const addWorkspace = useAppStore((s) => s.addWorkspace);
  const removeWorkspace = useAppStore((s) => s.removeWorkspace);
  const navigate = useNavigate();

  const handleAdd = async () => {
    const name = window.prompt("Workspace name:");
    if (!name || !name.trim()) return;
    const ws = await window.workspaceAPI.create(name.trim());
    addWorkspace(ws);
    setActiveWorkspace(ws.id);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this workspace?")) return;
    await window.workspaceAPI.delete(id);
    removeWorkspace(id);
  };

  return (
    <div className="flex items-center h-9 px-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-1">
      {workspaces.map((ws) => {
        const isActive = ws.id === activeWorkspaceId;
        return (
          <div
            key={ws.id}
            onClick={() => setActiveWorkspace(ws.id)}
            className={`group flex items-center gap-2 px-3 py-1 rounded-t-md text-xs cursor-pointer border-t border-l border-r transition-all ${
              isActive
                ? "bg-slate-50 dark:bg-slate-950 text-violet-600 dark:text-violet-400 border-slate-200 dark:border-slate-700"
                : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ws.color || "#7c3aed" }}
            />
            <span className="max-w-[120px] truncate">{ws.name}</span>
            <button
              onClick={(e) => handleDelete(e, ws.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-300 dark:hover:bg-slate-700 transition-opacity"
            >
              <X size={10} />
            </button>
          </div>
        );
      })}
      <button
        onClick={handleAdd}
        className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        title="New Workspace"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
