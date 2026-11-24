# Changelog

All notable changes to the Firefox build of BeeLadybug are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Git history for this repository is a single commit, `first commit` (2026-11-23). That commit already contains extension version 1.0.5. The entry below lists the Firefox changes present in that source: `src/manifest.json` and `src/content.js`. `src/popup.html`, `src/popup.js`, `src/entity-bridge.js`, and `src/content.src.js` match the Chrome 1.0.5 package.

## [1.0.5] - 2026-11-23

### Added

- Firefox Manifest V3 settings under `browser_specific_settings.gecko` in `src/manifest.json`.
- Extension id `beeladybug-inspector@beeenginejs.com`.
- `strict_min_version` set to `142.0`.
- `data_collection_permissions.required` set to `["none"]`, declaring that the add-on collects no data.

### Changed

- `src/content.js` no longer assigns HTML strings to `innerHTML`. The HUD (panel, sections, issue rows, inspect rows, event log, and adapter buttons) is built with `document.createElement`, `textContent`, and `replaceChildren`.
- The page scripts contain no `innerHTML`, `outerHTML`, or `insertAdjacentHTML`. Text from the page is set with `textContent`, so it is not parsed as HTML inside the overlay.
- The F8 HTML report is still a string. Values are escaped by `escapeHtml2` (`&`, `<`, `>`, `"`). The file is downloaded through a temporary `<a>` created with `createElement` and a `Blob`. The report string is not inserted into the page DOM.
