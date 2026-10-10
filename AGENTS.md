# AGENTS.md

Operating rules for Codex, Claude Code and other AI coding agents working on Syswatch 01. This is the canonical AI entry point. The repository is the only source of truth; do not rely on any earlier conversation.

## Read first

1. [README.md](README.md), always.
2. [docs/DESIGN-SPEC.md](docs/DESIGN-SPEC.md) and [docs/DECISIONS.md](docs/DECISIONS.md), before changing anything visual.
3. [docs/ROADMAP.md](docs/ROADMAP.md), to see what is actually done.
4. [docs/ASSET-PIPELINE.md](docs/ASSET-PIPELINE.md) before touching the generator, and [docs/WATCH-FACE-STUDIO.md](docs/WATCH-FACE-STUDIO.md) before any Watch Face Studio work.

## Commands

All npm commands run from `asset-generator`, not the repository root.

```powershell
cd asset-generator
npm ci
npm run build
```

A passing build ends with `22/22`, `21/21`, `18/18` and `13/13` checks passed.

## Rules

1. **Inspect before claiming.** Check the actual files before stating that an asset, feature or file exists. `asset-generator/dist/manifest.json` is the asset inventory.
2. **Build before and after.** Run `npm ci` and `npm run build` before and after any material change. Report the real result, including failures.
3. **Never edit generated files by hand.** Everything under `asset-generator/dist/` is output. The validators fail on hand edits.
4. **Change the source and regenerate.** Edit `asset-generator/src/` or `asset-generator/design-tokens.json`, then rebuild. Keep source and regenerated output in the same change.
5. **Keep output deterministic.** No timestamps, random values, machine-specific paths or unordered output. A rebuild of unchanged sources must leave `dist/` byte-identical.
6. **Do not reintroduce rejected fonts.** BM Space, DSEG and Tektur are rejected. BM Space is also a licensing problem: never commit it or anything derived from it. See [docs/LICENSING.md](docs/LICENSING.md).
7. **Do not invent Watch Face Studio tags or weather mappings.** Use only tags listed in [docs/WATCH-FACE-STUDIO.md](docs/WATCH-FACE-STUDIO.md), and treat each as unverified until tested. Never add numeric weather values to `weather-mapping.json` or its source.
8. **Do not change locked decisions without explicit user approval.** That covers everything marked Locked or Rejected in [docs/DECISIONS.md](docs/DECISIONS.md): fonts, the 99 px clock, colours, the 450×450 canvas, time and date formats, Version 1 scope. Ask first; record the outcome as a new decision entry.
9. **Do not fake data features.** No live compass heading, distance from home, gym routines or navigation in Version 1.
10. **Do not commit automatically.** Do not commit, push, or create branches or pull requests unless the user asks.
11. **Preserve unrelated user changes.** Do not revert, reformat or delete work you did not make. Check `git status` first.
12. **Do not copy third-party artwork.** Uplink, Tron and ENCOM describe a mood only.

## Reporting

- Separate what you verified from what you assumed.
- Do not describe planned work as implemented. Nothing has been built in Watch Face Studio or run on a watch unless [docs/ROADMAP.md](docs/ROADMAP.md) says so.
- If the documentation and the implementation disagree, say so explicitly and do not pick one silently.
- Label sample data as sample data.

## Keeping documentation current

When a change affects them, update in the same change:

| Changed | Update |
| --- | --- |
| Assets added or removed | Asset inventory in [README.md](README.md), counts in [docs/ASSET-PIPELINE.md](docs/ASSET-PIPELINE.md) |
| npm scripts | Script table in [README.md](README.md) |
| Layout, tokens, typography | [docs/DESIGN-SPEC.md](docs/DESIGN-SPEC.md) |
| A decision made or changed | [docs/DECISIONS.md](docs/DECISIONS.md) |
| Work completed | [docs/ROADMAP.md](docs/ROADMAP.md), status in [README.md](README.md) |
| A tag or behaviour verified in Watch Face Studio | [docs/WATCH-FACE-STUDIO.md](docs/WATCH-FACE-STUDIO.md) |
| Fonts or dependencies | [docs/LICENSING.md](docs/LICENSING.md) |
| A new problem and its fix | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) |
