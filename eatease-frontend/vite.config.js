
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", 
      },
    },
  },
});
