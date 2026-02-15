
// import React, { useState } from "react";
// import { Handle, Position } from "reactflow";

// export default function EntityNode(props: any) {

//   const { data } = props;

//   const [showPicker, setShowPicker] =
//     useState(false);

//   const backgroundColor =
//     data.color || "#ffffff";

//   const colors = [
//     "#ffffff",
//     "#dbeafe",
//     "#dcfce7",
//     "#fef3c7",
//     "#fee2e2",
//     "#ede9fe"
//   ];

//   return (

//     <div style={{

//       background: backgroundColor,

//       color: "#000",

//       padding: "10px",

//       borderRadius: "8px",

//       border: "1px solid #ccc",

//       minWidth: "180px"

//     }}>

//       <Handle type="target" position={Position.Left} />

//       <div style={{ fontSize: "11px" }}>
//         {data.type}
//       </div>

//       <div style={{ fontWeight: "bold" }}>
//         {data.label}
//       </div>

//       <Handle type="source" position={Position.Right} />

//       <div
//         className="nodrag"
//         onClick={(e) => {
//           e.stopPropagation();
//           setShowPicker(!showPicker);
//         }}
//         style={{
//           marginTop: "6px",
//           cursor: "pointer",
//           fontSize: "12px",
//           color: "#2563eb"
//         }}
//       >
//         Color
//       </div>

//       {showPicker && (

//         <div className="nodrag">

//           {colors.map(color => (

//             <div
//               key={color}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 data.setColor(color);
//                 setShowPicker(false);
//               }}
//               style={{
//                 width: 18,
//                 height: 18,
//                 background: color,
//                 display: "inline-block",
//                 margin: 3,
//                 border: "1px solid #999",
//                 cursor: "pointer"
//               }}
//             />

//           ))}

//         </div>

//       )}

//       <div
//         className="nodrag"
//         onClick={(e) => {
//           e.stopPropagation();
//           data.delete();
//         }}
//         style={{
//           marginTop: "4px",
//           fontSize: "12px",
//           color: "red",
//           cursor: "pointer"
//         }}
//       >
//         Delete
//       </div>

//     </div>

//   );

// }


import React, {
  useState
} from "react";

import {
  Handle,
  Position
} from "reactflow";

export default function EntityNode(props: any) {

  const { data } = props;

  const [editing, setEditing] =
    useState(false);

  const [name, setName] =
    useState(data.label);

  const [showPicker, setShowPicker] =
    useState(false);

  const backgroundColor =
    data.color || "#ffffff";

  const colors = [
    "#ffffff",
    "#dbeafe",
    "#dcfce7",
    "#fef3c7",
    "#fee2e2",
    "#ede9fe"
  ];


  async function saveRename() {

    await data.rename(name);

    setEditing(false);

  }


  return (

    <div style={{

      background: backgroundColor,

      color: "#000",

      padding: "10px",

      borderRadius: "8px",

      border: "1px solid #ccc",

      minWidth: "180px"

    }}>

      <Handle
        type="target"
        position={Position.Left}
      />

      <div style={{
        fontSize: "11px"
      }}>
        {data.type}
      </div>


      {editing ? (

        <input

          value={name}

          onChange={(e) =>
            setName(e.target.value)
          }

          onBlur={saveRename}

          onKeyDown={(e) => {

            if (e.key === "Enter")
              saveRename();

          }}

          autoFocus

        />

      ) : (

        <div

          onDoubleClick={() =>
            setEditing(true)
          }

          style={{
            fontWeight: "bold",
            cursor: "pointer"
          }}

        >

          {data.label}

        </div>

      )}


      <Handle
        type="source"
        position={Position.Right}
      />


      <div
        className="nodrag"
        onClick={(e) => {

          e.stopPropagation();

          setShowPicker(
            !showPicker
          );

        }}
        style={{
          fontSize: "12px",
          color: "#2563eb",
          cursor: "pointer"
        }}
      >
        Color
      </div>


      {showPicker && (

        <div>

          {colors.map(color => (

            <div

              key={color}

              onClick={() =>
                data.setColor(color)
              }

              style={{
                width: 18,
                height: 18,
                background: color,
                display: "inline-block",
                margin: 3,
                cursor: "pointer",
                border: "1px solid #999"
              }}

            />

          ))}

        </div>

      )}


      <div

        className="nodrag"

        onClick={() =>
          data.delete()
        }

        style={{
          fontSize: "12px",
          color: "red",
          cursor: "pointer"
        }}

      >

        Delete

      </div>

    </div>

  );

}
