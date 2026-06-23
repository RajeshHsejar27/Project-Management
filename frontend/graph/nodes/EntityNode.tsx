import React, { useState, useEffect, useRef } from "react";
import { NodeResizer, Handle, Position } from "reactflow";
import { GripVertical } from "lucide-react";

export default function EntityNode(props: any) {
  const nodeId = props.id;
  const data = props.data;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.label);
  const [rows, setRows] = useState<any[]>([]);
  const [showRowManager, setShowRowManager] = useState(false);
  const [newRowKey, setNewRowKey] = useState("");
  const [newRowValue, setNewRowValue] = useState("");
  const [newRowSecret, setNewRowSecret] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragRowRef = useRef<number | null>(null);

  useEffect(() => {
    setName(data.label);
  }, [data.label]);

  useEffect(() => {
    loadEntityRows();
  }, [nodeId]);

  async function loadEntityRows() {
    try {
      const entityRows = await window.entityRowAPI.list(nodeId);
      setRows(entityRows || []);
    } catch (error) {
      console.error("Failed to load entity rows:", error);
    }
  }

  async function saveRename() {
    if (!name || name.trim() === "") {
      setEditing(false);
      setName(data.label);
      return;
    }
    try {
      await window.entityAPI.rename(nodeId, name);
      data.onRenameLocal?.(name);
      setEditing(false);
    } catch (err) {
      console.error("Rename failed:", err);
      setEditing(false);
      setName(data.label);
    }
  }

  async function addRow() {
    if (!newRowKey.trim() && !newRowValue.trim()) return;
    try {
      const orderIndex = rows.length;
      const newRow = await window.entityRowAPI.create(
        nodeId,
        newRowKey.trim() || "Key",
        newRowValue.trim(),
        orderIndex,
        newRowSecret
      );
      setRows((prev) => [...prev, newRow]);
      setNewRowKey("");
      setNewRowValue("");
      setNewRowSecret(false);
    } catch (error) {
      console.error("Failed to add row:", error);
    }
  }

  async function updateRow(rowId: string, key: string, value: string, isSecret?: boolean) {
    try {
      await window.entityRowAPI.update(rowId, key, value, isSecret);
      setRows((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? { ...row, row_key: key, row_value: value, is_secret: isSecret !== undefined ? (isSecret ? 1 : 0) : row.is_secret }
            : row
        )
      );
    } catch (error) {
      console.error("Failed to update row:", error);
    }
  }

  async function deleteRow(rowId: string) {
    try {
      await window.entityRowAPI.delete(rowId);
      setRows((prev) => prev.filter((row) => row.id !== rowId));
    } catch (error) {
      console.error("Failed to delete row:", error);
    }
  }

  async function reorderRows(updatedRows: any[]) {
    try {
      for (const [index, row] of updatedRows.entries()) {
        await window.entityRowAPI.updateOrder(row.id, index);
      }
      setRows(updatedRows);
    } catch (error) {
      console.error("Failed to reorder rows:", error);
    }
  }

  /* ─── drag & drop ─── */
  function handleDragStart(index: number) {
    dragRowRef.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    setDragOverIndex(null);
    const fromIndex = dragRowRef.current;
    if (fromIndex === null || fromIndex === dropIndex) return;
    const updated = [...rows];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(dropIndex, 0, moved);
    reorderRows(updated);
  }

  function handleDragEnd() {
    dragRowRef.current = null;
    setDragOverIndex(null);
  }

  const headerColor = data.color || "#64748b";

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[200px]"
      style={{ cursor: editing ? "text" : "grab" }}
    >
      <NodeResizer
        minWidth={180}
        minHeight={60}
        isVisible={props.selected}
        lineStyle={{ border: "1px solid #7c3aed" }}
        handleStyle={{ width: 8, height: 8, background: "#7c3aed" }}
      />

      {/* Connection handles */}
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-slate-400 dark:!bg-slate-500" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-slate-400 dark:!bg-slate-500" />

      {/* Header */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: headerColor + "20" }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: headerColor }}
        />
        <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
          {data.type}
        </div>
      </div>

      {/* Title */}
      <div className="px-3 py-1">
        {editing ? (
          <input
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveRename();
              if (e.key === "Escape") {
                setEditing(false);
                setName(data.label);
              }
            }}
            className="w-full font-semibold text-sm text-slate-900 dark:text-slate-100 bg-transparent outline-none border border-violet-300 dark:border-violet-700 rounded px-1"
          />
        ) : (
          <div
            onDoubleClick={() => setEditing(true)}
            className="font-semibold text-sm text-slate-900 dark:text-slate-100 cursor-pointer select-none hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            {data.label}
          </div>
        )}
      </div>

      {/* Row Manager Toggle */}
      <div className="px-3 py-1">
        <button
          onClick={() => setShowRowManager(!showRowManager)}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          {showRowManager ? "Hide Rows" : "Edit Rows"}
        </button>
      </div>

      {/* Row Manager Panel */}
      {showRowManager && (
        <div className="px-3 pb-3 border-t border-slate-100 dark:border-slate-800">
          {/* Add new row */}
          <div className="flex items-center gap-1 mt-2 mb-2">
            <input
              type="text"
              value={newRowKey}
              placeholder="Key"
              onChange={(e) => setNewRowKey(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRow(); } }}
              className="flex-1 min-w-0 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500"
            />
            <input
              type="text"
              value={newRowValue}
              placeholder="Value"
              onChange={(e) => setNewRowValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRow(); } }}
              className="flex-1 min-w-0 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500"
            />
            <button
              onClick={() => setNewRowSecret(!newRowSecret)}
              title={newRowSecret ? "Secret" : "Public"}
              className={`px-1.5 py-1 text-xs rounded border ${
                newRowSecret
                  ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
              }`}
            >
              {newRowSecret ? "🔒" : "🔓"}
            </button>
            <button
              onClick={addRow}
              className="px-2 py-1 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded transition-colors"
            >
              +
            </button>
          </div>

          {/* Existing rows with drag-to-reorder */}
          <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto scrollbar-thin">
            {rows.map((row, index) => (
              <div
                key={row.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-1 group rounded cursor-move ${
                  dragOverIndex === index ? "bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800" : ""
                }`}
              >
                <div className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 px-0.5">
                  <GripVertical size={12} />
                </div>
                <div className="flex-1 min-w-0 flex gap-1 py-0.5">
                  <input
                    type="text"
                    value={row.row_key}
                    onChange={(e) => updateRow(row.id, e.target.value, row.row_value, row.is_secret === 1)}
                    className="w-1/2 px-1.5 py-0.5 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-none focus:border-violet-500"
                  />
                  <input
                    type={showSecret[row.id] ? "text" : row.is_secret === 1 ? "password" : "text"}
                    value={row.row_value}
                    onChange={(e) => updateRow(row.id, row.row_key, e.target.value, row.is_secret === 1)}
                    className="w-1/2 px-1.5 py-0.5 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-none focus:border-violet-500"
                  />
                </div>
                <button
                  onClick={() => setShowSecret((prev) => ({ ...prev, [row.id]: !prev[row.id] }))}
                  className={`opacity-0 group-hover:opacity-100 px-1 py-0.5 text-[10px] rounded transition-opacity ${
                    row.is_secret === 1
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {row.is_secret === 1 ? (showSecret[row.id] ? "👁" : "🔒") : ""}
                </button>
                <button
                  onClick={() => deleteRow(row.id)}
                  className="opacity-0 group-hover:opacity-100 px-1 py-0.5 text-[10px] text-red-500 hover:text-red-600 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
            {rows.length === 0 && (
              <div className="text-center text-[10px] text-slate-400 py-2">
                No rows yet. Add one above!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
