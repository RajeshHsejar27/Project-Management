

// import {

//   NodeResizer
// } from "reactflow";


// import { Handle, Position } from "reactflow";
// import { useState } from "react";

// export default function EntityNode(props: any) {

//   const nodeId = props.id;
//   const data = props.data;

//   const [editing, setEditing] =
//     useState(false);

//   const [name, setName] =
//     useState(data.label);

//   async function saveRename() {

//     if (!name || name.trim() === "") {

//       setEditing(false);
//       return;

//     }

//     try {

//       await window.entityAPI.rename(
//         nodeId,
//         name
//       );

//       data.onRenameLocal?.(name);

//       setEditing(false);

//       console.log(
//         "Rename success:",
//         nodeId,
//         name
//       );

//     }
//     catch (err) {

//       console.error(
//         "Rename failed:",
//         err
//       );

//     }

//   }

//   return (

//     <div

//     style={{
//   background: data.color || "#ffffff",
//   border: "1px solid #d1d5db",
//   borderRadius: 8,
//   padding: "12px",
//   minWidth: "180px",
//   cursor: "grab",
//   boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
// }}


//     >

//       <Handle type="target" position={Position.Left} />

//       <div style={{
//         fontSize: 10,
//         color: "#666"
//       }}>
//         {data.type}
//       </div>

//       {editing ? (

//         <input

//           value={name}

//           autoFocus

//           onChange={(e) =>
//             setName(e.target.value)
//           }

//           onBlur={saveRename}

//           onKeyDown={(e) => {

//             if (e.key === "Enter")
//               saveRename();

//             if (e.key === "Escape")
//               setEditing(false);

//           }}

//           style={{
//             fontWeight: "bold",
//             fontSize: 14,
//             width: "100%",
//             border: "1px solid #999"
//           }}

//         />

//       ) : (

//         <div

//           onDoubleClick={() => {

//             console.log(
//               "Rename start:",
//               nodeId
//             );

//             setEditing(true);

//           }}

//           style={{
//             fontWeight: "bold",
//             fontSize: 14,
//             color: "#222"
//           }}

//         >
//           {data.label}
//         </div>

//       )}

//       <Handle type="source" position={Position.Right} />

//     </div>

//   );



// }


import {
  NodeResizer,
  Handle,
  Position
} from "reactflow";

import { useState, useEffect } from "react";

export default function EntityNode(props: any)
{
  const nodeId = props.id;
  const data = props.data;

  const [editing, setEditing] =
    useState(false);

  const [name, setName] =
    useState(data.label);


  // keep name synced with external updates (undo/redo, rename elsewhere)
  useEffect(() =>
  {
    setName(data.label);
  }, [data.label]);


  async function saveRename()
  {
    if (!name || name.trim() === "")
    {
      setEditing(false);
      setName(data.label);
      return;
    }

    try
    {
      await window.entityAPI.rename(
        nodeId,
        name
      );

      // update frontend state safely
      data.onRenameLocal?.(name);

      setEditing(false);

      console.log(
        "Rename success:",
        nodeId,
        name
      );
    }
    catch (err)
    {
      console.error(
        "Rename failed:",
        err
      );

      setEditing(false);
      setName(data.label);
    }
  }


  return (

    <div
      style={{
        background:
          data.color || "#ffffff",

        border:
          "1px solid #d1d5db",

        borderRadius: 8,

        padding: "12px",

        minWidth: 180,
        minHeight: 60,

        cursor: editing
          ? "text"
          : "grab",

        boxShadow:
          "0 2px 6px rgba(0,0,0,0.08)",

        position: "relative"
      }}
    >

      {/* RESIZER */}
      <NodeResizer
        minWidth={150}
        minHeight={50}
        isVisible={props.selected}
        lineStyle={{
          border: "1px solid #2563eb"
        }}
        handleStyle={{
          width: 8,
          height: 8,
          background: "#2563eb"
        }}
      />


      {/* INPUT HANDLE */}
      <Handle
        type="target"
        position={Position.Left}
      />


      {/* TYPE */}
      <div
        style={{
          fontSize: 10,
          color: "#666",
          marginBottom: 4
        }}
      >
        {data.type}
      </div>


      {/* NAME OR EDIT INPUT */}
      {editing ? (

        <input
          value={name}
          autoFocus

          onChange={(e) =>
            setName(e.target.value)
          }

          onBlur={saveRename}

          onKeyDown={(e) =>
          {
            if (e.key === "Enter")
              saveRename();

            if (e.key === "Escape")
            {
              setEditing(false);
              setName(data.label);
            }
          }}

          style={{
            fontWeight: "bold",
            fontSize: 14,
            width: "100%",
            border: "1px solid #999",
            borderRadius: 4,
            padding: "2px 4px"
          }}
        />

      ) : (

        <div
          onDoubleClick={() =>
          {
            console.log(
              "Rename start:",
              nodeId
            );

            setEditing(true);
          }}

          style={{
            fontWeight: "bold",
            fontSize: 14,
            color: "#222",
            wordBreak: "break-word"
          }}
        >
          {data.label}
        </div>

      )}


      {/* OUTPUT HANDLE */}
      <Handle
        type="source"
        position={Position.Right}
      />

    </div>

  );
}
