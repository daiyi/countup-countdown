import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/" + path.basename(path.dirname(__filename)) + "/",

  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    VitePWA({
      registerType: "prompt",
      devOptions: {
        enabled: true,
      },
      workbox: {
        // cache icons too https://vite-pwa-org.netlify.app/guide/static-assets.html
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      // includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Countup Countdown",
        short_name: "countup/countdown",
        description:
          "count up & countdown to whatever you're looking forward to",
        theme_color: "#9DDB44",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/android-chrome-192x192.png?v=1",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-256x256.png?v=1",
            sizes: "256x256",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  worker: {
    format: "es",
    plugins: [wasm(), topLevelAwait()],
  },

  optimizeDeps: {
    // This is necessary because otherwise `vite dev` includes two separate
    // versions of the JS wrapper. This causes problems because the JS
    // wrapper has a module level variable to track JS side heap
    // allocations, and initializing this twice causes horrible breakage
    exclude: [
      "@automerge/automerge-wasm",
      "@automerge/automerge-wasm/bundler/bindgen_bg.wasm",
      "@syntect/wasm",
    ],
  },

  server: {
    fs: {
      strict: false,
    },
  },
});
