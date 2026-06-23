import React, { useEffect, useState } from "react";
import { Undo2, Trash2 } from "lucide-react";
import Sidebar from "../layout/Sidebar";

export default function TrashView() {
  const [trashItems, setTrashItems] = useState<any[]>([]);

  useEffect(() => {
    loadTrash();
  }, []);

  async function loadTrash() {
    // For now, trash is not fully implemented in the backend; this is a placeholder UI
    setTrashItems([]);
  }

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Trash</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {trashItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Trash2 size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Trash is empty</p>
              <p className="text-sm mt-1">Deleted items will appear here for 30 days.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trashItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm"
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {item.item_type}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Deleted {new Date(item.deleted_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button className="flex items-center gap-1 px-2 py-1 text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded hover:bg-violet-100 transition-colors">
                      <Undo2 size={12} /> Restore
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 rounded hover:bg-red-100 transition-colors">
                      <Trash2 size={12} /> Delete Forever
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
