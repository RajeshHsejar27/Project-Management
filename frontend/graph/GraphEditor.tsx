import React, {
  useEffect,
  useCallback,
  useMemo
} from "react";

import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  OnConnect,
  useReactFlow
} from "reactflow";

import "reactflow/dist/style.css";

import EntityNode from "./nodes/EntityNode";

import {
  Entity,
  Relationship
} from "../../shared/types";


export default function GraphEditor() {

  const nodeTypes =
    useMemo(
      () => ({
        entity: EntityNode
      }),
      []
    );


  const { getEdges } =
    useReactFlow();


  const [
    nodes,
    setNodes,
    onNodesChange
  ] =
    useNodesState([]);


  const [
    edges,
    setEdges,
    onEdgesChange
  ] =
    useEdgesState([]);


  // LOAD GRAPH
  const loadGraph =
    useCallback(
      async () => {

        try {

          const entities:
            Entity[] =
              await window.entityAPI.list();

          const relationships:
            Relationship[] =
              await window.relationshipAPI.list();


          const flowNodes:
            Node[] =
              entities.map(
                (entity) => ({

                  id: entity.id,

                  type: "entity",

                  position: {

                    x:
                      entity.position_x ??
                      Math.random() * 400,

                    y:
                      entity.position_y ??
                      Math.random() * 400

                  },

                  data: {

                    label:
                      entity.name,

                    type:
                      entity.type,

                    color:
                      entity.color,


                    setColor:
                      async (
                        color:
                          string
                      ) => {

                        await window.entityAPI.updateColor(
                          entity.id,
                          color
                        );

                        setNodes(
                          nodes =>
                            nodes.map(
                              node =>
                                node.id === entity.id
                                  ? {
                                      ...node,
                                      data: {
                                        ...node.data,
                                        color
                                      }
                                    }
                                  : node
                            )
                        );

                      },


                    rename:
                      async (
                        newName:
                          string
                      ) => {

                        await window.entityAPI.rename(
                          entity.id,
                          newName
                        );

                        setNodes(
                          nodes =>
                            nodes.map(
                              node =>
                                node.id === entity.id
                                  ? {
                                      ...node,
                                      data: {
                                        ...node.data,
                                        label:
                                          newName
                                      }
                                    }
                                  : node
                            )
                        );

                      },


                    delete:
                      async () => {

                        await window.entityAPI.delete(
                          entity.id
                        );

                        await loadGraph();

                      }

                  }

                })
              );


          const flowEdges:
            Edge[] =
              relationships.map(
                rel => ({

                  id: rel.id,

                  source:
                    rel.source_id,

                  target:
                    rel.target_id

                })
              );


          setNodes(flowNodes);

          setEdges(flowEdges);

        }
        catch (err) {

          console.error(
            "Graph load failed:",
            err
          );

        }

      },
      [setNodes, setEdges]
    );


  // LOAD ON START
  useEffect(
    () => {

      loadGraph();

    },
    [loadGraph]
  );


  // ADD ENTITY
  async function createNewEntity() {

    await window.entityAPI.create(
      "New Entity",
      "generic"
    );

    await loadGraph();

  }


  // CREATE RELATIONSHIP
  const onConnect:
    OnConnect =
    async (
      connection:
        Connection
    ) => {

      if (
        !connection.source ||
        !connection.target
      ) return;

      const rel =
        await window.relationshipAPI.create(
          connection.source,
          connection.target,
          "default"
        );

      setEdges(
        edges => [

          ...edges,

          {

            id: rel.id,

            source:
              rel.source_id,

            target:
              rel.target_id

          }

        ]
      );

    };


  // DELETE RELATIONSHIP WITH DELETE KEY
  useEffect(
    () => {

      const handler =
        async (
          event:
            KeyboardEvent
        ) => {

          if (
            event.key !==
            "Delete"
          ) return;

          const selected =
            getEdges()
              .filter(
                e =>
                  e.selected
              );

          for (
            const edge
            of selected
          ) {

            await window.relationshipAPI.delete(
              edge.id
            );

          }

          setEdges(
            edges =>
              edges.filter(
                edge =>
                  !selected.find(
                    s =>
                      s.id ===
                      edge.id
                  )
              )
          );

        };

      window.addEventListener(
        "keydown",
        handler
      );

      return () =>
        window.removeEventListener(
          "keydown",
          handler
        );

    },
    [getEdges]
  );


  return (

    <div
      style={{
        width: "100%",
        height: "100vh"
      }}
    >

      <div
        style={{
          padding: 10
        }}
      >

        <button
          onClick={
            createNewEntity
          }
        >
          Add Entity
        </button>

      </div>


      <ReactFlow

        nodes={nodes}

        edges={edges}

        nodeTypes={nodeTypes}

        onNodesChange={
          onNodesChange
        }

        onEdgesChange={
          onEdgesChange
        }

        onConnect={
          onConnect
        }

        fitView

      >

        <Background />

        <Controls />

      </ReactFlow>

    </div>

  );

}
