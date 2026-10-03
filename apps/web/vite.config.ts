import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  // GitHub Pages serves this repository below /runelord/.
  base: "/runelord/",
  server: { port: 4320, strictPort: true },
  build: { outDir: "../../dist", emptyOutDir: true },
});
