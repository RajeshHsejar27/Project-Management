import React, { useEffect, useCallback, useMemo, useState, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  SelectionMode,
  MiniMap,
  useReactFlow,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import EntityNode from "./nodes/EntityNode";
import ContextMenu from "./components/ContextMenu";
import { Entity } from "../../shared/types";
import { useAppStore } from "../store/useAppStore";

/* ─── helpers ─── */
const SNAP_GRID = 20;
const snap = (n: number) => Math.round(n / SNAP_GRID) * SNAP_GRID;

const debounceMap = new Map<string, ReturnType<typeof setTimeout>>();
function debouncedPositionUpdate(id: string, x: number, y: number) {
  const key = `pos-${id}`;
  const existing = debounceMap.get(key);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    window.entityAPI.updatePosition(id, x, y).catch(console.error);
    debounceMap.delete(key);
  }, 300);
  debounceMap.set(key, timer);
}

const edgeTypeMap: Record<string, string> = {
  smooth: "default",
  step: "smoothstep",
  straight: "straight",
};

export default function GraphEditor() {
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);
  const settings = useAppStore((s) => s.settings);

  const snapToGrid = settings["snap_to_grid"] === "true";
  const connectionStyle = settings["connection_style"] || "smooth";
  const edgeType = edgeTypeMap[connectionStyle] || "default";

  const [spacePressed, setSpacePressed] = useState(false);
  const isRestoringRef = useRef(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [contextMenu, setContextMenu] = useState<any>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const [edgeLabelEdit, setEdgeLabelEdit] = useState<{ id: string; label: string } | null>(null);
  const [showAddMenu, setShowAddMenu] = useState<{ x: number; y: number } | null>(null);

  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

  const historyRef = useRef<{ nodes: any[]; edges: any[] }[]>([]);
  const historyIndexRef = useRef(-1);

  function saveHistory(nodesSnapshot: Node[], edgesSnapshot: Edge[]) {
    if (isRestoringRef.current) return;
    const safeNodes = nodesSnapshot.map((n) => ({
      id: n.id,
      type: n.type,
      position: { ...n.position },
      data: { label: n.data.label, type: n.data.type, color: n.data.color },
    }));
    const safeEdges = edgesSnapshot.map((e) => ({ ...e, label: e.label }));
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push({ nodes: safeNodes, edges: safeEdges });
    historyIndexRef.current++;
  }

  const createNode = useCallback(
    (entity: Entity): Node => ({
      id: entity.id,
      type: "entity",
      position: {
        x: snapToGrid ? snap(entity.position_x ?? 200) : entity.position_x ?? 200,
        y: snapToGrid ? snap(entity.position_y ?? 200) : entity.position_y ?? 200,
      },
      data: {
        label: entity.name,
        type: entity.type,
        color: entity.color,
        onRenameLocal: async (newName: string) => {
          await window.entityAPI.rename(entity.id, newName);
          setNodes((prev) => prev.map((n) => (n.id === entity.id ? { ...n, data: { ...n.data, label: newName } } : n)));
        },
        setColor: async (color: string) => {
          await window.entityAPI.updateColor(entity.id, color);
          setNodes((prev) => prev.map((n) => (n.id === entity.id ? { ...n, data: { ...n.data, color } } : n)));
        },
        delete: async () => {
          await window.entityAPI.delete(entity.id);
          setNodes((prev) => prev.filter((n) => n.id !== entity.id));
          setEdges((prev) => prev.filter((e) => e.source !== entity.id && e.target !== entity.id));
        },
      },
    }),
    [snapToGrid]
  );

  /* ─── load graph when workspace changes ─── */
  useEffect(() => {
    async function load() {
      if (!activeWorkspaceId) return;
      const entities = await window.entityAPI.list(activeWorkspaceId);
      const relationships = await window.relationshipAPI.list();
      const newNodes = (entities as any[]).map((e) => createNode(e as Entity));
      // Filter relationships to only those where both endpoints are in this workspace
      const entityIds = new Set((entities as any[]).map((e) => e.id));
      const newEdges = (relationships as any[])
        .filter((rel) => entityIds.has(rel.source_id) && entityIds.has(rel.target_id))
        .map((rel) => ({
          id: rel.id,
          source: rel.source_id,
          target: rel.target_id,
          label: rel.type,
          type: edgeType,
          style: { strokeWidth: 2, stroke: "#64748b" },
          labelStyle: { fontSize: 12, fill: "#555", fontWeight: 500 },
        }));
      setNodes(newNodes);
      setEdges(newEdges);
      saveHistory(newNodes, newEdges);

      // restore viewport if saved
      const savedViewport = await window.settingsAPI.get(`viewport_${activeWorkspaceId}`);
      if (savedViewport && reactFlowRef.current) {
        try {
          const vp = JSON.parse(savedViewport);
          reactFlowRef.current.setViewport(vp);
        } catch {
          /* ignore */
        }
      }
    }
    load();
  }, [activeWorkspaceId, createNode, edgeType]);

  /* ─── auto-save viewport every 2s ─── */
  useEffect(() => {
    if (!activeWorkspaceId) return;
    const interval = setInterval(() => {
      if (reactFlowRef.current) {
        const vp = reactFlowRef.current.getViewport();
        window.settingsAPI.set(`viewport_${activeWorkspaceId}`, JSON.stringify(vp)).catch(console.error);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeWorkspaceId]);

  /* ─── keyboard shortcuts ─── */
  function isTypingInInput(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement;
    if (!target) return false;
    const tag = target.tagName;
    const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    const isContentEditable = target.isContentEditable;
    return isInput || isContentEditable;
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingInInput(event)) return;
      if (event.code === "Space") {
        setSpacePressed(true);
        event.preventDefault();
      }
    }
    function handleKeyUp(event: KeyboardEvent) {
      if (event.code === "Space") setSpacePressed(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    function handleSelectAll(event: KeyboardEvent) {
      if (isTypingInInput(event)) return;
      const ctrl = event.ctrlKey || event.metaKey;
      if (!ctrl || event.key !== "a") return;
      event.preventDefault();
      setNodes((prev) => prev.map((n) => ({ ...n, selected: true })));
    }
    window.addEventListener("keydown", handleSelectAll);
    return () => window.removeEventListener("keydown", handleSelectAll);
  }, []);

  /* ─── node/edge changes ─── */
  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes((prev) => {
        const updated = applyNodeChanges(changes, prev);
        for (const change of changes) {
          if (change.type === "position" && change.position) {
            const finalX = snapToGrid ? snap(change.position.x) : change.position.x;
            const finalY = snapToGrid ? snap(change.position.y) : change.position.y;
            debouncedPositionUpdate(change.id, finalX, finalY);
          }
        }
        saveHistory(updated, edges);
        return updated;
      });
    },
    [edges, snapToGrid]
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      setEdges((prev) => {
        const updated = applyEdgeChanges(changes, prev);
        saveHistory(nodes, updated);
        return updated;
      });
    },
    [nodes]
  );

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedNodes(nodes);
      setSelectedEdges(edges);
    },
    []
  );

  /* ─── delete key ─── */
  useEffect(() => {
    async function handleDelete(event: KeyboardEvent) {
      if (isTypingInInput(event)) return;
      if (event.key !== "Delete") return;
      for (const node of selectedNodes) await window.entityAPI.delete(node.id);
      for (const edge of selectedEdges) await window.relationshipAPI.delete(edge.id);
      const newNodes = nodes.filter((n) => !selectedNodes.some((s) => s.id === n.id));
      const newEdges = edges.filter((e) => !selectedEdges.some((s) => s.id === e.id));
      setNodes(newNodes);
      setEdges(newEdges);
      saveHistory(newNodes, newEdges);
    }
    window.addEventListener("keydown", handleDelete);
    return () => window.removeEventListener("keydown", handleDelete);
  }, [selectedNodes, selectedEdges, nodes, edges]);

  /* ─── create entity ─── */
  async function createNewEntity(type: string = "custom") {
    let wsId = activeWorkspaceId;
    
    // If no active workspace, try to fetch or create one
    if (!wsId) {
      console.warn("No active workspace. Attempting to initialize...");
      const wsList = await window.workspaceAPI.list();
      if (wsList.length > 0) {
        wsId = wsList[0].id;
        useAppStore.getState().setActiveWorkspace(wsId);
        console.log("Auto-selected workspace:", wsId);
      } else {
        const newWs = await window.workspaceAPI.create("Default Workspace", "#7c3aed");
        wsId = newWs.id;
        useAppStore.getState().setActiveWorkspace(wsId);
        useAppStore.getState().addWorkspace(newWs);
        console.log("Created default workspace:", wsId);
      }
    }
    
    if (!wsId) {
      console.error("CRITICAL: Could not obtain a workspace ID. Cannot create entity.");
      alert("Error: No workspace available. Please create a workspace first.");
      return;
    }
    
    try {
      const entity = await window.entityAPI.create(wsId, "New Entity", type);
      const newNode = createNode(entity);
      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      saveHistory(newNodes, edges);
      console.log("Created entity:", entity.id, entity.name);
    } catch (err) {
      console.error("Failed to create entity:", err);
      alert("Failed to create entity. See console for details.");
    }
  }

  /* ─── connect edge ─── */
  const onConnect: OnConnect = async (connection) => {
    if (!connection.source || !connection.target) return;
    const rel = await window.relationshipAPI.create(connection.source, connection.target, "related");
    const newEdge: Edge = {
      id: rel.id,
      source: rel.source_id,
      target: rel.target_id,
      label: rel.type,
      type: edgeType,
      style: { strokeWidth: 2, stroke: "#64748b" },
      labelStyle: { fontSize: 12, fill: "#334155", fontWeight: 500 },
    };
    const updatedEdges = [...edges, newEdge];
    setEdges(updatedEdges);
    saveHistory(
      nodes.map((n) => ({ ...n, data: { label: n.data.label, type: n.data.type, color: n.data.color } })),
      updatedEdges.map((e) => ({ ...e }))
    );
  };

  /* ─── undo/redo ─── */
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const ctrl = event.ctrlKey || event.metaKey;
      if (!ctrl) return;

      if (event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        if (historyIndexRef.current <= 0) return;
        historyIndexRef.current--;
        const snapshot = historyRef.current[historyIndexRef.current];
        isRestoringRef.current = true;
        const rebuiltNodes = snapshot.nodes.map((snapNode: any) =>
          createNode({
            id: snapNode.id,
            name: snapNode.data.label,
            type: snapNode.data.type,
            color: snapNode.data.color,
            position_x: snapNode.position.x,
            position_y: snapNode.position.y,
          } as Entity)
        );
        setNodes(rebuiltNodes);
        setEdges(snapshot.edges);
        setTimeout(() => (isRestoringRef.current = false), 0);
      }

      if (event.key === "y" || (event.key === "z" && event.shiftKey)) {
        event.preventDefault();
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        historyIndexRef.current++;
        const snapshot = historyRef.current[historyIndexRef.current];
        isRestoringRef.current = true;
        const rebuiltNodes = snapshot.nodes.map((snapNode: any) =>
          createNode({
            id: snapNode.id,
            name: snapNode.data.label,
            type: snapNode.data.type,
            color: snapNode.data.color,
            position_x: snapNode.position.x,
            position_y: snapNode.position.y,
          } as Entity)
        );
        setNodes(rebuiltNodes);
        setEdges(snapshot.edges);
        setTimeout(() => (isRestoringRef.current = false), 0);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [createNode]);

  /* ─── context menu ─── */
  const onNodeContextMenu = (event: any, node: Node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
  };

  const onPaneContextMenu = (event: any) => {
    event.preventDefault();
    setShowAddMenu({ x: event.clientX, y: event.clientY });
  };

  const nodeTypes = useMemo(() => ({ entity: EntityNode }), []);

  return (
    <div className="w-full h-full relative bg-slate-50 dark:bg-slate-950">
      {/* Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <button
          onClick={() => createNewEntity("custom")}
          className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors"
        >
          + Entity
        </button>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 px-1 py-1">
          {["project", "variable", "database", "server", "api", "subscription"].map((t) => (
            <button
              key={t}
              onClick={() => createNewEntity(t)}
              className="px-2 py-0.5 text-[10px] uppercase font-medium rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
              title={`New ${t}`}
            >
              {t[0]}
            </button>
          ))}
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onSelectionChange={onSelectionChange}
        onEdgeDoubleClick={(_event, edge) => {
          const labelText = typeof edge.label === "string" ? edge.label : "";
          setEdgeLabelEdit({ id: edge.id, label: labelText });
        }}
        onInit={(instance) => {
          reactFlowRef.current = instance;
        }}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode={["Shift", "Control", "Meta"]}
        panOnDrag={spacePressed ? [0, 1, 2] : [1, 2]}
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        minZoom={0.2}
        maxZoom={2}
        fitView
      >
        <MiniMap
          pannable
          zoomable
          position="bottom-right"
          nodeColor={(node) => node.data?.color || "#ffffff"}
          maskColor="rgba(0,0,0,0.1)"
          className="bg-slate-200 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700"
        />
        <Background className="bg-slate-50 dark:bg-slate-950" />
        <Controls className="bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700" />
      </ReactFlow>

      {/* Node Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={(e: any) => {
            e.stopPropagation();
            const node = nodes.find((n) => n.id === contextMenu.nodeId);
            node?.data.delete();
            setContextMenu(null);
          }}
          onColor={(color: string, e: any) => {
            e.stopPropagation();
            const node = nodes.find((n) => n.id === contextMenu.nodeId);
            node?.data.setColor(color);
            setContextMenu(null);
          }}
        />
      )}

      {/* Pane Context Menu (Add Entity) */}
      {showAddMenu && (
        <div
          className="absolute z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2 min-w-[140px]"
          style={{ top: showAddMenu.y, left: showAddMenu.x }}
        >
          <div className="text-[10px] uppercase text-slate-400 px-2 py-1 mb-1">Add Entity</div>
          {["project", "variable", "database", "server", "api", "subscription", "account", "hosting", "custom"].map((t) => (
            <button
              key={t}
              onClick={() => {
                createNewEntity(t);
                setShowAddMenu(null);
              }}
              className="w-full text-left px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors capitalize"
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Edge Label Editor */}
      {edgeLabelEdit && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 z-50 shadow-xl">
          <input
            type="text"
            autoFocus
            value={edgeLabelEdit.label}
            onChange={(e) => setEdgeLabelEdit((prev) => (prev ? { ...prev, label: e.target.value } : null))}
            onBlur={() => {
              if (edgeLabelEdit) {
                window.relationshipAPI.rename(edgeLabelEdit.id, edgeLabelEdit.label);
                setEdges((prev) => prev.map((e) => (e.id === edgeLabelEdit.id ? { ...e, label: edgeLabelEdit.label } : e)));
                setEdgeLabelEdit(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (edgeLabelEdit) {
                  window.relationshipAPI.rename(edgeLabelEdit.id, edgeLabelEdit.label);
                  setEdges((prev) => prev.map((ed) => (ed.id === edgeLabelEdit.id ? { ...ed, label: edgeLabelEdit.label } : ed)));
                  setEdgeLabelEdit(null);
                }
              } else if (e.key === "Escape") {
                setEdgeLabelEdit(null);
              }
            }}
            className="w-48 px-2 py-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500"
          />
        </div>
      )}
    </div>
  );
}
