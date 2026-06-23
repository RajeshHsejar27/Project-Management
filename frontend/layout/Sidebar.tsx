import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Share2,
  List,
  Search,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  MoreHorizontal,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Share2, label: "Graph", path: "/graph" },
  { icon: List, label: "All Cards", path: "/cards" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Trash2, label: "Trash", path: "/trash" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  const active = location.pathname;

  return (
    <div
      className={`flex flex-col h-full bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-3 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
            Project Manager
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = active === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Divider */}
        {!collapsed && (
          <div className="mt-4 mb-2 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Workspaces
          </div>
        )}
        {collapsed && (
          <div className="mt-4 mb-2 mx-auto w-6 h-px bg-slate-300 dark:bg-slate-700" />
        )}

        <WorkspaceList />
      </div>

      {/* Bottom */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800">
        {bottomItems.map((item) => {
          const isActive = active === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
        <div className="mt-2 px-2 text-[10px] text-slate-400 text-center">
          {!collapsed && "v1.0.0"}
        </div>
      </div>
    </div>
  );
}

function WorkspaceList() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const workspaces = useAppStore((s) => s.workspaces);
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace);
  const addWorkspace = useAppStore((s) => s.addWorkspace);
  const removeWorkspace = useAppStore((s) => s.removeWorkspace);
  const renameWorkspace = useAppStore((s) => s.renameWorkspace);
  const [newName, setNewName] = useState("");
  const [showInput, setShowInput] = useState(false);

  const navigate = useNavigate();

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const ws = await window.workspaceAPI.create(newName.trim());
    addWorkspace(ws);
    setActiveWorkspace(ws.id);
    setNewName("");
    setShowInput(false);
    navigate("/graph");
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this workspace? All cards inside will be removed.")) return;
    await window.workspaceAPI.delete(id);
    removeWorkspace(id);
  };

  const handleRename = async (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    const name = window.prompt("Rename workspace:", currentName);
    if (!name || name.trim() === "" || name.trim() === currentName) return;
    await window.workspaceAPI.update(id, name.trim());
    renameWorkspace(id, name.trim());
  };

  return (
    <div className="flex flex-col gap-1">
      {workspaces.map((ws) => {
        const isActive = ws.id === activeWorkspaceId;
        return (
          <button
            key={ws.id}
            onClick={() => {
              setActiveWorkspace(ws.id);
              navigate("/graph");
            }}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
              isActive
                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
            title={collapsed ? ws.name : undefined}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: ws.color || "#7c3aed" }}
            />
            {!collapsed && (
              <span className="flex-1 truncate text-left">{ws.name}</span>
            )}
            {!collapsed && (
              <span className="opacity-0 group-hover:opacity-100 flex gap-0.5">
                <button
                  onClick={(e) => handleRename(e, ws.id, ws.name)}
                  className="p-0.5 rounded hover:bg-slate-300 dark:hover:bg-slate-700"
                >
                  <MoreHorizontal size={12} />
                </button>
                <button
                  onClick={(e) => handleDelete(e, ws.id)}
                  className="p-0.5 rounded hover:bg-slate-300 dark:hover:bg-slate-700"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </button>
        );
      })}

      {showInput ? (
        <div className="flex items-center gap-1 px-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setShowInput(false);
                setNewName("");
              }
            }}
            onBlur={() => {
              if (newName.trim()) handleAdd();
              else setShowInput(false);
            }}
            className="flex-1 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-violet-500"
            placeholder="New workspace..."
          />
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-slate-500 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? "New Workspace" : undefined}
        >
          <Plus size={16} />
          {!collapsed && <span>New Workspace</span>}
        </button>
      )}
    </div>
  );
}
