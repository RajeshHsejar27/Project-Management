import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({

  root: path.resolve(__dirname, "frontend"),

  plugins: [react()],

  build: {
    outDir: path.resolve(__dirname, "dist-react"),
    emptyOutDir: true
  },

  server: {
    port: 5173
  }

});
