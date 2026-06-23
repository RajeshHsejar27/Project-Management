import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  Key,
  Database,
  Server,
  Globe,
  CreditCard,
  User,
  Cloud,
  Box,
  Download,
  Upload,
  Plus,
  Trash2,
} from "lucide-react";
import Sidebar from "../layout/Sidebar";

const typeIcons: Record<string, any> = {
  project: Folder,
  variable: Key,
  database: Database,
  server: Server,
  api: Globe,
  subscription: CreditCard,
  account: User,
  hosting: Cloud,
  custom: Box,
};

export default function AllCardsView() {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function load() {
      const ws = await window.workspaceAPI.list();
      const ents = await window.entityAPI.list();
      setWorkspaces(ws);
      setEntities(ents);
    }
    load();
  }, []);

  const filtered = entities.filter((e) => {
    const f = filter.toLowerCase();
    return (
      e.name.toLowerCase().includes(f) ||
      e.type.toLowerCase().includes(f)
    );
  });

  const handleExport = async (entityId?: string) => {
    if (!entityId) {
      const path = await window.dataAPI.exportCards();
      if (path) alert("Exported to: " + path);
    } else {
      const path = await window.dataAPI.exportCards(undefined, [entityId]);
      if (path) alert("Exported to: " + path);
    }
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const result = await window.dataAPI.importCards(file.path);
      alert(`Imported ${result.created} cards, skipped ${result.skipped}`);
      const ents = await window.entityAPI.list();
      setEntities(ents);
    };
    input.click();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this card?")) return;
    await window.entityAPI.delete(id);
    setEntities((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">All Cards</h1>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter cards..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500"
            />
            <button
              onClick={() => handleExport()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <Download size={14} /> Export
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <Upload size={14} /> Import
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((entity) => {
              const Icon = typeIcons[entity.type] || Box;
              const ws = workspaces.find((w) => w.id === entity.workspace_id);
              return (
                <div
                  key={entity.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entity.color || "#64748b" }}
                    />
                    <Icon size={14} className="text-slate-400" />
                    <span className="text-[10px] uppercase text-slate-400">{entity.type}</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {entity.name}
                  </div>
                  <div className="text-xs text-slate-400 mb-3">
                    {ws ? ws.name : "Unknown workspace"}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate("/graph")}
                      className="px-2 py-1 text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleExport(entity.id)}
                      className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Export
                    </button>
                    <button
                      onClick={() => handleDelete(entity.id)}
                      className="px-2 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-slate-400 py-20">No cards found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
