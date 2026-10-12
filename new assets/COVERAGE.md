# Coverage, sources and remaining gaps

## Scope

The user confirmed `wiltobuild/runelord` as the destination and explicitly chose **Runelord only**, excluding the separate RuneSpeak project. The folder name is `new assets`. Original source folders and the working game's uncommitted files were preserved.

The search covered the machine's local Codex active and archived session directories using Runelord/Runeblade/RuneSpeak terms, the local session index, the app's recent-chat list, archived local chats, and files in the relevant task workspaces. Guardian/approval transcripts and unrelated RuneSpeak chats were excluded. Relevant child/worker evidence inherited into the Runelord sessions was used to identify source files and QA limitations.

## Recovered local chats

| Original chat title | Chat ID | Preserved evidence |
|---|---|---|
| Clone Runelord from GitHub | `01a11ee9-39bd-79a3-b74e-54dec99dd712` | Clone/setup, Android feasibility, agent/skill loading |
| Spawn RuneLord agents | `01a11ef7-25a2-7840-a165-493913bea3e9` | Ice monsters, updated art references, orientation correction, Infernal map and launch investigation |
| Create five new demon summons | `01a11ef8-d768-7f21-86bf-77a410275895` | Concept exploration, reference-driven revisions, families, idle and full-state animation, fire experiments, technical scripts |
| Create five new demon summons (2) | `01a121e0-56af-7a60-ab35-aca1dfa8c499` | Forked history, Vanguard motion/fire/scale repairs and full animation states |

Deduplicated readable excerpts are under [chat-notes](chat-notes). The recovered files include forked history and worker summaries; message timestamps/order sometimes reflect restoration rather than original authorship. They are provenance, not a perfect chronological export. Raw unrelated chats, account settings, credentials and approval-system transcripts are not part of this archive.

## Cloud-chat limitation

The visible ChatGPT chat **Runelord pricing advice** (`6aca3f3d-4b20-83ea-bb10-9bc5e9332209`) was inspected. Its recoverable user questions concern Slay the Spire, Mega Crit, competing games and comparison with Runelord. The assistant replies are opaque `chatgpt-content-reference` placeholders through the available reader, so their substantive pricing/comparison text was not recovered and is not invented here. No asset attachment was returned for that chat.

The visible **4 Panel Montage** chat was checked for possible art relevance and proved unrelated. The recent-chat reader exposes only a bounded list, not an exhaustive searchable cloud-chat export. Therefore this is a comprehensive archive of the **identified local Runelord work and recoverable files**, not a claim to have recovered every historical cloud conversation or work from another computer. Missing home-PC-only material is not reconstructed from guesses.

## Asset completeness and status

All files in the two identified Runelord output directories were copied, including superseded revisions and existing ZIP packages. Making-of source files, relevant recovered generation originals, uncommitted gallery inbox items and the three new production packets were also copied. Log files were omitted. The copied source bytes are recorded in `file-manifest.json`.

The original generated-image filenames are retained because rejected experiments are not always individually named in the chats. Prompt records and provenance sidecars explain identifiable outputs. Some reference artwork already lives in the main repository and is referenced by its historical path/hash rather than duplicated again. Absolute paths inside original scripts/metadata are historical and require remapping on another machine.

No approval decisions were changed. The preserved ledger is a point-in-time snapshot; newer live repository decisions take precedence. No concept was promoted into gameplay solely by being archived. The existing game build, catalog, production manifest and runtime code are unchanged by this archive commit.

## Verification

Archive verification is recorded in [VERIFICATION.json](VERIFICATION.json). It checks copied-file hashes, readability of JSON/images/ZIPs, file sizes, and archive document links. It does not rerun the old game or re-certify every animation. Historical QA remains alongside the assets with its stated limitations.
