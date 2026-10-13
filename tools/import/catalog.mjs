import fs from "node:fs";
const rows = fs
  .readFileSync("catalog/cards-warlock.md", "utf8")
  .split(/\r?\n/)
  .filter((s) => /^\| \d+ \|/.test(s))
  .map((s) => {
    const [, number, name, cost, type, rarity, effect, upgrade] = s
      .split("|")
      .map((x) => x.trim().replaceAll("**", ""));
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      number: Number(number),
      name,
      cost,
      type,
      rarity,
      text: effect.replaceAll("**", ""),
      upgrade,
    };
  });
const expected = { Basic: 4, Common: 18, Uncommon: 29, Rare: 24, Ultimate: 2 };
if (rows.length !== 77 || new Set(rows.map((r) => r.id)).size !== 77)
  throw Error("Expected 77 unique Warlock cards");
for (const [rarity, count] of Object.entries(expected))
  if (rows.filter((r) => r.rarity === rarity).length !== count)
    throw Error(`Rarity mismatch: ${rarity}`);
fs.mkdirSync("packages/content", { recursive: true });
fs.writeFileSync(
  "packages/content/warlock-catalog.json",
  JSON.stringify(rows, null, 2) + "\n",
);
console.log(
  "Imported 77 Warlock card definitions; rarity counts and unique IDs pass. Design-only Echoes omitted. Effect handlers are implemented separately.",
);
