import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  Key,
  Database,
  Server,
  Globe,
  CreditCard,
  User,
  Cloud,
  Box,
  Settings,
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

export default function DashboardView() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ workspaces: 0, entities: 0, secrets: 0, relationships: 0 });

  useEffect(() => {
    async function load() {
      const ws = await window.workspaceAPI.list();
      const entities = await window.entityAPI.list();
      const rels = await window.relationshipAPI.list();
      let secrets = 0;
      // Count secrets
      for (const e of entities as any[]) {
        const rows = await window.entityRowAPI.list(e.id);
        secrets += (rows as any[]).filter((r: any) => r.is_secret === 1).length;
      }
      setStats({ workspaces: ws.length, entities: entities.length, secrets, relationships: rels.length });
    }
    load();
  }, []);

  const cards = [
    { label: "Workspaces", value: stats.workspaces, color: "text-violet-500", icon: Folder },
    { label: "Entities", value: stats.entities, color: "text-blue-500", icon: Box },
    { label: "Secrets", value: stats.secrets, color: "text-amber-500", icon: Key },
    { label: "Relationships", value: stats.relationships, color: "text-emerald-500", icon: LayoutDashboard },
  ];

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{card.label}</span>
                  <Icon size={20} className={card.color} />
                </div>
                <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate("/graph")}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-sm font-medium"
              >
                <LayoutDashboard size={18} />
                Open Graph Editor
              </button>
              <button
                onClick={() => navigate("/cards")}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                <Box size={18} />
                View All Cards
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                <Settings size={18} />
                Open Settings
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">About</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Project Manager is a local-first desktop application for visually organizing projects,
              infrastructure, secrets, variables, and their relationships using an interactive graph.
            </p>
            <div className="mt-4 text-xs text-slate-400 dark:text-slate-600">
              Version 1.0.0 &bull; All data stored locally
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
