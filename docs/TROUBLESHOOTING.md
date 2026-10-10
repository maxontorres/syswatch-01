# Troubleshooting

Known problems and their fixes. Commands are Windows PowerShell. Paths assume the repository is at `C:\Dev\wear-os\projects\syswatch-01`; adjust to your clone.

## Running commands from the wrong directory

**Symptom.** From the repository root:

```
npm error code ENOENT
npm error path C:\Dev\wear-os\projects\syswatch-01\package.json
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory
```

**Cause.** `package.json` is in `asset-generator`, not in the repository root.

**Fix.**

```powershell
cd C:\Dev\wear-os\projects\syswatch-01\asset-generator
npm run build
```

Check where you are with `Get-Location`. The directory must contain `package.json`: `Test-Path .\package.json` should print `True`.

## Accidentally duplicating `asset-generator` in paths

**Symptom.** `cd : Cannot find path '...\asset-generator\asset-generator'`, or a file such as `asset-generator\asset-generator\dist\...` cannot be found, or a new nested `asset-generator` folder appears.

**Cause.** You are already inside `asset-generator` and used a path written relative to the repository root. The documentation writes paths from the repository root (`asset-generator/dist/...`), while npm commands run from inside `asset-generator`, where the same file is `dist/...`.

**Fix.** From inside `asset-generator`, drop the leading `asset-generator\`:

```powershell
Start-Process .\dist\previews\production-preview.html
```

If a nested folder was created by mistake, check that it holds nothing you need and remove it:

```powershell
Get-ChildItem .\asset-generator -Recurse
Remove-Item .\asset-generator -Recurse
```

## Empty directories are not tracked by Git

**Symptom.** `watch-face/` and `references/` are missing after a clone, or do not appear in `git status`.

**Cause.** Git tracks files, not directories. Both are empty.

**Fix.** Nothing is wrong. Create the directory when you add its first file:

```powershell
New-Item -ItemType Directory -Force .\watch-face
```

To keep an empty directory in Git, add a placeholder file named `.gitkeep` to it.

## LF will be replaced by CRLF warning

**Symptom.**

```
warning: in the working copy of '.gitignore', LF will be replaced by CRLF the next time Git touches it
```

**Cause.** `core.autocrlf` is `true`, the Git for Windows default. Git stores LF and checks out CRLF. The generator writes LF.

**Fix.** None needed. The warning is harmless:

- The validators normalise CRLF to LF before comparing SVG, JSON and HTML with their definitions, so a CRLF checkout still passes.
- PNG files are binary and are not converted.

Do not change line endings by hand in `dist/`. To remove the warning for the whole repository, a `.gitattributes` file could pin line endings; none exists yet, and adding one is a project decision.

## npm dependency installation

**Use `npm ci`**, not `npm install`. It installs exactly what `package-lock.json` specifies and does not modify the lock file.

```powershell
cd asset-generator
npm ci
```

Expected: `added 6 packages` and `found 0 vulnerabilities`.

| Symptom | Fix |
| --- | --- |
| `npm ci` says the lock file and `package.json` are out of sync | Someone changed `package.json` without updating the lock file. Run `npm install` once, review the lock file diff, and commit both. |
| `Cannot find package 'sharp'` or `Cannot find package 'opentype.js'` | Dependencies are not installed. Run `npm ci`. |
| `Could not load the "sharp" module using the win32-x64 runtime` | The platform binary is missing, often because `node_modules` was copied from another machine. Delete it and reinstall: `Remove-Item .\node_modules -Recurse -Force; npm ci`. |
| `npm` or `node` is not recognised | Install Node.js and reopen PowerShell. Verified with Node 22.22.0 and npm 11.19.0. |

`sharp` downloads a prebuilt binary during installation, so the first `npm ci` needs network access.

## Missing generated previews

**Symptom.** `asset-generator\dist\previews\` is missing or incomplete.

**Cause.** The output has not been generated, or the `dist/` files were not committed in the clone you have.

**Fix.**

```powershell
cd asset-generator
npm ci
npm run build
Get-ChildItem .\dist\previews
```

Expected: `index.html`, `numeral-lab.html`, `clock-font.html`, `production-preview.html`, `production-preview.png` and a `clock-font` folder with 27 PNG files.

## Running npm run build

`npm run build` runs five generate steps and then four validators. It stops at the first failure.

**A successful build** ends with these four lines, among the `PASS` lines:

```
22/22 checks passed
21/21 numeral checks passed
18/18 clock font checks passed
13/13 production preview checks passed
```

**A failed check** looks like:

```
FAIL  SVG files match the JavaScript definitions (not hand-edited or stale)
        svg/heart.svg differs from its definition
