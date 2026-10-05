import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("loadAssets conditionally revalidates the runtime manifest", () => {
  const source = readFileSync(new URL("./assets.ts", import.meta.url), "utf8");
  assert.match(
    source,
    /fetch\(`\$\{import\.meta\.env\.BASE_URL\}game-assets\/manifest\.json`,\s*\{\s*cache:\s*"no-cache"/,
  );
});
