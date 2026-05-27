import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite is the local development server and production builder for this React app.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173
  }
});
