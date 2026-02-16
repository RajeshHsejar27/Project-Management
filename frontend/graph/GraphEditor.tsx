

import React,
{
  useEffect,
  useCallback,
  useMemo,
  useState,
  useRef
}
from "react";

import ReactFlow,
{
  Background,
  Controls,
  Node,
  Edge,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges
}
from "reactflow";

import "reactflow/dist/style.css";

import EntityNode from "./nodes/EntityNode";
import ContextMenu from "./components/ContextMenu";

import { Entity } from "../../shared/types";

import { SelectionMode } from "reactflow";

import {
  MiniMap
} from "reactflow";


export default function GraphEditor()
{

  // ============================
  // MAIN STATE
  // ============================

  const [spacePressed, setSpacePressed] =
  useState(false);

  const isRestoringRef = useRef(false)


  const [nodes, setNodes] =
    useState<Node[]>([]);

  const [edges, setEdges] =
    useState<Edge[]>([]);

  const [contextMenu, setContextMenu] =
    useState<any>(null);

  const [selectedNodes, setSelectedNodes] =
    useState<Node[]>([]);

  const [selectedEdges, setSelectedEdges] =
    useState<Edge[]>([]);

    const [theme, setTheme] =
  useState("light");


  // ============================
  // HISTORY SYSTEM
  // ============================

  const historyRef =
    useRef<{ nodes:any[], edges:any[] }[]>([]);

  const historyIndexRef =
    useRef(-1);

function saveHistory(nodesSnapshot: Node[], edgesSnapshot: Edge[])
{
  if (isRestoringRef.current) return

  const safeNodes =
    nodesSnapshot.map(n => ({
      id: n.id,
      type: n.type,
      position: { ...n.position },
      data: {
        label: n.data.label,
        type: n.data.type,
        color: n.data.color
      }
    }))

  const safeEdges =
    edgesSnapshot.map(e => ({ ...e }))

  historyRef.current =
    historyRef.current.slice(
      0,
      historyIndexRef.current + 1
    )

  historyRef.current.push({
    nodes: safeNodes,
    edges: safeEdges
  })

  historyIndexRef.current++
}


  // ============================
  // NODE FACTORY (CRITICAL)
  // ============================

  const createNode =
    useCallback(
      (entity: Entity): Node =>
      ({
        id: entity.id,

        type: "entity",

        position:
        {
          x: entity.position_x ?? 200,
          y: entity.position_y ?? 200
        },

        data:
        {
          label: entity.name,
          type: entity.type,
          color: entity.color,


          onRenameLocal:
            async (newName:string) =>
          {
            await window.entityAPI.rename(
              entity.id,
              newName
            );

            setNodes(prev =>
              prev.map(n =>
                n.id === entity.id
                ? {
                    ...n,
                    data:
                    {
                      ...n.data,
                      label: newName
                    }
                  }
                : n
              )
            );
          },


          setColor:
            async (color:string) =>
          {
            await window.entityAPI.updateColor(
              entity.id,
              color
            );

            setNodes(prev =>
              prev.map(n =>
                n.id === entity.id
                ? {
                    ...n,
                    data:
                    {
                      ...n.data,
                      color
                    }
                  }
                : n
              )
            );
          },


          delete:
            async () =>
          {
            await window.entityAPI.delete(
              entity.id
            );

            setNodes(prev =>
              prev.filter(
                n => n.id !== entity.id
              )
            );

            setEdges(prev =>
              prev.filter(
                e =>
                  e.source !== entity.id &&
                  e.target !== entity.id
              )
            );
          }

        }

      }),
    []
  );



  // ============================
  // Space pan
  // ============================
  useEffect(() =>
{
  function handleKeyDown(
    event: KeyboardEvent
  )
  {
    if (event.code === "Space")
    {
      setSpacePressed(true);

      // prevent page scroll
      event.preventDefault();
    }
  }

  function handleKeyUp(
    event: KeyboardEvent
  )
  {
    if (event.code === "Space")
    {
      setSpacePressed(false);
    }
  }

  window.addEventListener(
    "keydown",
    handleKeyDown
  );

  window.addEventListener(
    "keyup",
    handleKeyUp
  );

  return () =>
  {
    window.removeEventListener(
      "keydown",
      handleKeyDown
    );

    window.removeEventListener(
      "keyup",
      handleKeyUp
    );
  };

}, []);

  // ============================
  // LOAD GRAPH
  // ============================

  useEffect(() =>
  {
    async function load()
    {
      const entities =
        await window.entityAPI.list();

      const relationships =
        await window.relationshipAPI.list();

      const newNodes =
        entities.map(createNode);

  const newEdges =
  relationships.map(rel => ({
    id: rel.id,
    source: rel.source_id,
    target: rel.target_id,

    label: rel.type,

    style: {
      strokeWidth: 2
    },

    labelStyle: {
      fontSize: 12,
      fill: "#555"
    }
  }));


      setNodes(newNodes);
      setEdges(newEdges);

      saveHistory(newNodes, newEdges);
    }

    load();

  }, []);


  
  // ============================
  // SELECT ALL
  // ============================

useEffect(() =>
{
  function handleSelectAll(event: KeyboardEvent)
  {
    const ctrl =
      event.ctrlKey || event.metaKey;

    if (!ctrl || event.key !== "a")
      return;

    event.preventDefault();

    setNodes(prev =>
      prev.map(n =>
      ({
        ...n,
        selected: true
      }))
    );
  }

  window.addEventListener(
    "keydown",
    handleSelectAll
  );

  return () =>
    window.removeEventListener(
      "keydown",
      handleSelectAll
    );
}, []);

  // ============================
  // NODE CHANGE HANDLER
  // ============================

  const onNodesChange =
    useCallback(
      (changes:any) =>
      {
        setNodes(prev =>
        {
          const updated =
            applyNodeChanges(
              changes,
              prev
            );

          saveHistory(updated, edges);

          return updated;
        });
      },
      [edges]
    );


  const onEdgesChange =
    useCallback(
      (changes:any) =>
      {
        setEdges(prev =>
        {
          const updated =
            applyEdgeChanges(
              changes,
              prev
            );

          saveHistory(nodes, updated);

          return updated;
        });
      },
      [nodes]
    );


  // ============================
  // SELECTION HANDLER
  // ============================

  const onSelectionChange =
    useCallback(
      ({ nodes, edges }:{nodes:Node[],edges:Edge[]}) =>
      {
        setSelectedNodes(nodes);
        setSelectedEdges(edges);
      },
      []
    );


  // ============================
  // DELETE KEY HANDLER
  // ============================

  useEffect(() =>
  {
    async function handleDelete(event:KeyboardEvent)
    {
      if(event.key !== "Delete")
        return;

      for(const node of selectedNodes)
        await window.entityAPI.delete(node.id);

      for(const edge of selectedEdges)
        await window.relationshipAPI.delete(edge.id);

      const newNodes =
        nodes.filter(n =>
          !selectedNodes.some(
            s => s.id === n.id
          )
        );

      const newEdges =
        edges.filter(e =>
          !selectedEdges.some(
            s => s.id === e.id
          )
        );

      setNodes(newNodes);
      setEdges(newEdges);

      saveHistory(newNodes,newEdges);
    }

    window.addEventListener(
      "keydown",
      handleDelete
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleDelete
      );

  }, [selectedNodes, selectedEdges, nodes, edges]);


  // ============================
  // CREATE ENTITY
  // ============================

  async function createNewEntity()
  {
    const entity =
      await window.entityAPI.create(
        "New Entity",
        "generic"
      );

    const newNodes =
      [...nodes, createNode(entity)];

    setNodes(newNodes);

    saveHistory(newNodes, edges);
  }


  // ============================
  // CONNECT EDGE
  // ============================
const onConnect: OnConnect =
async (connection) =>
{
  if (
    !connection.source ||
    !connection.target
  )
    return;


  const rel =
    await window.relationshipAPI.create(
      connection.source,
      connection.target,
      "default"
    );


  const newEdge: Edge =
  {
    id: rel.id,

    source: rel.source_id,

    target: rel.target_id,

    label: rel.type,

    style:
    {
      strokeWidth: 2,
      stroke: "#64748b"
    },

    labelStyle:
    {
      fontSize: 12,
      fill: "#334155",
      fontWeight: 500
    }
  };


  const updatedEdges =
    [...edges, newEdge];


  setEdges(updatedEdges);


  // IMPORTANT: save clean history snapshot
  saveHistory(
    nodes.map(n => ({
      ...n,
      data:
      {
        label: n.data.label,
        type: n.data.type,
        color: n.data.color
      }
    })),
    updatedEdges.map(e => ({ ...e }))
  );

};


  // ============================
  // UNDO / REDO
  // ============================

  useEffect(() =>
  {
    function rebuildNode(n:any):Node
    {
      return createNode({
        id: n.id,
        name: n.data.label,
        type: n.data.type,
        color: n.data.color,
        position_x: n.position.x,
        position_y: n.position.y
      } as Entity);
    }


    function handleKey(event:KeyboardEvent)
    {
      const ctrl =
        event.ctrlKey ||
        event.metaKey;

      if(!ctrl) return;


      if (event.key === "z")
{
  event.preventDefault()

  if (historyIndexRef.current <= 0)
    return

  historyIndexRef.current--

  const snapshot =
    historyRef.current[
      historyIndexRef.current
    ]

  isRestoringRef.current = true

  const rebuiltNodes =
    snapshot.nodes.map((snapNode: any) =>
      createNode({
        id: snapNode.id,
        name: snapNode.data.label,
        type: snapNode.data.type,
        color: snapNode.data.color,
        position_x: snapNode.position.x,
        position_y: snapNode.position.y
      })
    )

  setNodes(rebuiltNodes)
  setEdges(snapshot.edges)

  setTimeout(() =>
  {
    isRestoringRef.current = false
  }, 0)
}



   if (event.key === "y")
{
  event.preventDefault()

  if (
    historyIndexRef.current >=
    historyRef.current.length - 1
  )
    return

  historyIndexRef.current++

  const snapshot =
    historyRef.current[
      historyIndexRef.current
    ]

  isRestoringRef.current = true

  const rebuiltNodes =
    snapshot.nodes.map((snapNode: any) =>
      createNode({
        id: snapNode.id,
        name: snapNode.data.label,
        type: snapNode.data.type,
        color: snapNode.data.color,
        position_x: snapNode.position.x,
        position_y: snapNode.position.y
      })
    )

  setNodes(rebuiltNodes)
  setEdges(snapshot.edges)

  setTimeout(() =>
  {
    isRestoringRef.current = false
  }, 0)

  console.log("Redo restored correctly")
}


    }


    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );

  }, [createNode]);


  // ============================
  // CONTEXT MENU
  // ============================

  const onNodeContextMenu =
    (event:any,node:Node)=>
  {
    event.preventDefault();

    setContextMenu({
      x:event.clientX,
      y:event.clientY,
      nodeId:node.id
    });
  };


  const nodeTypes =
    useMemo(
      ()=>({entity:EntityNode}),
      []
    );


  // ============================
  // UI
  // ============================

  return(
  <div style={{width:"100%",height:"100vh",  background:
    theme === "dark"
      ? "#0f172a"
      : "#f8fafc"}}>

    <button onClick={createNewEntity}>
      Add Entity
    </button>

<button
  onClick={() =>
    setTheme(
      theme === "light"
        ? "dark"
        : "light"
    )
  }
>
  Toggle Theme
</button>

<ReactFlow


  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}

  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}

  onNodeContextMenu={onNodeContextMenu}
  onSelectionChange={onSelectionChange}

  selectionOnDrag={true}
  selectionMode={SelectionMode.Partial}

  multiSelectionKeyCode={["Shift", "Control", "Meta"]}

  panOnDrag={
  spacePressed
    ? [0,1,2]   // enable pan with left mouse while space held
    : [1,2]     // normal pan only middle mouse
}

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
  nodeColor={(node) =>
    node.data?.color || "#ffffff"
  }
  maskColor="rgba(0,0,0,0.1)"
/>

      <Background/>
      <Controls/>
    </ReactFlow>


    {contextMenu &&
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      onClose={()=>setContextMenu(null)}
      onDelete={(e:any)=>
      {
        e.stopPropagation();

        const node =
          nodes.find(
            n=>n.id===contextMenu.nodeId
          );

        node?.data.delete();

        setContextMenu(null);
      }}
      onColor={(color,e:any)=>
      {
        e.stopPropagation();

        const node =
          nodes.find(
            n=>n.id===contextMenu.nodeId
          );

        node?.data.setColor(color);

        setContextMenu(null);
      }}
    />
    }

  </div>
  );
}
