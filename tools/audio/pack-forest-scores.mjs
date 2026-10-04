import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

// Technical derivatives only: keep the original compositions, MIDI, stems and
// lossless delivered masters in assets/audio/music/forest-r1 unchanged.
const root = "assets/audio/music/forest-r1";
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const encoder = process.env.FFMPEG || "ffmpeg";
const records = [];
for (const slug of ["04_lanterns_in_the_hollow", "06_the_silent_conclave"]) {
  const source = `${root}/${slug}/${slug}.wav`, output = `${root}/${slug}/${slug}.ogg`;
  const settings = ["-c:a", "libvorbis", "-q:a", "6", "-map_metadata", "-1"];
  execFileSync(encoder, ["-hide_banner", "-loglevel", "error", "-y", "-i", source, ...settings, output]);
  records.push({ source, sourceSha256: hash(source), output, outputSha256: hash(output), settings, encodedBytes: fs.statSync(output).size, playback: "Original sample-count loop bounds; ScorePlayer tapers decoded endpoints by 4ms." });
}
fs.writeFileSync(`${root}/runtime-derivatives.json`, JSON.stringify({ encoder: "ffmpeg/libvorbis", records }, null, 2) + "\n");
console.log(records);
