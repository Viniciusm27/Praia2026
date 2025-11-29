import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/Praia2026/", // <--- IMPORTANTE: O nome do seu repositório entre barras
});
