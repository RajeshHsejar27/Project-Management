import React, { useEffect, useRef } from "react";

interface Props {
  x: number;
  y: number;
  onDelete: (e: React.MouseEvent) => void;
  onColor: (color: string, e: React.MouseEvent) => void;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onDelete, onColor, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const colors = [
    "#7c3aed", "#3b82f6", "#22c55e", "#eab308", "#f97316", "#ec4899", "#06b6d4", "#6366f1", "#64748b",
  ];

  return (
    <div
      ref={ref}
      className="absolute bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 p-2 min-w-[140px]"
      style={{ top: y, left: x }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="px-2 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer transition-colors"
        onClick={onDelete}
      >
        Delete
      </div>
      <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700">
        <div className="px-2 py-1 text-[10px] text-slate-400 uppercase tracking-wider">Color</div>
        <div className="flex flex-wrap gap-1 px-2 py-1">
          {colors.map((color) => (
            <span
              key={color}
              onClick={(e) => onColor(color, e)}
              className="w-5 h-5 rounded-full cursor-pointer border border-slate-200 dark:border-slate-600 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
