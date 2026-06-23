import React, { useEffect, useState } from "react";
import {
  Moon,
  Sun,
  Monitor,
  Type,
  Grid3x3,
  Palette,
  Maximize2,
  Save,
  Database,
  Keyboard,
  AlertTriangle,
  Download,
  Upload,
} from "lucide-react";
import Sidebar from "../layout/Sidebar";
import { useAppStore } from "../store/useAppStore";

const accentColors = [
  "#7c3aed", "#3b82f6", "#06b6d4", "#22c55e", "#eab308", "#f97316", "#ef4444", "#ec4899",
];

export default function SettingsView() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const [settings, setLocalSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const all = await window.settingsAPI.getAll();
      const map: Record<string, string> = {};
      (all as any[]).forEach((s) => (map[s.key] = s.value));
      setLocalSettings(map);
    }
    load();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    await window.settingsAPI.set(key, value);
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const [activeTab, setActiveTab] = useState("appearance");

  const tabs = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "graph", label: "Graph Editor", icon: Grid3x3 },
    { id: "cards", label: "Cards & Rows", icon: Type },
    { id: "data", label: "Data & Storage", icon: Database },
    { id: "backup", label: "Backup", icon: Save },
    { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
    { id: "advanced", label: "Advanced", icon: AlertTriangle },
  ];

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Customize your experience and application preferences.
          </p>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Settings Sidebar */}
          <div className="w-56 border-r border-slate-200 dark:border-slate-800 p-3 flex flex-col gap-1 overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "appearance" && (
              <div className="max-w-2xl space-y-6">
                <Section title="Theme">
                  <div className="flex gap-3">
                    <ThemeButton
                      active={theme === "dark"}
                      onClick={() => setTheme("dark")}
                      icon={<Moon size={18} />}
                      label="Dark"
                    />
                    <ThemeButton
                      active={theme === "light"}
                      onClick={() => setTheme("light")}
                      icon={<Sun size={18} />}
                      label="Light"
                    />
                    <ThemeButton
                      active={theme === "system"}
                      onClick={() => setTheme("system")}
                      icon={<Monitor size={18} />}
                      label="System"
                    />
                  </div>
                </Section>

                <Section title="Accent Color">
                  <div className="flex flex-wrap gap-3">
                    {accentColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateSetting("accent_color", color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          (settings["accent_color"] || "#7c3aed") === color
                            ? "border-slate-900 dark:border-white scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </Section>

                <Section title="UI Density">
                  <div className="flex gap-3">
                    {["Compact", "Comfortable", "Spacious"].map((d) => (
                      <button
                        key={d}
                        onClick={() => updateSetting("ui_density", d.toLowerCase())}
                        className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                          (settings["ui_density"] || "comfortable") === d.toLowerCase()
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {activeTab === "graph" && (
              <div className="max-w-2xl space-y-6">
                <Section title="Grid">
                  <ToggleSetting
                    label="Snap to Grid"
                    value={settings["snap_to_grid"] === "true"}
                    onChange={(v) => updateSetting("snap_to_grid", v ? "true" : "false")}
                  />
                  <div className="flex items-center gap-4 mt-3">
                    <label className="text-sm text-slate-600 dark:text-slate-400">Default Grid Size</label>
                    <input
                      type="number"
                      value={settings["grid_size"] || "20"}
                      onChange={(e) => updateSetting("grid_size", e.target.value)}
                      className="w-20 px-2 py-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500"
                    />
                    <span className="text-xs text-slate-400">px</span>
                  </div>
                </Section>

                <Section title="Navigation">
                  <ToggleSetting
                    label="Show Mini Map"
                    value={settings["show_minimap"] !== "false"}
                    onChange={(v) => updateSetting("show_minimap", v ? "true" : "false")}
                  />
                  <ToggleSetting
                    label="Enable Smooth Animations"
                    value={settings["smooth_animations"] !== "false"}
                    onChange={(v) => updateSetting("smooth_animations", v ? "true" : "false")}
                  />
                  <ToggleSetting
                    label="Pan with Space Key"
                    value={settings["space_pan"] !== "false"}
                    onChange={(v) => updateSetting("space_pan", v ? "true" : "false")}
                  />
                </Section>

                <Section title="Connection Style">
                  <select
                    value={settings["connection_style"] || "smooth"}
                    onChange={(e) => updateSetting("connection_style", e.target.value)}
                    className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500"
                  >
                    <option value="smooth">Smooth</option>
                    <option value="step">Step</option>
                    <option value="straight">Straight</option>
                  </select>
                </Section>
              </div>
            )}

            {activeTab === "cards" && (
              <div className="max-w-2xl space-y-6">
                <Section title="Row Settings">
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-slate-600 dark:text-slate-400">Max Rows per Card</label>
                    <input
                      type="number"
                      value={settings["max_rows"] || "20"}
                      onChange={(e) => updateSetting("max_rows", e.target.value)}
                      className="w-20 px-2 py-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <label className="text-sm text-slate-600 dark:text-slate-400">Default Row Key Placeholder</label>
                    <input
                      type="text"
                      value={settings["row_placeholder"] || "Key"}
                      onChange={(e) => updateSetting("row_placeholder", e.target.value)}
                      className="w-40 px-2 py-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500"
                    />
                  </div>
                </Section>
              </div>
            )}

            {activeTab === "data" && (
              <div className="max-w-2xl space-y-6">
                <Section title="Data Management">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    All data is stored locally in an SQLite database. No data is ever sent to any server.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => window.dataAPI.exportCards()}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Download size={16} /> Export All Data
                    </button>
                    <button
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".xlsx";
                        input.onchange = async (e: any) => {
                          const file = e.target.files[0];
                          if (file) {
                            const result = await window.dataAPI.importCards(file.path);
                            alert(`Imported ${result.created} cards, skipped ${result.skipped}`);
                          }
                        };
                        input.click();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Upload size={16} /> Import Data
                    </button>
                  </div>
                </Section>
              </div>
            )}

            {activeTab === "backup" && (
              <div className="max-w-2xl space-y-6">
                <Section title="Backups">
                  <BackupManager />
                </Section>
              </div>
            )}

            {activeTab === "shortcuts" && (
              <div className="max-w-2xl space-y-6">
                <Section title="Keyboard Shortcuts">
                  <ShortcutTable />
                </Section>
              </div>
            )}

            {activeTab === "advanced" && (
              <div className="max-w-2xl space-y-6">
                <Section title="Danger Zone">
                  <div className="p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50 dark:bg-red-900/10">
                    <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                      These actions are destructive and cannot be undone.
                    </p>
                    <button
                      onClick={() => {
                        if (window.confirm("Reset ALL settings to defaults? This cannot be undone.")) {
                          // Reset logic
                        }
                      }}
                      className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Reset All Settings
                    </button>
                  </div>
                </Section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ThemeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition-colors ${
        active
          ? "bg-violet-600 text-white border-violet-600"
          : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ToggleSetting({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          value ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function ShortcutTable() {
  const shortcuts = [
    { key: "Ctrl + N", action: "New Entity" },
    { key: "Ctrl + Shift + N", action: "New Workspace" },
    { key: "Ctrl + Z", action: "Undo" },
    { key: "Ctrl + Y / Ctrl + Shift + Z", action: "Redo" },
    { key: "Delete", action: "Delete Selected" },
    { key: "Ctrl + A", action: "Select All" },
    { key: "Space + Drag", action: "Pan Canvas" },
    { key: "Ctrl + F", action: "Search" },
  ];

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-2 text-left text-slate-600 dark:text-slate-400 font-medium">Shortcut</th>
            <th className="px-4 py-2 text-left text-slate-600 dark:text-slate-400 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {shortcuts.map((s) => (
            <tr key={s.key}>
              <td className="px-4 py-2 font-mono text-slate-700 dark:text-slate-300">{s.key}</td>
              <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{s.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BackupManager() {
  const [backups, setBackups] = useState<string[]>([]);

  useEffect(() => {
    loadBackups();
  }, []);

  async function loadBackups() {
    const list = await window.backupAPI.list();
    setBackups(list);
  }

  async function handleRestore(filename: string) {
    if (!window.confirm(`Restore from backup: ${filename}?`)) return;
    await window.backupAPI.restore(filename);
    alert("Backup restored. The app will reload.");
    window.location.reload();
  }

  return (
    <div className="space-y-2">
      {backups.length === 0 && (
        <p className="text-sm text-slate-400">No backups available yet.</p>
      )}
      {backups.map((b) => (
        <div
          key={b}
          className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <span className="text-sm text-slate-700 dark:text-slate-300 font-mono">{b}</span>
          <button
            onClick={() => handleRestore(b)}
            className="px-3 py-1 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded transition-colors"
          >
            Restore
          </button>
        </div>
      ))}
    </div>
  );
}
