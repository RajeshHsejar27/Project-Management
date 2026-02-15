import React from "react";

import { ReactFlowProvider } from "reactflow";

import GraphEditor from "./graph/GraphEditor";


export default function App() {

  return (

    <ReactFlowProvider>

      <GraphEditor />

    </ReactFlowProvider>

  );

}
