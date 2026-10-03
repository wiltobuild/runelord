# Runelord art & style atlas

Run `node style-gallery/server.mjs` from the project root, then visit http://localhost:4317.

The gallery scans artwork and animation previews from every source in `sources.json` in a background worker. Frame, source, layer, and template directories are skipped. The primary source is the project's `assets/` directory; the second source is the existing character studio checkout. Add an image or video anywhere under either asset folder and it appears on the next ten-second refresh while the server is running. Restart after reboot using the supplied launcher. For new art awaiting review, use `submit.mjs` to copy it into the approval inbox with subject and revision metadata; see [the art workflow](../design/art-approval-workflow.md).

Images are grouped using folder paths (`heroes`, `characters/<name>`, `cards`, `style-references`). Card names/categories come from `cards/card-art-index.json` where available. New folders and subjects are discovered automatically. Production layers, templates, and animation frames are excluded from browsing, search, and All art; their files remain in the repository. Byte-identical files are deduplicated, with additional locations visible in the detail view.

Open any artwork and use **Approve design**, **Request changes**, or **Reset to pending**, with an optional review note. Decisions persist in `assets/approvals/decisions.json`, keyed by the SHA-256 of the exact bytes. The latest gallery decision overrides older approval.json and card-index metadata. The API refuses approval if the file changed after it was opened. Newly submitted art remains pending unless its exact bytes already have approval. Gallery decisions are read by Codex on its next task/resume or approval-gate check; they do not wake an idle chat. Visual approval does not replace technical QA.

Supported media: PNG, JPEG, WebP, GIF, SVG, MP4, WebM. SVG source files are rendered as images. The server listens only on loopback, ignores symlinks, and serves only discovered media and gallery files. Approval writes require a same-origin request and a session token. Retired reference hashes in `excluded-art.json` are excluded even if a copy is reintroduced. Edit the source list to include additional Runelord asset locations.

## Browsing

Finished Cards and standalone Card artwork are separate categories. Animated subjects appear once, with their designs and animation revisions collected in one card. Click **Play** to cycle states, select a state directly, or uncheck **Cycle states** to loop that state. Only one card plays at a time; changing views, opening a review, or hiding the page stops playback. Previews load only when played. State timing comes from animation manifests when available (otherwise a four-second preview interval).

**Review this state** opens approval for the exact selected animation. The review selector exposes every design and animation revision in the card. Approval status filters and Needs review include pending states even when the base design is approved. Approving one revision never approves the other states.

The sidebar shows counts of cards rather than production files. Search combines words across titles, subjects, categories, member states and paths. Filter by subject, approval status, format or source, then choose Grid, Compact or List. Filters and layout are stored in the URL. Old Production assets links fall back to Browse; production=1 no longer expands API results.

The server serves the last complete catalogue while the worker refreshes it. Unchanged artwork hashes are cached across scans. `/api/item/<id>` opens an exact design or state for review. New artwork and preview GIF/MP4/WebM files appear automatically on subsequent refreshes. Raw frame-only exports need a preview file to be playable here. Media requests use revisioned URLs for browser caching.
