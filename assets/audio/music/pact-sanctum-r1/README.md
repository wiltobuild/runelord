# The Pact Sanctum

Dedicated opening-screen cue. Original composition and sample-free procedural synthesis: low vowel choir, bowed harmonic pads, descending bronze tolls, distant air and ritual drums. D minor with Phrygian tension; 60 BPM, 16 bars, 64 seconds, 48 kHz stereo.

Reproduce from repository root with `node tools/audio/render-pact-sanctum.mjs`. Set FFMPEG_PATH to a full FFmpeg binary with libvorbis if the local handoff FFmpeg installation is unavailable. Composition note events, seed, WAV master and exact hashes are retained here. Runtime is `apps/web/public/opening-assets/pact-sanctum.ogg` (approximately 0.95 MB). No external sample, SoundFont or recording license is needed for this new cue; existing cues retain their own credits.

The loop accumulates reverb circularly and applies a four-millisecond endpoint taper. WAV endpoints both zero. Runtime Ogg decodes to exactly 3,072,000 stereo frames (64 seconds); measured decoded peak -2.92 dBFS, RMS -18.03 dBFS, no NaN/Inf samples or clipping. Production audio metadata validator passes. Technical analysis is not subjective listening approval; speakers/headphones and the loop seam still merit user audition.

Runtime mapping: `OPENING_SCORE_ID` selects only this title cue; existing exploration, battle and boss IDs are unchanged. Browser gesture unlock and shared mute/volume are retained. Score changes use a 400 ms outgoing / 500 ms incoming fade, with asynchronous request serials preventing stale loads replacing a later scene. First successful source creation records the track ID, so failed downloads remain retryable.
