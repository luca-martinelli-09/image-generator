import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serverPort = env.PORT || 3000;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": `http://localhost:${serverPort}`,
      },
    },
  };
});
