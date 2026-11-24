# Security policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |

1.0.5 is the version in `src/manifest.json`. Older 1.0.x releases get security fixes on this line. Versions before 1.0 are not supported.

## What this build does

BeeLadybug runs in the tab you choose. It does not collect data, and it does not send the page anywhere.

- **No data collection.** `src/manifest.json` sets `browser_specific_settings.gecko.data_collection_permissions.required` to `["none"]`.
- **Local only.** The manifest permissions are `activeTab` and `scripting`. There are no host permissions and no `storage` permission. The scripts in `src/` do not call `fetch`, `XMLHttpRequest`, `WebSocket`, or `sendBeacon`. The HTML report is a file the tab downloads. The panel size and position are stored in that page's `localStorage` under `bee-ladybug.panel`.
- **No HTML injection into the page.** `src/content.js`, `src/content.src.js`, `src/popup.js`, `src/popup.html`, and `src/entity-bridge.js` contain no `innerHTML`, `outerHTML`, or `insertAdjacentHTML`. The HUD is built with `document.createElement`. Text is assigned with `textContent`. Lists are replaced with `replaceChildren`. A string from the page is therefore shown as text, not parsed as HTML.
- **The report is a file, not a DOM write.** `renderHtml` builds the downloaded report as a string. Inserted values pass through `escapeHtml2`, which replaces `&`, `<`, `>`, and `"`. The download link is an `<a>` created with `createElement`. That string is not assigned into the page.
- **Entity data stays on the page.** `src/entity-bridge.js` copies a fixed set of fields from `window.__BEE_ENTITIES__` and posts that plain object to the same window every 100ms. The HUD listener in `src/content.js` accepts the message only when `event.source` is that same window.

The Ask AI button is hidden in this build, and no assistant is registered.

## Reporting a vulnerability

Report a vulnerability privately with a GitHub Security Advisory:

https://github.com/antonioprosperi2-svg/beeladybug-firefox-1.0.5-safe/security/advisories/new

There is no email address for security reports. Please do not open a public GitHub issue for a vulnerability, and do not post exploit details in discussions.

Include the extension version (`1.0.5` in `src/manifest.json`), the file or check involved, and a short description of the impact. If you can, add steps that show the problem on a page you control.

You will get a reply through the advisory. Please allow a few days for a first response. A confirmed issue will be fixed in a 1.0.x release, and the advisory can be published after the fix is available.
