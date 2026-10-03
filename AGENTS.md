# Runelord art workflow

For art creation, revision, animation, and approval work, read [design/art-approval-workflow.md](design/art-approval-workflow.md).

Submit new art to `assets/approvals/inbox/` with `style-gallery/submit.mjs` before requesting approval. Read the hash-specific decisions in `assets/approvals/decisions.json` before advancing gates; the user's gallery decisions override older approval records. Use approved Runelord artwork in the gallery as the style reference. Preserve existing production sources and technical QA requirements. Never restore the removed external style samples.

## Project agents and skills

Six project agent definitions are in `.codex/agents/`; eight production skills are in `.agents/skills/`. Read [the production workflow](design/production/workflow.md) for substantial Runelord work, handoffs, or requests involving these roles. Use only the roles and references relevant to the assignment; small fixes do not require a full team.

For substantial cross-domain work, the Producer may delegate bounded tasks and independent QA when supported by the session. Give each worker clear file ownership; serialize shared manifest and engine writes. Preserve existing uncommitted work. Keep design, art, approval, animation, gameplay, integration and QA evidence separate. Use `node tools/production/cli.mjs status --repo .` for scoped inventory; unmapped content is unknown, not automatically missing.

Honor the latest user-selected animation method. For the current hero frame workflow, use whole-character frames as described in the production contract; do not silently switch to extensive articulated rigs based on an older personal skill. Current explicit user instructions still take precedence. No automatic commits, deployment, chat creation, or recurring jobs are implied by this workflow.
