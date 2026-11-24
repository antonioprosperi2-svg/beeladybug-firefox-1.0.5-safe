# Contributing to BeeLadybug

Thanks for helping. This repository is the Firefox build of BeeLadybug: plain JavaScript files in `src/`, loaded directly by Firefox.

## Report a bug

Open an issue:

https://github.com/antonioprosperi2-svg/beeladybug-firefox-1.0.5-safe/issues

Please include:

- The extension version (`1.0.5` in `src/manifest.json`).
- The page URL, and what you clicked or hovered.
- What you expected, and what the HUD or the HTML report showed instead.
- A screenshot of the panel or the exported report, if you can share the page.

Security issues belong in a private advisory. See [SECURITY.md](SECURITY.md). Please do not file those as public issues.

## Suggest a feature

Use the same issue list. Describe the page you were inspecting and the check or HUD behavior you want. A short example, or a reduced HTML file, is more useful than a general idea.

## Test a change locally

There is no build step and no package install.

1. Clone the repository, or download and unzip it.
2. Open `about:debugging`.
3. Click **This Firefox**.
4. Click **Load Temporary Add-on**.
5. Select `src/manifest.json`.
6. Open a normal web page, click the BeeLadybug icon, then click **Attiva/Disattiva HUD**.

After you edit a file, reload the temporary add-on on `about:debugging`. Then turn the HUD off and on again, so the page picks up the new `src/content.js` and `src/entity-bridge.js`.

`src/popup.html` loads `src/popup.js` as a module. You can change the popup and reload the extension. The page scripts Firefox actually injects are `entity-bridge.js` and `content.js` (`src/popup.js` names those two files, relative to the extension root). `src/content.src.js` is the boot code written as a module for the engine repository. It imports `../src/index.js`, which is not in this repository. Editing `src/content.src.js` alone does not change what the extension runs.

Protected pages cannot be inspected. Use an `https://` page rather than `about:`, `chrome://`, or the Chrome Web Store. `about:debugging` itself is refused.

Keep the Firefox-only constraints when you edit `src/content.js` or `src/manifest.json`:

- Do not assign HTML strings with `innerHTML`, `outerHTML`, or `insertAdjacentHTML`. Build nodes with `document.createElement`, set text with `textContent`, and refresh lists with `replaceChildren`.
- Keep `browser_specific_settings.gecko` in `src/manifest.json`, including `data_collection_permissions.required` set to `["none"]`.
- Leave paths inside `src/manifest.json` and `src/popup.html` relative to `src/`, so that folder still loads on its own.

## How the code is written

Keep it vanilla JavaScript.

- No frameworks, no UI libraries, and no bundler in this repository.
- No build step. Firefox loads `src/manifest.json`, the popup, `src/content.js`, and `src/entity-bridge.js` as they are.
- Match the style of the file you are editing. `src/popup.js` and `src/content.src.js` are modules. `src/entity-bridge.js` is a classic script. `src/content.js` is the bundled script the popup injects.
- Change only what the bug or feature needs.

A change to the toolbar button, the injection, or the entity bridge belongs in `src/`. A change to how a check works is inside the bundled inspectors in `src/content.js`.

By participating, you agree to the [code of conduct](CODE_OF_CONDUCT.md).
