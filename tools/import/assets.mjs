import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { integrateCinematicSummons } from "./cinematic-summons.mjs";
const out = "apps/web/public/game-assets";
fs.mkdirSync(out, { recursive: true });
const previous = fs.existsSync("packages/assets/manifest.json") ? JSON.parse(fs.readFileSync("packages/assets/manifest.json", "utf8")) : { provenance: [] };
const ledger = JSON.parse(
  fs.readFileSync("assets/approvals/decisions.json", "utf8"),
);
const manifest = {
  schema: 1,
  images: {},
  cards: {},
  animations: {},
  actors: {},
  music: {},
  provenance: [],
};
const hash = (p) =>
  crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
async function pack(source, destination, width = 900, lossless = false) {
  const sha256 = hash(source),
    decision = ledger.decisions[sha256];
  if (decision?.status === "Needs revision")
    throw Error(`Asset needs revision: ${source}`);
  const dest = path.join(out, destination);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const transform = { width, withoutEnlargement: true, format: "webp", quality: 88, alphaQuality: 100, lossless };
  const cached = previous.provenance.find((p) => p.output === destination);
  if (!fs.existsSync(dest) || cached?.sha256 !== sha256 || JSON.stringify(cached?.transform) !== JSON.stringify(transform) || cached?.outputSha256 !== hash(dest))
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 100, lossless })
      .toFile(dest);
  manifest.provenance.push({
    source: path.resolve(source),
    sha256,
    status: decision?.status ?? "Unreviewed",
    evidenceId: decision?.evidenceId ?? null,
    output: destination,
    transform,
    outputSha256: hash(dest),
  });
  return "/game-assets/" + destination;
}
for (const [id, source] of Object.entries({
  brand: "assets/objects/brand-of-the-pit/r1/icon-128.png",
  potion: "assets/objects/healing-draught/r1/icon-96.png",
  forge:
    "assets/environments/cinderforge-approach/r1/cinderforge-approach-r1.png",
  forest: "assets/environments/thornroot-crossing/r1/thornroot-crossing-r1.png",
  arena:
    "assets/environments/cinderforge-caldera/r1/cinderforge-caldera-r1.png",
  goblin: "assets/characters/cinderhook-marauder/variants-nine-2026-10-02/v01-cleaver-bruiser-r1.png",
  skirmisher: "assets/characters/cinderhook-marauder/variants-nine-2026-10-02/v07-ashknife-cutthroat-r1.png",
  briarjaw: "assets/characters/briarjaw-ambusher/base-r1.png",
  tollbell: "assets/characters/tollbell-penitent/base-r1.png",
  warlock: "assets/heroes/references/warlock/warlock-base-r1.png",
  "demon-throne": "assets/environments/demon-throne/r1/demon-throne-r1.png",
  "item-demon-crown": "assets/objects/demon-crown/r1/icon-128.png",
}))
  manifest.images[id] = await pack(
    source,
    `images/${id}.webp`,
    ["forge", "forest", "arena", "demon-throne"].includes(id) ? 1672 : 850,
  );
const catalog = JSON.parse(
  fs.readFileSync("packages/content/warlock-catalog.json", "utf8"),
);
for (const id of ["healing-draught", "mana-potion", "barkskin-tonic", "shrapnel-jar", "banner-draught", "bonesetters-salve", "warhorn-oil"])
  manifest.images[`item-${id}`] = await pack(`assets/objects/${id}/r1/icon-96.png`, `items/${id}.webp`, 96, true);
