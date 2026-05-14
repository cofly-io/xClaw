/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vitest plugin: transforms .css imports inside node_modules to empty stubs.
// This prevents errors from packages like @agentscope-ai/icons that import CSS.
const cssStubPlugin = {
  name: "css-stub",
  transform(_code: string, id: string) {
    if (id.includes("node_modules") && id.endsWith(".css")) {
      return { code: "export default {}" };
    }
  },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Empty = same-origin; frontend and backend served together, no hardcoded host.
  // Use a dedicated Vite-prefixed key so unrelated shell BASE_URL values don't leak into the build.
  const apiBaseUrl = env.VITE_API_BASE_URL ?? "";

  return {
    define: {
      VITE_API_BASE_URL: JSON.stringify(apiBaseUrl),
      TOKEN: JSON.stringify(env.TOKEN || ""),
      MOBILE: false,
    },
    plugins: [react(), cssStubPlugin],
    css: {
      modules: {
        localsConvention: "camelCase",
        generateScopedName: "[name]__[local]__[hash:base64:5]",
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // CodeMirror throws if multiple @codemirror/state instances are loaded.
      // Dedupe forces Vite to resolve them from a single location.
      dedupe: [
        "@codemirror/state",
        "@codemirror/view",
        "@codemirror/language",
        "@codemirror/autocomplete",
        "@uiw/react-codemirror",
      ],
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8088",
          changeOrigin: true,
        },
        "/ws": {
          target: "ws://127.0.0.1:8088",
          ws: true,
          changeOrigin: true,
        },
      },
    },
    // build: {
    //   // Output to xClaw's console directory,
    //   // so we don't need to copy files manually after build.
    //   outDir: path.resolve(__dirname, "../src/xclaw/console"),
    //   emptyOutDir: true,
    // },
  };
});
