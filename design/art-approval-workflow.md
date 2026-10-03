# Runelord art approvals and reference library

The live gallery at http://localhost:4317 is the user's review surface. Start it with `node style-gallery/server.mjs` or `style-gallery/start.ps1`.

## Submit before asking for approval

Every Runelord art-producing skill must copy each new base, variant, card, repair, or animation review preview into `assets/approvals/inbox/<subject>/<revision>/` **before** asking the user to approve it. Use:

`node style-gallery/submit.mjs <absolute-image-or-video-path> <subject-slug> <revision> <group> <display-name>`

Groups: `Heroes`, `Characters`, `Cards`, `Card artwork`, `Animations`, `Animation studies`, `Environments`, `Objects`, `Other art`. Use `Cards` for the completed framed card and `Card artwork` for its standalone illustration. Quote arguments containing spaces. This copies the exact file, writes its display metadata, refuses to overwrite a different revision, and prints its hash and gallery location. Preserve production sources and technical manifests in their existing asset folders. For animation submit an actual playable GIF/video and key-pose review images; retain all exported frames for QA. A preview approval is not an assertion that unreviewed frames passed QA.

## Read actual user decisions

The authoritative ledger is `assets/approvals/decisions.json`. A decision is keyed by the lowercase SHA-256 of the actual file bytes. `decisions[sha256].status` is `Approved`, `Needs revision`, or `Pending approval`; `evidenceId` links to the user's action, timestamp, and optional note. `history` preserves earlier decisions. Read this ledger at the start of a task, before generating the next batch/stage, when resuming, and before animation handoff. The gallery also returns current merged statuses from `GET /api/art`.

The latest ledger entry overrides older approval.json, card indexes, or chat summaries for the **same bytes**, including a reset or request for changes. Verify the file hash before treating any approval as current. When reconciling a legacy manifest, preserve its prior evidence and add the gallery evidence ID/hash; do not rewrite technical quality results as passed. Changed bytes need their own approval. Existing prior approvals may be used only when no overriding ledger decision applies and their exact revision/hash remains valid.

A click on **Approve design** is explicit user approval. Do not ask for redundant chat approval. **Request changes** means revise the indicated file and note; **Reset to pending** withdraws its current approval. New content starts pending and is never covered by the one-time bulk approval of the existing collection. A gallery decision persists for Codex's next read; it does not automatically send a message to or wake an idle chat.

Keep the existing character one-base/three-variants gates. Cards have no three-card limit or intermediate approval checkpoint; submit verified cards and continue the requested scope while reviews are pending. Before stopping at a gate, check the ledger. When all required hashes are approved, continue the already authorized work. Design approval does not prove rigging, animation completeness, transparency, card text correctness, or frame QA.

## Style references

Use approved **Runelord** art visible in this gallery as actual image references. Choose a close subject and rendering family, inspect the file, verify approval, and record its path and SHA-256 in the generation handoff. Start with `assets/heroes/references/`, `assets/characters/`, and approved cards. Prefer whole character masters or clean illustrations over masks, component layers, atlas sheets, or frames with reported defects. Keep the existing exact card-frame compositing contract.

The visual language is serious 2D cel shading: broad flat color regions, hard-edged graphic shadows, angular but readable silhouettes, stylized proportions, purposeful expressions, chunky equipment, selective large wear marks, and a few clear role-defining details. Use controlled magical accents; retain quiet surfaces. Avoid painterly gradients, photoreal anatomy, PBR shine, dense grunge, miniature decorative noise, and cute mascot drift. Match the specific approved subject's palette and detail level, checking at full size and about 96 px character height. Do not confuse a style reference with permission to copy or redesign a character's identity.

The former external style samples were removed at the user's request. Do not restore or download them. `style-gallery/excluded-art.json` blocks their exact hashes. Historical prompts may retain provenance but are not current style instructions.

