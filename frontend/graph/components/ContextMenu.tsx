// import React, { useEffect, useRef } from "react";

// interface Props {
//   x: number;
//   y: number;
//   onRename: () => void;
//   onDelete: () => void;
//   onColor: (color: string) => void;
//   onClose: () => void;
// }

// export default function ContextMenu({
//   x,
//   y,
//   onRename,
//   onDelete,
//   onColor,
//   onClose
// }: Props) {

//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {

//     function handleClickOutside(event: MouseEvent) {

//       if (
//         ref.current &&
//         !ref.current.contains(event.target as Node)
//       ) {
//         onClose();
//       }

//     }

// document.addEventListener(
//   "click",
//   handleClickOutside
// );


//     return () =>
//       document.removeEventListener(
//         "click",
//         handleClickOutside
//       );

//   }, [onClose]);


//   const colors = [
//     "#ffffff",
//     "#dbeafe",
//     "#dcfce7",
//     "#fef3c7",
//     "#fee2e2",
//     "#ede9fe"
//   ];


//   return (

//     <div
//       ref={ref} 
//       style={{
//         position: "absolute",
//         top: y,
//         left: x,
//         background: "#fff",
//         border: "1px solid #ccc",
//         borderRadius: 6,
//         padding: 8,
//         boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
//         zIndex: 1000
//       }}
//     >

// <div
//   style={itemStyle}
//   onMouseDown={(e) => e.stopPropagation()} // 1. Stops React Flow from grabbing the event
//   onClick={(e) => {
//     e.stopPropagation(); // 2. Stops the 'click outside' listener from firing
//     onRename();
//   }}
// >
//   Rename
// </div>

//       <div
//         style={itemStyle}
//         onClick={onDelete}
//       >
//         Delete
//       </div>

//       <div style={{ marginTop: 5 }}>

//         Color:

//         <div>

//           {colors.map(color => (

//             <span
//               key={color}
//               onClick={() =>
//                 onColor(color)
//               }
//               style={{
//                 ...colorStyle,
//                 background: color
//               }}
//             />

//           ))}

//         </div>

//       </div>

//     </div>

//   );

// }

// const itemStyle = {
//   padding: "4px 8px",
//   cursor: "pointer"
// };

// const colorStyle = {
//   width: 16,
//   height: 16,
//   display: "inline-block",
//   margin: 3,
//   border: "1px solid #999",
//   cursor: "pointer"
// };


import React, { useEffect, useRef } from "react";

interface Props {
  x: number;
  y: number;
//   onRename: (e: React.MouseEvent) => void; // Pass the event
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
    document.addEventListener("mousedown", handleClickOutside); // Use mousedown for faster response
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const colors = ["#ffffff", "#dbeafe", "#dcfce7", "#fef3c7", "#fee2e2", "#ede9fe"];

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: y,
        left: x,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: 6,
        padding: 8,
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
      onContextMenu={(e) => e.preventDefault()} // Block nested context menus
    >


{/* 
<div 
  style={itemStyle} 
  onMouseDown={(e) => {
    e.stopPropagation(); // Stop React Flow from seeing this
    e.preventDefault();  // Stop browser defaults
    console.log("LOG TEST: MOUSE DOWN ON RENAME"); 
    onRename(e);
  }}
>
  Rename
</div> */}

      <div 
        style={itemStyle} 
        onClick={(e) => onDelete(e)}
      >
        Delete
      </div>

      <div style={{ marginTop: 5, fontSize: "12px", color: "#666" }}>
        Color:
        <div style={{ marginTop: 4 }}>
          {colors.map((color) => (
            <span
              key={color}
              onClick={(e) => onColor(color, e)}
              style={{ ...colorStyle, background: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const itemStyle = { padding: "4px 8px", cursor: "pointer", fontSize: "14px" };
const colorStyle = { width: 16, height: 16, display: "inline-block", margin: 2, border: "1px solid #999", cursor: "pointer", borderRadius: "2px" };