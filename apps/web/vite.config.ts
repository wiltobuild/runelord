import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  // Vercel serves the app from the production domain root.
  base: "/",
  server: { port: 4320, strictPort: true },
  build: { outDir: "../../dist", emptyOutDir: true },
});
