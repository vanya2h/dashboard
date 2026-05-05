import path from "node:path";
import { fileURLToPath } from "node:url";
import { lingui } from "@lingui/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "~app": path.resolve(__dirname, "./app"),
    },
  },
  plugins: [
    tailwindcss(),
    babel({
      filter: /\.(j|t)sx?$/,
      babelConfig: {
        presets: ["@babel/preset-typescript"],
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }),
    lingui(),
    reactRouter(),
  ],
  ssr: {
    noExternal: command === "build" ? true : undefined,
    optimizeDeps: {
      include: ["@prisma/client-generated"],
    },
  },
  build: {
    rollupOptions: {
      external: ["@prisma/client-generated", "@opentelemetry/api"],
    },
  },
}));
