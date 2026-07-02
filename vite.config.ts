import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@routes": path.resolve(__dirname, "./src/routes"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
});
