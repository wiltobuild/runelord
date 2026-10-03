# Runelord agents and skills

Six project-scoped Codex agents and eight project-scoped skills are stored in this repository. Start a Codex chat in this checkout to discover them. If the host has cached configuration, reload the project/session. This installation does not create sidebar chats, start autonomous jobs, or change global model settings.

## Use

- “Have runelord-producer assess the current Warlock demo and propose the next playable slice.”
- “Use $runelord-content-to-game to implement Pyre Warden from the current catalog. Have runelord-game-qa independently verify the integrated result.”
- “Use $runelord-production-status to tell me what is implemented, integrated, and still unverified.”
- “Have runelord-technical-artist use $runelord-asset-integration on the approved summon animation package.”
- “Use $runelord-ui-system to apply the selected UI changes across the current maps.”

The full [workflow](workflow.md) defines packets, ownership, review, resumption, and the current frame-animation preference. The templates are contracts to fill for real assignments, not already authorized work. The [acceptance route](acceptance-route.md) is reusable browser QA; running the helper commands does not run a browser playthrough.

## Commands (from the repository root)

```powershell
node tools/production/cli.mjs status --repo .
node tools/production/cli.mjs status --repo . --out work/production/status.json
node tools/production/cli.mjs packet design/production/packets/my-slice.json
node tools/production/cli.mjs record design/production/records/my-content.json
node tools/production/cli.mjs encounter work/production/enemy.json
node tools/production/cli.mjs animation path/to/animation/manifest.json
node tools/production/cli.mjs audio assets/audio/music/loop_manifest.json
node tools/production/art.mjs approval path/to/source.png
node tools/production/art.mjs compare master.png composed.png editable-mask.png
node tools/production/balance.mjs baseline.json candidate.json
node --test tools/production/*.test.mjs
```

Convenience aliases: `npm run production:status` and `npm run test:production`. Package metadata and local reference validation additionally use `python tools/production/validate-package.py` with Python 3.11+ and PyYAML (available in the Codex bundled Python environment).

Use `node tools/production/cli.mjs help` for schemas and limitations. The tools do not implement cards, create art, mark approvals, or certify gameplay balance. They provide repeatable evidence for those workflows. The status report inventories catalog rows and known runtime mappings; it does not recursively index the large production asset tree.

Agent format: [official custom agent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents). Skill discovery: [official skill documentation](https://learn.chatgpt.com/docs/build-skills). Verified October 2, 2026. Agent TOML and skill metadata are syntax-validated locally; discovery in a newly opened project session is a separate host behavior.
