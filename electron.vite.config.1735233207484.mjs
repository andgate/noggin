// electron.vite.config.ts
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "path";
var __electron_vite_injected_dirname = "C:\\Users\\andgate\\Projects\\noggin";
var electron_vite_config_default = defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/main/index.ts")
        }
      }
    },
    resolve: {
      alias: {
        "@noggin/types": resolve("src/types"),
        "@noggin/common": resolve("src/common")
      }
    },
    plugins: [externalizeDepsPlugin({ exclude: ["lodash"] })]
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/preload/index.ts")
        }
      }
    },
    resolve: {
      alias: {
        "@noggin/types": resolve("src/types")
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: "./src/renderer/",
    build: {
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/renderer/index.html")
        }
      }
    },
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@noggin/types": resolve("src/types"),
        "@noggin/common": resolve("src/common")
      }
    },
    plugins: [TanStackRouterVite(), viteReact()],
    css: {
      postcss: "./postcss.config.cjs"
    },
    server: {
      port: 33482
    },
    test: {
      exclude: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/*.e2e.*"],
      reporters: ["default", "html"],
      environment: "happy-dom",
      globals: true,
      setupFiles: [resolve(__electron_vite_injected_dirname, "./test/setup.ts")]
    }
  }
});
export {
  electron_vite_config_default as default
};
