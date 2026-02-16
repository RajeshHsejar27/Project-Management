

// import React from "react";

// import {

//   Handle,

//   Position

// } from "reactflow";

// export default function EntityNode(props: any) {

//   const {

//     data

//   } = props;


//   return (

//     <div

//       onContextMenu={(e) => {

//         e.preventDefault();

//         data.openContextMenu(

//           e.clientX,

//           e.clientY

//         );

//       }}

//       style={{

//         background:

//           data.color ||

//           "#ffffff",

//         padding: 10,

//         border:

//           "1px solid #ccc",

//         borderRadius: 8,

//         minWidth: 180

//       }}

//     >

//       <Handle

//         type="target"

//         position={Position.Left}

//       />

//       <div

//         style={{

//           fontSize: 11

//         }}

//       >

//         {data.type}

//       </div>

//       <div

//         style={{

//           fontWeight: "bold"

//         }}

//       >

//         {data.label}

//       </div>

//       <Handle

//         type="source"

//         position={Position.Right}

//       />

//     </div>

//   );

// }



import { Handle, Position } from "reactflow";
import { useState } from "react";

export default function EntityNode(props: any) {

  const nodeId = props.id;
  const data = props.data;

  const [editing, setEditing] =
    useState(false);

  const [name, setName] =
    useState(data.label);

  async function saveRename() {

    if (!name || name.trim() === "") {

      setEditing(false);
      return;

    }

    try {

      await window.entityAPI.rename(
        nodeId,
        name
      );

      data.onRenameLocal?.(name);

      setEditing(false);

      console.log(
        "Rename success:",
        nodeId,
        name
      );

    }
    catch (err) {

      console.error(
        "Rename failed:",
        err
      );

    }

  }

  return (

    <div

      style={{
        background: data.color || "#ffffff",
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 12,
        minWidth: 180,
        cursor: "grab"
      }}

    >

      <Handle type="target" position={Position.Left} />

      <div style={{
        fontSize: 10,
        color: "#666"
      }}>
        {data.type}
      </div>

      {editing ? (

        <input

          value={name}

          autoFocus

          onChange={(e) =>
            setName(e.target.value)
          }

          onBlur={saveRename}

          onKeyDown={(e) => {

            if (e.key === "Enter")
              saveRename();

            if (e.key === "Escape")
              setEditing(false);

          }}

          style={{
            fontWeight: "bold",
            fontSize: 14,
            width: "100%",
            border: "1px solid #999"
          }}

        />

      ) : (

        <div

          onDoubleClick={() => {

            console.log(
              "Rename start:",
              nodeId
            );

            setEditing(true);

          }}

          style={{
            fontWeight: "bold",
            fontSize: 14,
            color: "#222"
          }}

        >
          {data.label}
        </div>

      )}

      <Handle type="source" position={Position.Right} />

    </div>

  );

}