for (const { id } of catalog) {
  const source = `assets/cards/warlock-2026-10-02/${id}/r1/${id}-r1.png`;
  if (fs.existsSync(source))
    manifest.cards[id] = await pack(source, `cards/${id}.webp`, 600);
  const illustration = `assets/cards/warlock-2026-10-02/${id}/r1/illustration.png`;
  if (
    fs.existsSync(illustration) &&
    ["summon-hellhound", "summon-pit-brute"].includes(id)
  )
    manifest.images[id] = await pack(illustration, `images/${id}.webp`, 400);
}
manifest.cards["summon-imp"] = await pack(
  "assets/cards/reference-samples/warlock-summon-imp.png",
  "cards/summon-imp.webp",
  600,
);
// Summons are the user's standalone character masters, never card portraits.
for (const kind of ["imp", "hellhound", "pit-brute"]) {
  manifest.images[`summon-${kind}`] = await pack(
    `assets/characters/warlock-${kind}/base/r1/warlock-${kind}-base-r1.png`,
    `summons/${kind}.webp`,
    700,
  );
}
// Normalize the two existing enemy export formats without changing registration.
for (const [id, folder, variant] of [
  ["briarjaw", "briarjaw-ambusher/animation/r1", null],
  ["tollbell", "tollbell-penitent/animation/r1", null],
]) {
  const directory = `assets/characters/${folder}`;
  const source = JSON.parse(
    fs.readFileSync(`${directory}/manifest.json`, "utf8"),
  );
  const data = variant ? source.variants[variant] : source;
  const files = await Promise.all(
    data.frames.map((f, i) =>
      pack(`${directory}/${f.file}`, `actors/${id}/${i}.webp`, 512),
    ),
  );
  const states = {};
  for (const [name, clip] of Object.entries(data.animations || data.states)) {
    const durations = clip.durations_ms || clip.duration_ms;
    const times = Array.isArray(durations) ? durations : clip.durations;
    let time = 0;
    const frames = clip.frames.map((index, i) => {
      const frame = { time, src: files[index] };
      time += times[i];
      return frame;
    });
    states[name] = {
      frames,
      duration: time,
      loop: clip.loop,
      impact:
        clip.event?.impact_ms ??
        clip.events?.find((e) => e.name === "impact")?.time_ms ??
        null,
    };
  }
  manifest.actors[id] = {
    states,
    size: source.frame_canvas || source.frame_size,
    anchor: source.anchor || source.ground_anchor,
  };
}
// Fire goblins replace the opening enemies; keep IDs compatible with existing saves.
for (const [id, variant] of [["goblin", "v01-cleaver-bruiser"], ["skirmisher", "v07-ashknife-cutthroat"],
  ["spear-guard", "v02-ash-spear-guard"], ["twinaxe-reaver", "v03-twinaxe-reaver"],
  ["crossbow-scout", "v04-cinder-crossbow-scout"], ["emberbow-hunter", "v05-emberbow-hunter"],
  ["forgehammer-sapper", "v06-forgehammer-sapper"], ["coalhex-shaman", "v08-coalhex-shaman"],
  ["scarblade-captain", "v09-scarblade-captain"],
  ["cindermaw-salamander", null], ["slagheart-juggernaut", null],
  ["coalhorn-ram", null], ["furnace-beetle", null], ["demon-lord", null]]) {
  const directory = variant ? `assets/characters/cinderhook-marauder/animation-nine-2026-10-02/${variant}` : `assets/animations/${id === "coalhorn-ram" ? "fire-demo-r2" : "fire-demo-r1"}/${id}`;
  const source = JSON.parse(fs.readFileSync(`${directory}/manifest.json`, "utf8"));
  const states = {};
  const files = new Map();
  for (const [name, clip] of Object.entries(source.states)) {
    let time = 0;
    const frames = [];
    for (const frame of clip.frames) {
      if (!(frame.durationMs > 0)) throw Error(`Invalid fire goblin timing: ${variant}/${name}`);
      if (!files.has(frame.file)) files.set(frame.file, await pack(`${directory}/${frame.file}`, `actors/${id}/fire-${id === "coalhorn-ram" ? "repair-r2" : variant}/${frame.file.replace(/\.png$/, ".webp")}`, source.canvas.width, true));
      frames.push({ time, src: files.get(frame.file), ...(frame.effects ? { effects: frame.effects } : {}) });
      time += frame.durationMs;
    }
    states[name] = { frames, duration: time, loop: clip.loop,
      impact: clip.events?.find(event => event.name === "impact")?.timeMs ?? null };
  }
  // Stabilize idle registration against the planted lower body, preserving pose motion.
  { // Audit every fire actor; only excessive lateral drift needs correction.
    for (const state of ["idle", "wounded_idle"]) {
      const clip=states[state], originalClip=source.states[state];
      if(!clip) continue;
      const centers=[];
      for(const frame of originalClip.frames) {
        const {data,info}=await sharp(`${directory}/${frame.file}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
        let weight=0, moment=0;
        for(let y=Math.floor(info.height*.66);y<Math.floor(info.height*.9);y++)for(let x=0;x<info.width;x++) {
          const a=data[(y*info.width+x)*4+3];weight+=a;moment+=x*a;
        }
        centers.push(weight?moment/weight:source.anchor.x);
      }
      const drift=Math.max(...centers)-Math.min(...centers);
      if(drift>6) clip.frames.forEach((frame,i)=>{frame.offsetX=Number(((centers[0]-centers[i])*.9).toFixed(3));});
    }
  }
  manifest.actors[id] = { deathEffect: "fire", states, size: [source.canvas.width, source.canvas.height], anchor: [source.anchor.x, source.anchor.y],
    sourceManifest: { path: `${directory}/manifest.json`, sha256: hash(`${directory}/manifest.json`) } };
  const ranged = {
    "emberbow-hunter": { kind: "flaming-arrow", origin: [.31, .48], travelMs: 520 },
    "crossbow-scout": { kind: "crossbow-bolt", origin: [.30, .48], travelMs: 430 },
      "coalhex-shaman": { kind: "demon-bolt", origin: [.30, .40], travelMs: 560 },
      "demon-lord": { kind: "demon-bolt", origin: [.26, .43], travelMs: 650 },
  }[id];
  if (ranged) manifest.actors[id].ranged = ranged;
  manifest.images[id] = states.idle.frames[0].src;
}
// Current user-authorized whole-character asset. The Seraph replaces the old
// Warlock presentation only; gameplay keeps its Warlock class/content ID.
const root = "assets/heroes/animations/abyssal-seraph/frames32-r2";
const original = JSON.parse(fs.readFileSync(`${root}/animation.json`, "utf8"));
const frameIndex = original.frames;
const sourceEvidence = (file) => {
  const sha256 = hash(file), decision = ledger.decisions[sha256];
  if (decision?.status === "Needs revision") throw Error(`Asset needs revision: ${file}`);
  return { source: path.resolve(file), sha256, status: decision?.status ?? "Pending approval", evidenceId: decision?.evidenceId ?? null };
};
manifest.integration = {
  authorization: "User explicitly authorized the approved-for-integration Abyssal Seraph 32-frame package to replace the Warlock visual model. Ledger status is preserved and not relabeled approved.",
  hero: { revision: original.revision, manifest: sourceEvidence(`${root}/manifest.json`), animation: sourceEvidence(`${root}/animation.json`), master: sourceEvidence(`${root}/source/master.png`), frameCount: frameIndex.length, stateCount: Object.keys(original.states).length, facing: "right" },
  summons: {},
};
const heroFiles = [];
for (const f of frameIndex) {
  if (hash(`${root}/${f.file}`) !== f.sha256) throw Error(`Hero frame hash mismatch: ${f.file}`);
  heroFiles.push(await pack(`${root}/${f.file}`, `warlock/abyssal-seraph-r2/${heroFiles.length}.webp`, original.frame_canvas[0], true));
}
function normalizeClip(clip, files, hero = false) {
  let time = 0;
  const durations = clip.durations_ms;
  const frames = clip.frames.map((index, i) => {
    if (!files[index] || !(durations[i] > 0)) throw Error("Invalid animation frame or duration");
    const frame = { time, [hero ? "body" : "src"]: files[index], ...(clip.opacity ? { opacity: clip.opacity[i] } : {}) };
    time += durations[i];
    return frame;
  });
  const events = (clip.events || []).map((e) => ({ name: e.name, time_ms: e.time_ms ?? e.timeMs ?? e.at_ms, ...(e.attachment ? { attachment: e.attachment } : {}) }));
  return { frames, duration: time, loop: clip.loop, terminalHold: clip.terminalHold, events, impact: events.find((e) => ["impact", "release", "impact_or_release", "cast-release"].includes(e.name))?.time_ms ?? null, ...(hero ? { size: original.frame_canvas, anchor: original.anchor } : {}) };
}
for (const [state, clip] of Object.entries(original.states)) {
  const runtimeClip = normalizeClip(clip, heroFiles, true);
  if (state === "idle" || state === "wounded_idle") {
    runtimeClip.duration *= 1.2;
    runtimeClip.frames = runtimeClip.frames.map((frame) => ({ ...frame, time: frame.time * 1.2 }));
    runtimeClip.events = runtimeClip.events.map((event) => ({ ...event, time_ms: event.time_ms * 1.2 }));
  }
  const attachment = runtimeClip.events.find((event) => event.attachment)?.attachment;
  if (attachment) runtimeClip.releaseOrigin = [attachment.x, attachment.y];
  // Extended palm in attack-03, at the authored 435ms release.
  if (state === "attack") runtimeClip.releaseOrigin = [450, 348];
  manifest.animations[state] = runtimeClip;
}
manifest.integration.hero.idleDurationMultiplier = 1.2;
manifest.integration.hero.releaseOrigins = { coordinateSystem: "Native 768x896 Seraph frame coordinates; authored event attachment", cast: { frame: "frames/cast-03.png", timeMs: 450, xy: [471, 333] } };
manifest.integration.summonPresentation = { hudPixelsPerWorldUnit: 200, overrides: { hellhound: { hudPixelsPerWorldUnit: 225.8064515, visibleHeightPx: 140 } }, visibleHeightPx: { imp: 90, hellhound: 140, "pit-brute": 230 }, reason: "User requested Imp one third larger and other summons at enemy scale, then reduced Hellhound by 30% from 200px to 140px. Hellhound presentation overrides relative source proportions; every actor retains one uniform scale across its complete animation.", root: "Source root anchored to model container bottom; same transform across all frames." };
// Existing director cues map explicitly onto the six authored states; no invented poses.
const aliases = { idle_breathe: "idle", firebolt: "attack", summon_demon: "cast", blood_pact: "cast", guard_enter: "cast", guard_impact: "hit", hit_light: "hit", victory: "idle", empowered_idle: "idle", empowered_attack: "attack" };
for (const [alias, state] of Object.entries(aliases)) manifest.animations[alias] = { ...manifest.animations[state], sourceState: state };
manifest.integration.hero.aliases = aliases;
manifest.integration.hero.sheets = [...new Set(frameIndex.map((f) => f.file))].map((file) => sourceEvidence(`${root}/${file}`));
manifest.images.warlock = heroFiles[0];
for (const [kind, revision, dir] of [
  ["imp", "base-r1", "assets/characters/warlock-summons/animations/base-r1/warlock-imp"],
  ["hellhound", "base-r1", "assets/characters/warlock-summons/animations/base-r1/warlock-hellhound"],
  ["pit-brute", "hd-r1", "assets/characters/warlock-pit-brute/animations/hd-r1"],
  ["imp-flight", "flight-r1", "assets/characters/warlock-summons/animations/flight-r1/warlock-imp"],
]) {
  const source = JSON.parse(fs.readFileSync(`${dir}/animation.json`, "utf8"));
  const evidence = { revision, manifest: sourceEvidence(`${dir}/animation.json`), master: sourceEvidence(source.base.asset), sheet: sourceEvidence(`${dir}/${source.source_sheet.file}`) };
  if (evidence.master.sha256 !== source.base.sha256 || evidence.sheet.sha256 !== source.source_sheet.sha256) throw Error(`Summon source hash mismatch: ${kind}`);
  if (source.source_sheets) evidence.sheets = source.source_sheets.map((sheet) => {
    const record = sourceEvidence(`${dir}/${sheet.file}`);
    if (record.sha256 !== sheet.sha256) throw Error(`Summon sheet hash mismatch: ${kind}`);
    return record;
  });
  const files = [];
  for (const frame of source.frames) {
    if (frame.sha256 && hash(`${dir}/${frame.file}`) !== frame.sha256) throw Error(`Summon frame hash mismatch: ${kind}/${frame.file}`);
    files[frame.id] = await pack(`${dir}/${frame.file}`, `summons/${kind}/${revision}/${frame.id}.webp`, source.geometry.canvas_px[0], kind === "pit-brute");
  }
  const states = Object.fromEntries(Object.entries(source.animations).map(([name, clip]) => [name, normalizeClip(clip, files)]));
  states.attack = { ...states.act, sourceState: "act" };
  const boxes = source.frames.map((frame) => frame.visible_bbox);
  const layout_bounds_px = [Math.min(...boxes.map((b) => b[0])), Math.min(...boxes.map((b) => b[1])), Math.max(...boxes.map((b) => b[2])), Math.max(...boxes.map((b) => b[3]))];
  manifest.actors[`summon-${kind}`] = { states, size: source.geometry.canvas_px, anchor: source.geometry.root_px, geometry: { ...source.geometry, layout_bounds_px } };
  manifest.images[`summon-${kind}`] = files[0];
  manifest.integration.summons[kind] = evidence;
}
// Enemy reinforcements share approved summon animation bytes, without ally world-scale metadata.
for (const [id, kind] of [["boss-imp", "imp"], ["boss-hellhound", "hellhound"]]) {
  const source = manifest.actors[`summon-${kind}`];
  manifest.actors[id] = { states: source.states, size: source.size, anchor: source.anchor, deathEffect: "fire" };
  if (kind === "imp") manifest.actors[id].ranged = {kind:"demon-bolt",origin:[.28,.52],travelMs:520};
  manifest.images[id] = manifest.images[`summon-${kind}`];
}
await integrateCinematicSummons(manifest);
const musicRoot = process.env.RUNELORD_MUSIC_ROOT || "assets/audio/music";
const tracks = JSON.parse(
  fs.readFileSync(path.join(musicRoot, "loop_manifest.json"), "utf8"),
);
for (const [i, id] of ["explore", "battle", "boss"].entries()) {
  const t = tracks[i],
    source = path.join(musicRoot, t.slug, t.slug + ".wav");
  const destination = `music/${t.slug}.wav`;
  fs.mkdirSync(path.join(out, "music"), { recursive: true });
  fs.copyFileSync(source, path.join(out, destination));
  manifest.music[id] = {
    url: "/game-assets/" + destination,
    title: t.title,
    start: t.loop_start_sample / t.sample_rate,
    end: t.loop_end_sample_exclusive / t.sample_rate,
  };
  manifest.provenance.push({
    source,
    sha256: hash(source),
    output: destination,
    status: "User requested existing score",
  });
}
fs.copyFileSync(
  path.join(musicRoot, "GeneralUser-GS-license.txt"),
  path.join(out, "music/GeneralUser-GS-license.txt"),
);
const demonMusic = "assets/audio/music/demon-lord-r1/demon-lord.wav";
fs.copyFileSync(demonMusic, path.join(out, "music/demon-lord.wav"));
manifest.music["demon-boss"] = {url:"/game-assets/music/demon-lord.wav",title:"Crown of the Ninth Pit",start:0,end:90};
manifest.provenance.push({source:demonMusic,sha256:hash(demonMusic),output:"music/demon-lord.wav",status:"User requested original boss score arrangement"});
fs.mkdirSync("packages/assets", { recursive: true });
fs.writeFileSync(
  "packages/assets/manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
const { provenance, integration, ...runtime } = manifest;
fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(runtime));
console.log(
  `Packed ${manifest.provenance.length} assets from existing collection; ${Object.keys(manifest.cards).length} cards, ${Object.keys(manifest.animations).length} Warlock states, ${Object.keys(manifest.actors).length} enemy animation sets, 3 original scores. Original files unchanged.`,
);