```

| Failing check mentions | Cause | Fix |
| --- | --- | --- |
| `differs from its definition` | A file in `dist/` was edited by hand or is stale | Run `npm run build` again. If it persists, the generate step failed earlier; read its output. |
| `exactly 15 icons are defined`, `unexpected <name>` | An icon was added or removed without updating the validator | Update `EXPECTED_ICONS` in `scripts/validate-assets.mjs`. See [ASSET-PIPELINE.md](ASSET-PIPELINE.md#how-to-add-a-new-icon). |
| `the clock is 99 px and the date is 20 px` | A locked typography token was changed | Restore the token, or get the decision changed first. See [DECISIONS.md](DECISIONS.md). |
| `does not match its sha256` | A font or licence file changed | Restore the original file. Fonts are never modified. |
| `invents no WFS numeric values` | Numeric weather values were added | Remove them. See [D-019](DECISIONS.md#d-019-numeric-watch-face-studio-weather-mapping-remains-unverified). |

Running a single validator, for example `npm run validate:production`, without generating first checks whatever is already in `dist/`.

## Font files not loading

**Symptom during the build.**

```
Error: ENOENT: no such file or directory, open '...\assets\fonts\departure-mono\DepartureMono-Regular.otf'
```

or the check `every font file sits beside its licence under assets/fonts/<id>/` fails.

**Cause.** A font or licence file is missing, for example because it was never committed.

**Fix.** Confirm all four files exist:

```powershell
cd asset-generator
Get-ChildItem .\assets\fonts -Recurse -File | Select-Object FullName
```

Expected under `assets\fonts`: `departure-mono\DepartureMono-Regular.otf`, `departure-mono\LICENSE`, `share-tech-mono\ShareTechMono-Regular.ttf`, `share-tech-mono\OFL.txt`. If one is missing, restore it from Git, or download the release named in [LICENSING.md](LICENSING.md) and confirm the build's checksum check passes.

**Symptom in a browser.** A preview seems to show the wrong font.

- The production preview and clock font comparison draw all face text as vector outlines inside a PNG. No font needs to be installed and nothing can fail to load. If the face looks wrong, rebuild.
- In `index.html` the clock (`10:08`), the event text and the module values are placeholder HTML text in the page font. This is expected, not a failure. Use `production-preview.html` to judge typography.
- Headings and captions on every page use Consolas or the browser's monospace font. That is page chrome, not the watch face.

**In Watch Face Studio.** Font installation there is untested. See [WATCH-FACE-STUDIO.md](WATCH-FACE-STUDIO.md#departure-mono).

## Opening HTML previews from PowerShell

From `asset-generator`:

```powershell
Start-Process .\dist\previews\production-preview.html
Start-Process .\dist\previews\index.html
Start-Process .\dist\previews\clock-font.html
Start-Process .\dist\previews\numeral-lab.html
```

From the repository root, prefix the path: `Start-Process .\asset-generator\dist\previews\production-preview.html`.

`Invoke-Item` works the same way. The pages open from disk in the default browser; no web server is needed.

If a render looks blurred, set the browser zoom to 100%. The renders are meant to be seen at 1:1, and a display scaling setting other than 100% also resamples them.

## Checking whether node_modules is ignored

From the repository root:

```powershell
git check-ignore -v asset-generator/node_modules
```

Expected: `.gitignore:2:node_modules/	asset-generator/node_modules`. No output means it is not ignored.

Confirm that nothing from it is tracked:

```powershell
git ls-files asset-generator/node_modules
```

Expected: no output. If files are listed, remove them from the index without deleting them from disk:

```powershell
git rm -r --cached asset-generator/node_modules
```

The same command shows why another path is ignored, for example `git check-ignore -v asset-generator/assets/fonts/local/x`.

## Rebuilding generated assets

Change the source, never the output:

1. Edit a definition in `asset-generator/src/` or a value in `asset-generator/design-tokens.json`.
2. Rebuild:

   ```powershell
   cd asset-generator
   npm run build
   ```

3. Review what changed:

   ```powershell
   git status --short dist
   git diff --stat dist
   ```

4. Open the previews and look at the result.

Notes:

- There is no clean step. The generators overwrite files in place and delete stale `.svg` and `.png` files they no longer define.
- If `dist/` changes although no source did, the Sharp version probably changed. Check `git diff package-lock.json`.
- To discard regenerated output and return to the committed state: `git restore asset-generator/dist`. This applies only once `dist/` has been committed.
