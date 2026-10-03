import { spawnSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";

// Canvas rendered this 1080p film through ffmpeg's implicit BT.470 defaults.
// Convert those pixels to BT.709 and declare every color field so browser video
// decoders do not choose a platform-specific matrix or transfer curve.
const ffmpeg = process.env.FFMPEG_PATH ?? "work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe";
const input = "apps/web/public/opening-assets/oath-intro-r7.mp4";
const temporary = `${input}.color-normalized.mp4`;
const probe = spawnSync(ffmpeg, ["-hide_banner", "-i", input], { encoding: "utf8" });
if ((probe.stderr + probe.stdout).includes("yuv420p(tv, bt709")) {
  console.log("oath-intro-r7 already has explicit BT.709 video color metadata");
  process.exit(0);
}
const result = spawnSync(ffmpeg, [
  "-y", "-i", input,
  "-map", "0:v:0", "-map", "0:a?",
  "-vf", "scale=in_range=tv:out_range=tv:in_color_matrix=bt470bg:out_color_matrix=bt709",
  "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
  "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
  "-c:a", "copy", "-movflags", "+faststart", temporary,
], { encoding: "utf8" });
if (result.status !== 0) throw new Error(result.stderr);
if (existsSync(input)) rmSync(input);
renameSync(temporary, input);
