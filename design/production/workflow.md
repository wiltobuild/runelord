# Runelord production workflow

This is the shared contract for the project agents and skills. Read only the sections relevant to the assignment. These files define reusable workers, not a background service. Work starts from an authorized user request; a suggested backlog item is not permission to execute it.

## Start and route

Use the user's requested outcome and current checkout. Inspect `git status --short`; preserve unrelated work. Read `AGENTS.md`, the relevant catalog/design sections, and the consuming code. `PLAN.md` is the design roadmap, not proof of implementation. Read `design/campaign-direction.md` for the current campaign, progression, and territory requirements; older act-based plans and catalog acquisition rules yield to it. Newer explicit user choices override older defaults. Record a meaningful conflict in the work packet rather than silently choosing incompatible requirements.

The default development unit is a playable slice: one observable capability from acquisition through combat, presentation, and save/replay. An explicitly requested art batch, investigation, or small fix retains its own scope. Do not force every task through every role.

| Agent | Owns | Principal skills |
|---|---|---|
| runelord-producer | Dependencies, packets, coordination, final acceptance summary | production-status |
| runelord-rules-engineer | Content definitions and deterministic rules | content-to-game |
| runelord-art-director | Visual briefs, reference selection, identity review | existing art skills, ui-system |
| runelord-technical-artist | Runtime assets, presentation, UI/audio integration | asset-integration, ui-system, audio-director |
| runelord-encounter-designer | Enemy roles, encounters, balance experiments | encounter-designer, balance-lab |
| runelord-game-qa | Independent behavioral checks and repair verification | playtest |

Skill names in the table have the `runelord-` prefix. Native agent files live in `.codex/agents/`; skills live in `.agents/skills/`. Roles inherit the session's model and permissions. If the host cannot select custom agents, pass the chosen TOML's developer instructions and packet to an available worker, or execute that role sequentially. Never claim an independent review when the builder reviewed itself.

## Work packets and checkpoints

For substantial work create `design/production/packets/<slug>.json` from `templates/work-packet.json`. Use `node tools/production/cli.mjs packet <path>` to validate it. Small fixes need only an equivalent concise handoff. `draft` packets are plans; `ready` means the current user request authorizes their scope. Include:

- Player-visible outcome, content IDs, exclusions, and original request/evidence.
- Exact source paths and SHA-256 hashes; current approval decisions where applicable.
- Owner, integration owner, reviewer, owned paths, and dependencies.
- Chosen animation method and required states for animation work.
- Observable acceptance checks, each with pending/pass/fail/not-applicable status and evidence.
- Completed work, remaining work, blockers, and the next action.

Capture hashes with `node tools/production/cli.mjs hash <file>`. The packet validator rehashes inputs: any difference invalidates a completed packet. Refresh inputs only after assessing downstream impact; do not merely replace hashes to hide stale evidence. Evidence files should identify the tested revision, source hashes, commands, browser/build URL, and observations. A file existing is not proof that its claims are correct.

Checkpoint at a meaningful completed item, before a handoff, and on interruption. Resume by checking files, hashes, current gallery decisions, and dependencies. Continue the authorized remainder without duplicating finished work or asking for the same permission again.

## Concurrency and integration

The Producer can delegate bounded work and independent review when the host permits. Use only workers useful to the current slice; respect available slots and leave capacity for review. Prefer independent assets or modules in parallel. Assign one writer to shared manifests, production records, packet status, and shared engine files. Use isolated worktrees when overlapping edits cannot be avoided; explicitly provide access to required large ignored assets without copying or deleting masters.

Workers return an immutable revision, files changed, checks run, unresolved defects, and next action. They do not wait for child slots while occupying all available capacity. The integration owner combines results, checks shared interfaces, and passes the resulting build to QA. Do not reset, stash, revert, or commit unrelated changes.

## Independent acceptance

Use separate builder and reviewer identities for substantial slices and animation audits. QA owns the report and does not repair production files. A builder or a separately assigned repair worker fixes concrete defects; QA rechecks the fix and affected adjacent behavior. After three unsuccessful attempts at the same defect, preserve the best candidate and report the unresolved limitation; continue independent feasible work.

Technical QA, user design approval, and authorization to integrate a pending asset are separate. Follow `design/art-approval-workflow.md`. Never self-approve art or promote a preview decision to approval of every frame. An explicit user integration instruction may authorize pending art; record it without relabeling the ledger decision. Requested changes on current bytes must be addressed or explicitly resolved by the user.

## Production evidence

Run `node tools/production/cli.mjs status --repo .` for a read-only catalog/runtime report. It scans catalog tables and explicit runtime provenance, never the entire frame library. Unmapped art remains unknown, not missing. The Warlock implementation adapter reads the current exported ID registry; a registry entry is only implementation evidence, not test evidence. Other gameplay adapters remain unknown until supported.

For content beyond automatic coverage, maintain one record per content ID in `design/production/records/` using `templates/content-record.json`. Run `node tools/production/cli.mjs record <path>` before accepting it. Keep design, art, approval, animation, gameplay, integration, and QA separate. Runtime-bound does not mean approved, playable, or visually passed. Source/catalog changes make dependent evidence stale. Reports include coverage limitations and errors; do not call them exhaustive when adapters or mappings are absent.

## Animation and art handoffs

For the current hero frame workflow, prefer the user's whole-character frame method: approximately 32 authored frames covering idle, attack, hit, wounded idle, cast, and death. Treat this as that workflow's starting brief, not a universal frame quota. Honor the packet's latest explicit choice. Do not silently switch to articulated rigs or expand to 20 states because an older personal skill prescribed it. Genuine rig work remains available when requested and supported by real separated parts.

Audit each delivered frame against the exact approved master and adjacent poses; check full size, 96px readability, light/dark backgrounds, loop transitions, attack recovery, and terminal death. Keep body and VFX separable when practical. A moving flat PNG is not articulated animation. Timing and anchors must match actual exported files.

Use existing `hd-fantasy-character`, `hd-card-creator`, `hd-animate-fantasy-character`, battle-map, object, and scene skills for generation when available. They are external authoring dependencies, not bundled here. If unavailable, complete inventory/integration work and report the specific missing generation capability. Current user instructions take precedence over outdated skill defaults. Use the built-in image tool for new raster art; deterministic export, packing, and approved card compositing are technical operations. Share `tools/production/art.mjs` for exact-hash decisions and protected-pixel card checks rather than reimplementing them. Resolve the actual gallery checkout/helper from current project configuration; never start competing servers blindly.

## Completion and useful reporting

Report the player-visible result first, then verification, unresolved work, and the next actionable dependency. Keep generated logs/screenshots under `work/production/<packet>/` (ephemeral) or an explicitly selected durable evidence directory. Completed packets must reference retained evidence. Do not mark work complete based on plans, a static mockup, or a successful build alone. No deployment, commit, messaging another chat, or recurring automation follows automatically from these roles.
