# Preserved branch modes

This repository intentionally preserves two independently resumable modes.

- `main` is the deployed traditional roguelike demo. It is the GitHub Pages
  deployment branch and should remain limited to demo-ready changes. Its future
  direction is three sovereign biomes, shops after every three combat
  encounters, then the remaining biomes and heroes.
- `conquer-mode` holds the longer six-to-nine-hour open-world campaign:
  persistent territory progression, card upgrades and fusion, equipment, and
  defenses. Eventual unification is planned, but this branch is neither
  deployed nor merged automatically.

## Local material deliberately excluded from the feature commit

The checkout also retains local authoring and capture material. It is not
discarded, but it is excluded from this source commit to avoid accidentally
publishing obsolete hero sources, pending approval inbox batches, temporary
captures, or the 256 MB promo archive:

- `assets/heroes/animations/abyssal-seraph/`
- `assets/heroes/animations/warlock/frames32-vibrant-r1/`
- `assets/approvals/inbox/`
- `work/`
- `handoffs/claude-design/Runelord-Promo-Video.zip`

Existing `.gitignore` exclusions for legacy hero source directories remain in
effect. These excluded local paths must be reviewed deliberately before any
future archival or asset-specific commit.
