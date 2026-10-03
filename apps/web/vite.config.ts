import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  // Keep local development at / while Pages builds live beneath the repository.
  base: process.env.GITHUB_ACTIONS ? "/runelord/" : "/",
  server: { port: 4320, strictPort: true },
  build: { outDir: "../../dist", emptyOutDir: true },
});
