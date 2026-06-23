import React, { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import Sidebar from "../layout/Sidebar";

export default function SearchView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const entities = await window.entityAPI.list();
    const filtered = (entities as any[]).filter((e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.type.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Search</h1>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search cards, keys, values..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 max-w-md px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors"
            >
              <SearchIcon size={16} className="inline mr-1" />
              Search
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((e) => (
                <div
                  key={e.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: e.color || "#64748b" }}
                    />
                    <span className="text-[10px] uppercase text-slate-400">{e.type}</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{e.name}</div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="text-center text-slate-400 py-20">No results found.</div>
          ) : (
            <div className="text-center text-slate-400 py-20">
              <SearchIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>Enter a search term to find cards.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
