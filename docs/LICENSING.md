# Licensing

Every bundled third-party asset and dependency in Syswatch 01, inspected on 2026-10-10.

This is a record of what the repository contains and what the included licence files say. It is not legal advice.

## Summary

| Item | Licence | In the repository | Ships in the watch face |
| --- | --- | --- | --- |
| Departure Mono 1.500 | SIL OFL 1.1 | Yes | Planned |
| Share Tech Mono 1.003 | SIL OFL 1.1 | Yes | Planned |
| `sharp` 0.35.5 | Apache-2.0 | No, installed by npm | No |
| `opentype.js` 2.0.0 | MIT | No, installed by npm | No |
| Generated SVG and PNG assets | Original project work | Yes | Planned |
| BM Space | Restricted | **No, excluded** | **No** |

## Bundled fonts

Both font files are stored unmodified beside their licence. The build verifies the family name, version and OFL notice inside each font file, the licence text, and SHA-256 checksums recorded in `asset-generator/dist/manifest.json`.

### Departure Mono

| Field | Value |
| --- | --- |
| Name | Departure Mono Regular |
| Version | 1.500 |
| Designer | Helena Zhang |
| Copyright | Copyright 2022–2024 Helena Zhang (helenazhang.com) |
| Source URL | <https://github.com/rektdeckard/departure-mono> |
| Release used | <https://github.com/rektdeckard/departure-mono/releases/download/v1.500/DepartureMono-1.500.zip> |
| Licence | SIL Open Font License 1.1 |
| Font file | `asset-generator/assets/fonts/departure-mono/DepartureMono-Regular.otf` |
| Local licence file | `asset-generator/assets/fonts/departure-mono/LICENSE` |
| Commercial use | Allowed |
| Redistribution | Allowed, including bundled in software, with the copyright notice and licence included |
| Requirements | See [OFL requirements](#ofl-requirements) |
| SHA-256 (font) | `4d53f663155cf8bf7ffc8e688776e719625f7bbb80a8d90073438b249261a2e0` |

Used for the main clock numerals, the colon and AM/PM.

### Share Tech Mono

| Field | Value |
| --- | --- |
| Name | Share Tech Mono Regular |
| Version | 1.003 |
| Designer | Ralph Oliver du Carrois, Carrois Type Design |
| Copyright | Copyright (c) 2012, Carrois Type Design, Ralph du Carrois, with Reserved Font Name 'Share' |
| Source URL | <https://github.com/google/fonts/tree/main/ofl/sharetechmono> |
| Licence | SIL Open Font License 1.1 |
| Font file | `asset-generator/assets/fonts/share-tech-mono/ShareTechMono-Regular.ttf` |
| Local licence file | `asset-generator/assets/fonts/share-tech-mono/OFL.txt` |
| Commercial use | Allowed |
| Redistribution | Allowed, including bundled in software, with the copyright notice and licence included |
| Requirements | See [OFL requirements](#ofl-requirements). Reserved Font Name: `Share` |
| SHA-256 (font) | `9ceab1f87414829af259c0f537573ae03ef7dd3147c0b27a36a1a0beb6732677` |

Used for the date, event text, heart rate, battery, weather and small labels.

### OFL requirements

What the SIL Open Font License 1.1 requires, as it applies here:

- The font may be used, copied, embedded and redistributed, including in commercial products.
- The font may not be sold by itself.
- Every copy must include the copyright notice and the licence. Keep each font file together with its licence file, in this repository and in anything that redistributes the font file.
- A modified version must not use a Reserved Font Name and must stay under the OFL. This project does not modify either font, so this does not arise. If a font is ever modified, a Share Tech Mono derivative may not use the name "Share".
- The names of the copyright holders may not be used to promote a derivative product.
- Images rendered from a font, such as the preview PNGs, are not covered by the OFL.

To do before any public release: confirm how the licence notice travels with a watch face that bundles the fonts, for example in the store listing or an about screen. Not yet decided.

## npm dependencies

The dependencies are build tools. They are installed into `asset-generator/node_modules/`, which Git ignores, and they are not part of the watch face. Their licence texts are in `asset-generator/node_modules/<package>/` after `npm ci`; no copies are kept in the repository.

Direct dependencies, from `asset-generator/package.json` and `package-lock.json`:

| Name | Locked version | Source URL | Licence | Commercial use | Redistribution | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `sharp` | 0.35.5 | <https://github.com/lovell/sharp> | Apache-2.0 | Allowed | Allowed with licence and notices | SVG to PNG export, pixel checks |
| `opentype.js` | 2.0.0 | <https://github.com/opentypejs/opentype.js> | MIT | Allowed | Allowed with licence and notice | Reading font outlines |

Transitive packages in the lock file:

| Package | Licence | Note |
| --- | --- | --- |
| `@img/sharp-win32-x64` and other `@img/sharp-*` platform builds | Apache-2.0; the Windows and WebAssembly builds also include LGPL-3.0-or-later components | Optional, one per platform |
| `@img/sharp-libvips-*` | LGPL-3.0-or-later | Prebuilt libvips, optional, one per platform |
| `@img/colour` | MIT | |
| `detect-libc` | Apache-2.0 | |
| `semver` | ISC | |
| `@emnapi/runtime` | MIT | Optional |
| `tslib` | 0BSD | Optional |

libvips is LGPL. It is used here only as a build tool on the developer's machine and is not redistributed by this project. That would need review only if the generator itself were ever packaged and distributed with its binaries.

## Original project assets

- All SVG and PNG files under `asset-generator/dist/` are original Syswatch 01 assets, generated from the JavaScript definitions in `asset-generator/src/`. They are not traced, copied or adapted from any other work.
- The three experimental numeral families are original geometry and contain no font data.
- The preview renders contain text drawn from Departure Mono and Share Tech Mono outlines, which the OFL allows.

**The project's own licence is undecided.** `asset-generator/package.json` declares `"license": "UNLICENSED"` and `"private": true`, and there is no `LICENSE` file at the repository root. Until the project owner chooses a licence, all rights in the original assets and code are reserved by default. Choose one before publishing the repository or the watch face.

## Inspiration is not source material

Uplink, Tron and ENCOM are named in project discussions only to describe a mood: early-2000s hacker software and cyan science-fiction interfaces.

- **Never copy Uplink, Tron or ENCOM artwork.** That includes logos, typefaces, screen layouts, icons, textures and traced or redrawn versions of them.
- Do not use those names, or any related trademark, in the watch face, its assets, its file names or its store listing.
- Do not add screenshots or artwork from those works to the repository, including `references/`, unless the right to store them has been confirmed.

Those names describe inspiration only.

## BM Space (rejected)

BM Space, a bitmap font by BitmapMania/cooz, was evaluated and rejected for production ([D-010](DECISIONS.md#d-010-bm-space-rejected)).

The terms distributed with the font are in Japanese. In summary, they state that the fonts are freeware but copyright is not waived; that personal use is permitted; and that selling them, or including them with products intended for profit, without the author's permission is strictly prohibited.

Rules:

- BM Space must remain excluded unless separately licensed. Do not include or restore BM Space assets without an explicit written licence from its author.
- Do not commit the font file, anything rendered from it, or any glyph traced or redrawn from it.
- `.gitignore` excludes `asset-generator/assets/fonts/local/`. A developer's machine may still hold an evaluation copy at `asset-generator/assets/fonts/local/bm-space/`. It is not part of the repository and nothing in the source refers to it. It can be deleted.

The comment above that `.gitignore` rule reads "Locally evaluated fonts pending license verification". For BM Space the verification is finished and the outcome is rejection.

## Adding a new font or dependency

1. Check the licence before adding the file. It must allow commercial use and bundling.
2. Store the unmodified font in `asset-generator/assets/fonts/<id>/` beside its licence file.
3. Add it to `fonts` in `asset-generator/src/font-definitions.mjs` and to `EXPECTED_FONTS` in `asset-generator/scripts/validate-clock-font.mjs`. That validator currently accepts only OFL 1.1.
4. Add a section to this file and an entry to [DECISIONS.md](DECISIONS.md).
5. Fonts in [DECISIONS.md](DECISIONS.md) with status Rejected are not to be reintroduced.
