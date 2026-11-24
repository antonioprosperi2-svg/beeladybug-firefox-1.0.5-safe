"use strict";
(() => {
  // src/core/UIOverlay.js
  function formatSimTime(ms) {
    const total = Math.max(0, ms) / 1e3;
    const m = Math.floor(total / 60);
    const s = total - m * 60;
    return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
  }
  var HOST_TAG = "bee-ladybug-overlay";
  var PANEL_STORE_KEY = "bee-ladybug.panel";
  var PANEL_COMPACT = 360;
  var PANEL_WIDE = 680;
  var PANEL_MIN_W = 340;
  var STYLES = `
:host {
  all: initial;
  pointer-events: none;
}
.bl-root {
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  font-family: ui-monospace, "Cascadia Code", "Fira Code", Consolas, monospace;
  color: #e9edf5;
}
.bl-root[data-visible="false"] {
  display: none;
}
.bl-panel {
  pointer-events: auto;
  position: absolute;
  top: 12px;
  left: 12px;
  width: 360px;
  min-width: 340px;
  max-width: 90vw;
  max-height: 90vh;
  resize: both;
  display: flex;
  flex-direction: column;
  background: rgba(13, 17, 23, 0.96);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 59, 78, 0.55);
  border-radius: 10px;
  box-sizing: border-box;
  overflow: hidden;
}
.bl-panel::before {
  content: "";
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(255, 211, 106, 0.12);
  pointer-events: none;
}
.bl-scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0 2px,
    rgba(0, 0, 0, 0.16) 2px 3px
  );
  opacity: 0.35;
}
.bl-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  margin: 8px 8px 4px;
  padding: 8px 10px;
  min-height: 28px;
  border: 1px solid #07090d;
  border-top-color: #aeb6c6;
  border-radius: 6px;
  background: linear-gradient(to bottom, #323a4a, #1a1f2a);
  box-shadow: 0 2px 0 #07090d, 0 3px 5px rgba(0, 0, 0, 0.45);
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.bl-head button {
  cursor: pointer;
  touch-action: manipulation;
}
.bl-panel[data-dragging="true"] .bl-head {
  cursor: grabbing;
}
.bl-panel[data-collapsed="true"] {
  display: none;
}
.bl-pill {
  pointer-events: auto;
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  margin: 0;
  padding: 6px 12px 6px 8px;
  border: 1px solid #07090d;
  border-top-color: #aeb6c6;
  border-radius: 999px;
  background: rgba(13, 17, 23, 0.96);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 2px 0 #07090d, 0 3px 5px rgba(0, 0, 0, 0.45);
  color: #e9edf5;
  font: 700 12px ui-monospace, Consolas, monospace;
  letter-spacing: 0.04em;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}
.bl-pill[hidden] {
  display: none;
}
.bl-pill[data-dragging="true"] {
  cursor: grabbing;
}
.bl-mark {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ff3b4e;
  position: relative;
  flex: 0 0 auto;
  box-shadow: 0 0 0 1px rgba(255, 211, 106, 0.35);
}
.bl-mark::before,
.bl-mark::after {
  content: "";
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #12080a;
  top: 4px;
}
.bl-mark::before { left: 3px; }
.bl-mark::after { right: 3px; }
.bl-title {
  color: #ffd36a;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  white-space: nowrap;
}
.bl-badge {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: #6ee7ff;
  border: 1px solid rgba(110, 231, 255, 0.35);
  border-radius: 6px;
  padding: 4px 6px;
}
.bl-mode-wrap {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  position: relative;
}
.bl-mode {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #3eea7a;
  border: 1px solid rgba(62, 234, 122, 0.45);
  border-radius: 6px;
  padding: 4px 6px;
}
.bl-mode[data-mode="FREEZE"] { color: #ff3b4e; }
.bl-mode[data-mode^="SLOW"] { color: #ffd36a; }
.bl-size {
  appearance: none;
  flex: 0 0 auto;
  margin: 0;
  padding: 4px 6px;
  border: 1px solid #07090d;
  border-top-color: #8fdfff;
  border-radius: 6px;
  background: linear-gradient(to bottom, #243038, #12181c);
  box-shadow: 0 1px 0 #07090d;
  color: #6ee7ff;
  font: 700 12px ui-monospace, Consolas, monospace;
  letter-spacing: 0.08em;
  line-height: 1.2;
  cursor: pointer;
}
.bl-size:hover,
.bl-size:focus-visible {
  color: #05060a;
  background: #6ee7ff;
  border-color: #6ee7ff;
  outline: none;
}
.bl-size[aria-pressed="true"] {
  color: #ffd36a;
  border-color: rgba(255, 211, 106, 0.75);
}
.bl-info {
  appearance: none;
  position: relative;
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid #07090d;
  border-top-color: #aeb6c6;
  border-radius: 50%;
  background: linear-gradient(to bottom, #323a4a, #1a1f2a);
  box-shadow: 0 1px 0 #07090d;
  color: #d0d6e2;
  font: 700 12px ui-monospace, Consolas, monospace;
  line-height: 1;
  cursor: help;
}
.bl-info:hover,
.bl-info:focus-visible {
  color: #ffd36a;
  border-color: #ffd36a;
  outline: none;
}
.bl-info-tip {
  display: none;
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 228px;
  padding: 8px 9px;
  background: #0c0e14;
  border: 1px solid rgba(255, 211, 106, 0.45);
  color: #e9edf5;
  font: 400 12px/1.45 ui-monospace, Consolas, monospace;
  letter-spacing: 0;
  text-transform: none;
  z-index: 3;
  pointer-events: none;
  white-space: normal;
  text-align: left;
}
.bl-info:hover .bl-info-tip,
.bl-info:focus .bl-info-tip,
.bl-info:focus-visible .bl-info-tip {
  display: block;
}
.bl-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 12px;
  padding: 8px 12px 6px;
  font-size: 12px;
  color: #d0d6e2;
}
.bl-stats b {
  color: #fff;
  font-weight: 700;
}
.bl-graph-wrap {
  padding: 0 12px 6px;
}
.bl-graph {
  display: block;
  width: 100%;
  height: 52px;
  background: #05060a;
  border: 1px solid rgba(255, 211, 106, 0.16);
}
.bl-graph-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #d0d6e2;
  margin-top: 3px;
  letter-spacing: 0.06em;
}
.bl-hud {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 2px 8px;
  padding: 4px 12px 8px;
  font-size: 12px;
  max-height: 88px;
  overflow: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}
.bl-k { color: #d0d6e2; }
.bl-v { color: #e9edf5; }
.bl-console {
  flex: 1;
  min-height: 140px;
  overflow: auto;
  padding: 0;
  border-top: 1px solid rgba(255, 59, 78, 0.22);
  font-size: 12px;
  line-height: 1.45;
}
.bl-line {
  white-space: normal;
  word-break: break-word;
  padding: 3px 10px;
}
.bl-line:nth-child(even) { background: rgba(255, 255, 255, 0.055); }
.bl-line .t { color: #d0d6e2; margin-right: 8px; }
.bl-line .s { color: #6ee7ff; margin-right: 8px; }
.bl-line.info .m { color: #d0d6e2; }
.bl-line.warn .m { color: #ffd36a; }
.bl-line.error .m { color: #ff6b7d; }
.bl-line.debug .m { color: #d0d6e2; }
.bl-foot {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 18px 8px 10px;
  border-top: 1px solid rgba(255, 59, 78, 0.22);
}
.bl-btn {
  appearance: none;
  min-height: 28px;
  padding: 6px 10px;
  border-radius: 6px;
  background: linear-gradient(to bottom, #323a4a, #1a1f2a);
  color: #fff6d8;
  border: 1px solid #07090d;
  border-top-color: #aeb6c6;
  box-shadow: 0 2px 0 #07090d, 0 3px 5px rgba(0, 0, 0, 0.45);
  font: 700 12px ui-monospace, Consolas, monospace;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.bl-btn:hover {
  background: linear-gradient(to bottom, #455066, #242b38);
  color: #fff;
}
.bl-btn:active {
  background: linear-gradient(to bottom, #12161e, #242b38);
  border-top-color: #07090d;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.7);
}
.bl-btn[data-hot="true"] {
  background: #ff3b4e;
  border-color: #6e1020;
  border-top-color: #ffb3bc;
  color: #0d1117;
  box-shadow: 0 2px 0 #4a0c16, 0 3px 5px rgba(0, 0, 0, 0.4);
}
.bl-btn[data-hot="true"]:hover {
  background: #ff6272;
  color: #0d1117;
}
.bl-btn[data-hot="true"]:active {
  background: #ff3b4e;
  color: #0d1117;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.45);
}
.bl-providers {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.bl-providers:empty {
  display: none;
}
.bl-adapters {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.bl-adapters:empty {
  display: none;
}
.bl-hotkeys {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.bl-hotkeys:empty {
  display: none;
}
.bl-scroll,
.bl-section,
.bl-section-body,
.bl-stats,
.bl-graph-wrap,
.bl-hud,
.bl-foot,
.bl-issues,
.bl-legend,
.bl-detail,
.bl-console,
.bl-section-toggle {
  background: rgba(13, 17, 23, 0.96);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.bl-scroll {
  overflow: auto;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}
.bl-section[data-section="events"] {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}
.bl-section[data-section="events"][data-open="false"] {
  flex: 0 0 auto;
}
.bl-section[data-section="events"][data-open="true"] > .bl-section-body {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
.bl-section[hidden] { display: none; }
.bl-section-toggle {
  display: block;
  width: 100%;
  margin: 0;
  padding: 6px 10px;
  border: 0;
  border-top: 1px solid rgba(255, 59, 78, 0.28);
  color: #ffd36a;
  font: 700 12px ui-monospace, Consolas, monospace;
  letter-spacing: 0.14em;
  text-align: left;
  cursor: pointer;
}
.bl-section-toggle::before { content: "\u25BE  "; }
.bl-section[data-open="false"] > .bl-section-toggle::before { content: "\u25B8  "; }
.bl-section[data-open="false"] > .bl-section-body { display: none; }
.bl-issues {
  background: rgba(13, 17, 23, 0.96);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.bl-legend {
  display: flex;
  gap: 14px;
  padding: 4px 10px 2px;
  color: #d0d6e2;
  font-size: 12px;
}
.bl-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 5px;
  border-radius: 50%;
  vertical-align: baseline;
}
.bl-dot.bug { background: #ff3b4e; }
.bl-dot.info { background: #d0d6e2; }
.bl-cause > button,
.bl-cause-kids button,
.bl-note {
  display: block;
  width: 100%;
  margin: 0;
  padding: 4px 10px;
  border: 0;
  background: transparent;
  font: 12px ui-monospace, Consolas, monospace;
  line-height: 1.4;
  text-align: left;
}
.bl-cause > button,
.bl-cause-kids button {
  color: #ff6b7d;
  cursor: pointer;
}
.bl-cause-kids[hidden] { display: none; }
.bl-cause-kids button { padding-left: 22px; }
.bl-cause > button:hover,
.bl-cause-kids button:hover { background: rgba(255, 59, 78, 0.08); }
.bl-note { color: #d0d6e2; }
.bl-detail {
  max-height: 132px;
  overflow: auto;
  border-top: 1px solid rgba(255, 59, 78, 0.22);
}
.bl-detail[hidden] {
  display: none;
}
.bl-detail button {
  display: block;
  width: 100%;
  margin: 0;
  padding: 4px 10px;
  border: 0;
  background: transparent;
  color: #e9edf5;
  font: 12px ui-monospace, Consolas, monospace;
  line-height: 1.4;
  text-align: left;
  cursor: pointer;
}
.bl-detail button:nth-child(even) { background: rgba(255, 255, 255, 0.055); }
.bl-detail button[data-level="warn"] { color: #ffd36a; }
.bl-detail button[data-level="error"] { color: #ff6b7d; }
.bl-detail button[data-level="info"] { color: #d0d6e2; }
.bl-detail button:hover { background: rgba(255, 255, 255, 0.1); }
.bl-adapter {
  appearance: none;
  min-height: 28px;
  padding: 6px 10px;
  border-radius: 6px;
  background: linear-gradient(to bottom, #323a4a, #1a1f2a);
  color: #d0d6e2;
  border: 1px solid #07090d;
  border-top-color: #aeb6c6;
  box-shadow: 0 2px 0 #07090d, 0 3px 5px rgba(0, 0, 0, 0.45);
  font: 700 12px ui-monospace, Consolas, monospace;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.bl-adapter:hover {
  background: linear-gradient(to bottom, #455066, #242b38);
  color: #fff;
}
.bl-adapter:active {
  background: linear-gradient(to bottom, #12161e, #242b38);
  border-top-color: #07090d;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.7);
}
.bl-adapter[data-hot="true"] {
  background: #ffd36a;
  color: #0d1117;
  border-color: #8a6a1e;
  border-top-color: #ffe7a3;
  box-shadow: 0 2px 0 #5c4510, 0 3px 5px rgba(0, 0, 0, 0.35);
}
.bl-adapter[data-hot="true"]:hover {
  background: #ffe08a;
  color: #0d1117;
}
.bl-adapter[data-hot="true"]:active {
  background: #e6bc55;
  color: #0d1117;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.35);
}
.bl-adapter[data-flash="true"] {
  animation: bl-adapter-flash 0.55s ease;
}
@keyframes bl-adapter-flash {
  0% {
    background: #ffd36a;
    color: #05060a;
    border-color: #ffd36a;
  }
  100% {
    background: #16181f;
  }
}
.bl-provider {
  appearance: none;
  min-width: 28px;
  min-height: 28px;
  padding: 6px 10px;
  border-radius: 6px;
  background: linear-gradient(to bottom, #323a4a, #1a1f2a);
  color: #fff6d8;
  border: 1px solid #07090d;
  border-top-color: #aeb6c6;
  box-shadow: 0 2px 0 #07090d, 0 3px 5px rgba(0, 0, 0, 0.45);
  font: 700 12px ui-monospace, Consolas, monospace;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.bl-provider[data-hot="true"] {
  background: #6ee7ff;
  border-color: #6ee7ff;
  color: #05060a;
}
.bl-hint {
  margin-left: auto;
  font-size: 12px;
  color: #d0d6e2;
}
@media (prefers-reduced-motion: reduce) {
  .bl-scan { display: none; }
  .bl-adapter[data-flash="true"] {
    animation: none;
    background: #ffd36a;
    color: #05060a;
    border-color: #ffd36a;
  }
}
`;
  var UIOverlay = class {
    /**
     * @param {import('./BeeLadybugCore.js').BeeLadybugCore} core
     * @param {object} [options]
     */
    constructor(core, options = {}) {
      this.core = core;
      void options;
      this.#host = null;
      this.#root = null;
      this.#els = null;
      this.#stickBottom = true;
      this.#lastLogId = 0;
      this.#mounted = false;
      this.#providerSig = "";
      this.#adapterSig = "";
      this.#hotkeySig = "";
      this.#detail = [];
      this.#issues = [];
      this.#issueNotes = [];
      this.#openCauses = /* @__PURE__ */ new Set();
      this.#flashAt = /* @__PURE__ */ new Map();
      this.#flashTimers = /* @__PURE__ */ new Map();
      this.#wide = false;
      this.#pill = false;
      this.#layoutHeight = null;
      this.#layoutWidth = null;
      this.#layoutLeft = null;
      this.#layoutTop = null;
      this.#drag = null;
      this.#panelObserver = null;
      this.#saveTimer = 0;
      this.#onPointerMove = (event) => this.#pointerMove(event);
      this.#onPointerUp = (event) => this.#pointerUp(event);
      this.#onViewport = () => this.#clampVisible(true);
    }
    #host;
    #root;
    #els;
    #stickBottom;
    #lastLogId;
    #mounted;
    #providerSig;
    #adapterSig;
    #hotkeySig;
    #detail;
    #issues;
    #issueNotes;
    #openCauses;
    #flashAt;
    #flashTimers;
    #wide;
    #pill;
    #layoutHeight;
    #layoutWidth;
    #layoutLeft;
    #layoutTop;
    #drag;
    #panelObserver;
    #saveTimer;
    #onPointerMove;
    #onPointerUp;
    #onViewport;
    /** @param {'auto' | HTMLElement} [target] */
    mount(target = "auto") {
      if (typeof document === "undefined") return this;
      const node = target === "auto" || !target ? document.body : target;
      if (!node) {
        document.addEventListener("DOMContentLoaded", () => this.mount(target), { once: true });
        return this;
      }
      if (this.#mounted) this.unmount();
      if (typeof customElements !== "undefined" && !customElements.get(HOST_TAG)) {
        customElements.define(HOST_TAG, class extends HTMLElement {
        });
      }
      this.#host = document.createElement(HOST_TAG);
      this.#root = this.#host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = STYLES;
      const overlay = document.createElement("div");
      overlay.className = "bl-root";
      overlay.setAttribute("data-visible", "true");
      const pill = document.createElement("button");
      pill.className = "bl-pill";
      pill.setAttribute("data-el", "pill");
      pill.setAttribute("type", "button");
      pill.hidden = true;
      pill.setAttribute("aria-label", "Open BeeLadybug panel");
      const pillMark = document.createElement("span");
      pillMark.className = "bl-mark";
      pillMark.setAttribute("aria-hidden", "true");
      const pillFps = document.createElement("span");
      pillFps.setAttribute("data-el", "pillFps");
      pillFps.textContent = "\u2014";
      pill.append(pillMark, pillFps);
      const panel = document.createElement("div");
      panel.className = "bl-panel";
      const scan = document.createElement("div");
      scan.className = "bl-scan";
      const head = document.createElement("div");
      head.className = "bl-head";
      const headMark = document.createElement("span");
      headMark.className = "bl-mark";
      headMark.setAttribute("aria-hidden", "true");
      const title = document.createElement("span");
      title.className = "bl-title";
      title.textContent = "BEE LADYBUG";
      const badge = document.createElement("span");
      badge.className = "bl-badge";
      badge.textContent = "CORE";
      const modeWrap = document.createElement("span");
      modeWrap.className = "bl-mode-wrap";
      const mode = document.createElement("span");
      mode.className = "bl-mode";
      mode.setAttribute("data-el", "mode");
      mode.textContent = "LIVE";
      const wideBtn = document.createElement("button");
      wideBtn.className = "bl-size";
      wideBtn.setAttribute("data-el", "wide");
      wideBtn.setAttribute("type", "button");
      wideBtn.setAttribute("aria-pressed", "false");
      wideBtn.setAttribute("aria-label", "Wide panel");
      wideBtn.textContent = "WIDE";
      const pillToggle = document.createElement("button");
      pillToggle.className = "bl-size";
      pillToggle.setAttribute("data-el", "pillToggle");
      pillToggle.setAttribute("type", "button");
      pillToggle.setAttribute("aria-pressed", "false");
      pillToggle.setAttribute("aria-label", "Reduce to a pill");
      pillToggle.textContent = "PILL";
      const infoBtn = document.createElement("button");
      infoBtn.className = "bl-info";
      infoBtn.setAttribute("type", "button");
      infoBtn.setAttribute("aria-describedby", "bl-freeze-tip");
      infoBtn.setAttribute("aria-label", "Freeze stops the simulated clock, not this overlay");
      const infoIcon = document.createElement("span");
      infoIcon.setAttribute("aria-hidden", "true");
      infoIcon.textContent = "\u24D8";
      const infoTip = document.createElement("span");
      infoTip.className = "bl-info-tip";
      infoTip.id = "bl-freeze-tip";
      infoTip.textContent = "Freeze does not stop this overlay. It only stops the simulated clock. Adapters must listen for the sys event (op: freeze).";
      infoBtn.append(infoIcon, infoTip);
      modeWrap.append(mode, wideBtn, pillToggle, infoBtn);
      head.append(headMark, title, badge, modeWrap);
      const scroll = document.createElement("div");
      scroll.className = "bl-scroll";
      const status = document.createElement("section");
      status.className = "bl-section";
      status.setAttribute("data-section", "status");
      status.setAttribute("data-open", "true");
      const statusToggle = document.createElement("button");
      statusToggle.className = "bl-section-toggle";
      statusToggle.setAttribute("type", "button");
      statusToggle.setAttribute("data-section-toggle", "");
      statusToggle.setAttribute("aria-expanded", "true");
      statusToggle.textContent = "STATUS";
      const statusBody = document.createElement("div");
      statusBody.className = "bl-section-body";
      const stats = document.createElement("div");
      stats.className = "bl-stats";
      const hostStat = document.createElement("div");
      const hostFps = document.createElement("b");
      hostFps.setAttribute("data-el", "hostFps");
      hostFps.textContent = "\u2014";
      hostStat.append("HOST ", hostFps);
      const coreStat = document.createElement("div");
      const coreFps = document.createElement("b");
      coreFps.setAttribute("data-el", "coreFps");
      coreFps.textContent = "\u2014";
      coreStat.append("CORE ", coreFps);
      const frameStat = document.createElement("div");
      const frameEl = document.createElement("b");
      frameEl.setAttribute("data-el", "frame");
      frameEl.textContent = "0";
      frameStat.append("FRAME ", frameEl);
      const simStat = document.createElement("div");
      const simEl = document.createElement("b");
      simEl.setAttribute("data-el", "sim");
      simEl.textContent = "00:00.0";
      simStat.append("SIM ", simEl);
      stats.append(hostStat, coreStat, frameStat, simStat);
      const graphWrap = document.createElement("div");
      graphWrap.className = "bl-graph-wrap";
      const graph = document.createElement("canvas");
      graph.className = "bl-graph";
      graph.setAttribute("data-el", "graph");
      graph.setAttribute("width", "336");
      graph.setAttribute("height", "52");
      const graphLabel = document.createElement("div");
      graphLabel.className = "bl-graph-label";
      const graphName = document.createElement("span");
      graphName.setAttribute("data-el", "graphName");
      graphName.textContent = "HISTORY";
      const graphStats = document.createElement("span");
      graphStats.setAttribute("data-el", "graphStats");
      graphStats.textContent = "min \u2014  max \u2014";
      graphLabel.append(graphName, graphStats);
      graphWrap.append(graph, graphLabel);
      const hud = document.createElement("div");
      hud.className = "bl-hud";
      hud.setAttribute("data-el", "hud");
      statusBody.append(stats, graphWrap, hud);
      status.append(statusToggle, statusBody);
      const issues = document.createElement("section");
      issues.className = "bl-section";
      issues.setAttribute("data-el", "issues");
      issues.setAttribute("data-section", "issues");
      issues.setAttribute("data-open", "true");
      issues.hidden = true;
      const issuesToggle = document.createElement("button");
      issuesToggle.className = "bl-section-toggle";
      issuesToggle.setAttribute("type", "button");
      issuesToggle.setAttribute("data-section-toggle", "");
      issuesToggle.setAttribute("aria-expanded", "true");
      issuesToggle.textContent = "ISSUES";
      const issuesBody = document.createElement("div");
      issuesBody.className = "bl-section-body";
      const legend = document.createElement("div");
      legend.className = "bl-legend";
      const bugSpan = document.createElement("span");
      const bugDot = document.createElement("i");
      bugDot.className = "bl-dot bug";
      bugSpan.append(bugDot, "bug");
      const infoSpan = document.createElement("span");
      const infoDot = document.createElement("i");
      infoDot.className = "bl-dot info";
      infoSpan.append(infoDot, "info");
      legend.append(bugSpan, infoSpan);
      const issuesList = document.createElement("div");
      issuesList.setAttribute("data-el", "issues-list");
      const notesEl = document.createElement("div");
      notesEl.setAttribute("data-el", "notes");
      issuesBody.append(legend, issuesList, notesEl);
      issues.append(issuesToggle, issuesBody);
      const inspect = document.createElement("section");
      inspect.className = "bl-section";
      inspect.setAttribute("data-el", "inspect");
      inspect.setAttribute("data-section", "inspect");
      inspect.setAttribute("data-open", "true");
      inspect.hidden = true;
      const inspectToggle = document.createElement("button");
      inspectToggle.className = "bl-section-toggle";
      inspectToggle.setAttribute("type", "button");
      inspectToggle.setAttribute("data-section-toggle", "");
      inspectToggle.setAttribute("aria-expanded", "true");
      inspectToggle.textContent = "INSPECT";
      const inspectBody = document.createElement("div");
      inspectBody.className = "bl-section-body";
      const detail = document.createElement("div");
      detail.className = "bl-detail";
      detail.setAttribute("data-el", "detail");
      detail.hidden = true;
      inspectBody.append(detail);
      inspect.append(inspectToggle, inspectBody);
      const events = document.createElement("section");
      events.className = "bl-section";
      events.setAttribute("data-section", "events");
      events.setAttribute("data-open", "true");
      const eventsToggle = document.createElement("button");
      eventsToggle.className = "bl-section-toggle";
      eventsToggle.setAttribute("type", "button");
      eventsToggle.setAttribute("data-section-toggle", "");
      eventsToggle.setAttribute("aria-expanded", "true");
      eventsToggle.textContent = "EVENTS";
      const eventsBody = document.createElement("div");
      eventsBody.className = "bl-section-body";
      const consoleBox = document.createElement("div");
      consoleBox.className = "bl-console";
      consoleBox.setAttribute("data-el", "console");
      consoleBox.setAttribute("role", "log");
      consoleBox.setAttribute("aria-live", "polite");
      eventsBody.append(consoleBox);
      events.append(eventsToggle, eventsBody);
      scroll.append(status, issues, inspect, events);
      const foot = document.createElement("div");
      foot.className = "bl-foot";
      const slowBtn = document.createElement("button");
      slowBtn.className = "bl-btn";
      slowBtn.setAttribute("data-act", "slow");
      slowBtn.setAttribute("type", "button");
      slowBtn.textContent = "F3 SLOW";
      const freezeBtn = document.createElement("button");
      freezeBtn.className = "bl-btn";
      freezeBtn.setAttribute("data-act", "freeze");
      freezeBtn.setAttribute("type", "button");
      freezeBtn.textContent = "F4 STOP";
      const liveBtn = document.createElement("button");
      liveBtn.className = "bl-btn";
      liveBtn.setAttribute("data-act", "live");
      liveBtn.setAttribute("type", "button");
      liveBtn.textContent = "1x LIVE";
      const exportBtn = document.createElement("button");
      exportBtn.className = "bl-btn";
      exportBtn.setAttribute("data-act", "export");
      exportBtn.setAttribute("type", "button");
      exportBtn.textContent = "F8 EXPORT";
      const hotkeys = document.createElement("span");
      hotkeys.className = "bl-hotkeys";
      hotkeys.setAttribute("data-el", "hotkeys");
      const askBtn = document.createElement("button");
      askBtn.className = "bl-btn";
      askBtn.setAttribute("data-act", "ask");
      askBtn.setAttribute("type", "button");
      askBtn.textContent = "ASK AI";
      const providers = document.createElement("span");
      providers.className = "bl-providers";
      providers.setAttribute("data-el", "providers");
      const adapters = document.createElement("span");
      adapters.className = "bl-adapters";
      adapters.setAttribute("data-el", "adapters");
      const hint = document.createElement("span");
      hint.className = "bl-hint";
      hint.textContent = "F2 overlay \u00B7 F8 export";
      foot.append(slowBtn, freezeBtn, liveBtn, exportBtn, hotkeys, askBtn, providers, adapters, hint);
      panel.append(scan, head, scroll, foot);
      overlay.append(pill, panel);
      this.#root.replaceChildren(style, overlay);
      this.#els = {
        root: this.#root.querySelector(".bl-root"),
        mode: this.#root.querySelector('[data-el="mode"]'),
        hostFps: this.#root.querySelector('[data-el="hostFps"]'),
        coreFps: this.#root.querySelector('[data-el="coreFps"]'),
        frame: this.#root.querySelector('[data-el="frame"]'),
        sim: this.#root.querySelector('[data-el="sim"]'),
        graph: this.#root.querySelector('[data-el="graph"]'),
        graphName: this.#root.querySelector('[data-el="graphName"]'),
        graphStats: this.#root.querySelector('[data-el="graphStats"]'),
        hud: this.#root.querySelector('[data-el="hud"]'),
        console: this.#root.querySelector('[data-el="console"]'),
        detail: this.#root.querySelector('[data-el="detail"]'),
        inspect: this.#root.querySelector('[data-el="inspect"]'),
        issues: this.#root.querySelector('[data-el="issues"]'),
        issuesList: this.#root.querySelector('[data-el="issues-list"]'),
        notes: this.#root.querySelector('[data-el="notes"]'),
        providers: this.#root.querySelector('[data-el="providers"]'),
        adapters: this.#root.querySelector('[data-el="adapters"]'),
        hotkeys: this.#root.querySelector('[data-el="hotkeys"]'),
        panel: this.#root.querySelector(".bl-panel"),
        wide: this.#root.querySelector('[data-el="wide"]'),
        pill: this.#root.querySelector('[data-el="pill"]'),
        pillFps: this.#root.querySelector('[data-el="pillFps"]'),
        pillToggle: this.#root.querySelector('[data-el="pillToggle"]')
      };
      this.#els.wide?.addEventListener("click", () => this.#toggleWide());
      this.#els.pillToggle?.addEventListener("click", () => this.#setPill(true));
      this.#root.querySelector(".bl-foot").addEventListener("click", (event) => {
        const btn = event.target.closest("[data-act]");
        if (!btn) return;
        const act = btn.getAttribute("data-act");
        if (act === "slow") this.core.applySlowMo();
        else if (act === "freeze") this.core.toggleFreeze();
        else if (act === "live") this.core.restoreRealtime();
        else if (act === "export") this.core.exportReport("html");
        else if (act === "ask") this.core.ask();
        else if (act === "assist") this.core.setActiveAssistant(btn.getAttribute("data-name"));
        else if (act === "adapter") this.core.toggleAdapter(btn.getAttribute("data-name"));
      });
      this.#root.querySelector(".bl-scroll")?.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-section-toggle]");
        if (!toggle) return;
        const section = toggle.closest(".bl-section");
        if (!section) return;
        const open = section.dataset.open === "false";
        section.dataset.open = open ? "true" : "false";
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      this.#els.issues?.addEventListener("click", (event) => {
        if (event.target.closest("[data-section-toggle]")) return;
        const childBtn = event.target.closest("[data-target]");
        if (childBtn) {
          const item2 = this.#issues[Number(childBtn.getAttribute("data-issue"))];
          const child = item2?.targets?.[Number(childBtn.getAttribute("data-target"))];
          if (child && typeof child.onSelect === "function") child.onSelect();
          return;
        }
        const row = event.target.closest("[data-issue]");
        if (!row) return;
        const item = this.#issues[Number(row.getAttribute("data-issue"))];
        if (!item) return;
        const many = Array.isArray(item.targets) && item.targets.length > 1;
        if (many) {
          const key = item.key || item.text;
          if (this.#openCauses.has(key)) this.#openCauses.delete(key);
          else this.#openCauses.add(key);
          this.setIssues(this.#issues.concat(this.#issueNotes));
          return;
        }
        const only = item.targets?.[0];
        if (only && typeof only.onSelect === "function") only.onSelect();
        else if (typeof item.onSelect === "function") item.onSelect();
      });
      this.#root.querySelector(".bl-detail")?.addEventListener("click", (event) => {
        const row = event.target.closest("[data-detail]");
        if (!row) return;
        const item = this.#detail[Number(row.getAttribute("data-detail"))];
        if (item && typeof item.onSelect === "function") item.onSelect();
      });
      this.#els.console.addEventListener("scroll", () => {
        const el = this.#els.console;
        this.#stickBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
      });
      this.#restoreLayout();
      node.appendChild(this.#host);
      this.#mounted = true;
      this.#applyChrome();
      this.#clampVisible(false);
      this.#bindDrag();
      this.#watchViewport();
      this.#watchPanel();
      this.setVisible(this.core.visible);
      this.#replayLogs();
      this.render();
      return this;
    }
    unmount() {
      this.#stopDrag();
      this.#watchViewport(false);
      this.#stopPanelWatch();
      if (this.#host?.parentNode) this.#host.parentNode.removeChild(this.#host);
      this.#host = null;
      this.#root = null;
      this.#els = null;
      this.#mounted = false;
      this.#providerSig = "";
      this.#adapterSig = "";
      this.#hotkeySig = "";
      this.#detail = [];
      this.#issues = [];
      this.#issueNotes = [];
      this.#openCauses.clear();
      this.#clearFlashTimers();
      this.#flashAt.clear();
      this.#wide = false;
      this.#pill = false;
      this.#layoutHeight = null;
      this.#layoutWidth = null;
      this.#layoutLeft = null;
      this.#layoutTop = null;
      return this;
    }
    destroy() {
      this.unmount();
      this.core = null;
      return this;
    }
    setVisible(visible) {
      if (!this.#els) return this;
      this.#els.root.dataset.visible = visible ? "true" : "false";
      return this;
    }
    /**
     * @param {Array<{ text: string, level?: string, onSelect?: () => void }>} items
     */
    setDetail(items) {
      if (!this.#els?.detail) return this;
      const list = Array.isArray(items) ? items : [];
      this.#detail = list;
      const box = this.#els.detail;
      const section = this.#els.inspect;
      if (!list.length) {
        box.replaceChildren();
        box.hidden = true;
        if (section) section.hidden = true;
        return this;
      }
      const detailNodes = [];
      for (let i = 0; i < list.length; i++) {
        const level = list[i].level === "error" || list[i].level === "warn" ? list[i].level : "info";
        const button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("data-detail", String(i));
        button.setAttribute("data-level", level);
        button.textContent = String(list[i].text);
        detailNodes.push(button);
      }
      box.hidden = false;
      if (section) section.hidden = false;
      box.replaceChildren(...detailNodes);
      return this;
    }
    /**
     * Cause rows plus grey info notes. Bugs are red and expand; info stays grey.
     * @param {Array<{ text: string, level?: string, key?: string, onSelect?: () => void, targets?: Array<{ text: string, onSelect?: () => void }> }>} items
     */
    setIssues(items) {
      if (!this.#els?.issues || !this.#els.issuesList || !this.#els.notes) return this;
      const list = Array.isArray(items) ? items : [];
      const bugs = [];
      const notes = [];
      for (let i = 0; i < list.length; i++) {
        if (list[i].level === "info") notes.push(list[i]);
        else bugs.push(list[i]);
      }
      const capped = bugs.slice(0, 10);
      this.#issues = capped;
      this.#issueNotes = notes;
      const section = this.#els.issues;
      if (!capped.length && !notes.length) {
        this.#els.issuesList.replaceChildren();
        this.#els.notes.replaceChildren();
        section.hidden = true;
        return this;
      }
      const causeNodes = [];
      for (let i = 0; i < capped.length; i++) {
        const item = capped[i];
        const targets = Array.isArray(item.targets) ? item.targets : [];
        const many = targets.length > 1;
        const open = many && this.#openCauses.has(item.key || item.text);
        const cause = document.createElement("div");
        cause.className = "bl-cause";
        cause.setAttribute("data-open", open ? "true" : "false");
        const button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("data-issue", String(i));
        button.textContent = (many ? open ? "\u25BE " : "\u25B8 " : "") + String(item.text);
        cause.append(button);
        if (many) {
          const kids = document.createElement("div");
          kids.className = "bl-cause-kids";
          if (!open) kids.hidden = true;
          for (let j = 0; j < targets.length; j++) {
            const child = document.createElement("button");
            child.setAttribute("type", "button");
            child.setAttribute("data-issue", String(i));
            child.setAttribute("data-target", String(j));
            child.textContent = String(targets[j].text);
            kids.append(child);
          }
          cause.append(kids);
        }
        causeNodes.push(cause);
      }
      this.#els.issuesList.replaceChildren(...causeNodes);
      const noteNodes = [];
      for (let i = 0; i < notes.length; i++) {
        const note = document.createElement("div");
        note.className = "bl-note";
        note.textContent = String(notes[i].text);
        noteNodes.push(note);
      }
      this.#els.notes.replaceChildren(...noteNodes);
      section.hidden = false;
      return this;
    }
    onPacket(packet) {
      if (!this.#els || !packet) return;
      if (packet.type === "sys") return;
      this.#flashAdapterButton(packet);
      if (packet.level || packet.type === "log" || packet.type === "warn" || packet.type === "error") {
        this.#appendLine(packet);
      }
    }
    onClear(channel) {
      if (!this.#els) return;
      if (!channel || channel === "logs") {
        this.#els.console.replaceChildren();
        this.#lastLogId = 0;
      }
      if (!channel || channel === "hud") this.#els.hud.replaceChildren();
    }
    render() {
      if (!this.#els || !this.core) return;
      const state = this.core.getState();
      const host = this.core.getHistory("fps");
      const primary = this.core.getPrimaryHistory();
      this.#els.mode.textContent = state.mode;
      this.#els.mode.dataset.mode = state.mode;
      this.#els.hostFps.textContent = host.values.length ? host.last.toFixed(1) : "\u2014";
      this.#els.coreFps.textContent = state.coreFps.toFixed(1);
      if (this.#els.pillFps) {
        const fps = host.values.length ? host.last : state.coreFps;
        this.#els.pillFps.textContent = Number.isFinite(fps) ? `${fps.toFixed(1)} fps` : "\u2014";
      }
      this.#els.frame.textContent = String(state.frameCount);
      this.#els.sim.textContent = formatSimTime(state.simTime);
      this.#paintGraph(primary);
      this.#renderHud(state.hud);
      this.#syncButtons(state);
      this.#syncProviders(state);
      this.#syncHotkeys(state);
      this.#syncAdapters(state);
      if (this.#stickBottom) {
        this.#els.console.scrollTop = this.#els.console.scrollHeight;
      }
    }
    #replayLogs() {
      const logs = this.core.getLogs();
      for (let i = 0; i < logs.length; i++) this.#appendLine(logs[i]);
    }
    #appendLine(packet) {
      if (!this.#els || packet.id <= this.#lastLogId) return;
      this.#lastLogId = packet.id;
      const line = document.createElement("div");
      const level = packet.level || "info";
      line.className = `bl-line ${level}`;
      const msg = packet.payload.message ?? packet.payload.value ?? packet.type;
      const time = document.createElement("span");
      time.className = "t";
      time.textContent = formatSimTime(packet.simTime);
      const source = document.createElement("span");
      source.className = "s";
      source.textContent = String(packet.source);
      const message = document.createElement("span");
      message.className = "m";
      message.textContent = String(msg);
      line.append(time, source, message);
      this.#els.console.appendChild(line);
      const max = this.core.maxLogs;
      while (this.#els.console.childElementCount > max) {
        this.#els.console.removeChild(this.#els.console.firstChild);
      }
    }
    #renderHud(hud) {
      const skip = /* @__PURE__ */ new Set(["frame", "sim", "scale", "fps"]);
      const keys = Object.keys(hud).filter((k) => !skip.has(k));
      if (!keys.length) {
        const idleKey = document.createElement("span");
        idleKey.className = "bl-k";
        idleKey.textContent = "idle";
        const idleValue = document.createElement("span");
        idleValue.className = "bl-v";
        idleValue.textContent = "no adapter data";
        this.#els.hud.replaceChildren(idleKey, idleValue);
        return;
      }
      const hudNodes = [];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const entry = hud[key];
        const unit = entry.unit ? ` ${entry.unit}` : "";
        const keyEl = document.createElement("span");
        keyEl.className = "bl-k";
        keyEl.textContent = key;
        const valueEl = document.createElement("span");
        valueEl.className = "bl-v";
        valueEl.textContent = `${fmtHud(entry.value)}${unit}`;
        hudNodes.push(keyEl, valueEl);
      }
      this.#els.hud.replaceChildren(...hudNodes);
    }
    #syncButtons(state) {
      const slow = this.#root.querySelector('[data-act="slow"]');
      const freeze = this.#root.querySelector('[data-act="freeze"]');
      const live = this.#root.querySelector('[data-act="live"]');
      freeze.dataset.hot = state.frozen ? "true" : "false";
      slow.dataset.hot = !state.frozen && state.timeScale !== 1 ? "true" : "false";
      live.dataset.hot = !state.frozen && state.timeScale === 1 ? "true" : "false";
      const ask = this.#root.querySelector('[data-act="ask"]');
      if (ask) {
        ask.dataset.hot = this.core.hasAssistant ? "true" : "false";
        ask.disabled = Boolean(this.core.assistantBusy);
      }
    }
    #syncProviders(state) {
      const wrap = this.#els.providers;
      if (!wrap) return;
      const names = Array.isArray(state.assistants) ? state.assistants : [];
      const active = state.assistant ?? "";
      const sig = `${names.join("\0")}\0${active}`;
      if (sig === this.#providerSig) return;
      this.#providerSig = sig;
      const providerNodes = [];
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const hot = name === active ? "true" : "false";
        const button = document.createElement("button");
        button.className = "bl-provider";
        button.setAttribute("data-act", "assist");
        button.setAttribute("data-name", name);
        button.setAttribute("data-hot", hot);
        button.setAttribute("type", "button");
        button.title = String(name);
        button.textContent = abbrevName(name);
        providerNodes.push(button);
      }
      wrap.replaceChildren(...providerNodes);
    }
    #syncHotkeys(state) {
      const wrap = this.#els.hotkeys;
      if (!wrap) return;
      const list = (Array.isArray(state.adapters) ? state.adapters : []).filter((entry) => entry.hotkey);
      const sig = list.map((entry) => `${entry.name}\0${entry.label}\0${entry.enabled ? 1 : 0}`).join("\n");
      if (sig === this.#hotkeySig) return;
      this.#hotkeySig = sig;
      const hotkeyNodes = [];
      for (let i = 0; i < list.length; i++) {
        const entry = list[i];
        const hot = entry.enabled ? "true" : "false";
        const button = document.createElement("button");
        button.className = "bl-btn";
        button.setAttribute("data-act", "adapter");
        button.setAttribute("data-name", entry.name);
        button.setAttribute("data-hot", hot);
        button.setAttribute("type", "button");
        button.textContent = String(entry.label);
        hotkeyNodes.push(button);
      }
      wrap.replaceChildren(...hotkeyNodes);
    }
    #syncAdapters(state) {
      const wrap = this.#els.adapters;
      if (!wrap) return;
      const list = (Array.isArray(state.adapters) ? state.adapters : []).filter((entry) => !entry.hotkey);
      const sig = list.map((entry) => `${entry.name}\0${entry.label}\0${entry.enabled ? 1 : 0}`).join("\n");
      if (sig === this.#adapterSig) return;
      this.#adapterSig = sig;
      const adapterNodes = [];
      for (let i = 0; i < list.length; i++) {
        const entry = list[i];
        const hot = entry.enabled ? "true" : "false";
        const button = document.createElement("button");
        button.className = "bl-adapter";
        button.setAttribute("data-act", "adapter");
        button.setAttribute("data-name", entry.name);
        button.setAttribute("data-hot", hot);
        button.setAttribute("type", "button");
        button.title = String(entry.label);
        button.textContent = String(entry.label);
        adapterNodes.push(button);
      }
      wrap.replaceChildren(...adapterNodes);
    }
    #flashAdapterButton(packet) {
      if (packet.type !== "warn" && packet.type !== "telemetry") return;
      const wrap = this.#els.adapters;
      if (!wrap || !this.core || typeof this.core.getAdapters !== "function") return;
      const name = packet.source;
      if (!this.core.getAdapters().some((entry) => entry.name === name)) return;
      const escaped = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(name) : name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      const btn = wrap.querySelector(`[data-name="${escaped}"]`);
      if (!btn) return;
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const last = this.#flashAt.get(name) ?? 0;
      if (now - last < 1500) return;
      this.#flashAt.set(name, now);
      btn.dataset.flash = "false";
      void btn.offsetWidth;
      btn.dataset.flash = "true";
      const prev = this.#flashTimers.get(name);
      if (prev && typeof clearTimeout === "function") clearTimeout(prev);
      if (typeof setTimeout !== "function") return;
      const timer = setTimeout(() => {
        this.#flashTimers.delete(name);
        if (btn.dataset.flash === "true") btn.dataset.flash = "false";
      }, 560);
      this.#flashTimers.set(name, timer);
    }
    #clearFlashTimers() {
      if (typeof clearTimeout !== "function") {
        this.#flashTimers.clear();
        return;
      }
      for (const timer of this.#flashTimers.values()) clearTimeout(timer);
      this.#flashTimers.clear();
    }
    #toggleWide() {
      const panel = this.#els?.panel;
      if (!panel) return;
      this.#wide = !this.#wide;
      const width = Math.min(this.#wide ? PANEL_WIDE : PANEL_COMPACT, this.#widthCap());
      panel.style.width = `${Math.round(width)}px`;
      this.#layoutWidth = Math.round(width);
      this.#syncWideButton();
      this.#rememberLayout();
      if (this.core) this.#paintGraph(this.core.getPrimaryHistory());
    }
    #syncWideButton() {
      const btn = this.#els?.wide;
      if (!btn) return;
      btn.textContent = this.#wide ? "COMPACT" : "WIDE";
      btn.setAttribute("aria-pressed", this.#wide ? "true" : "false");
      btn.setAttribute("aria-label", this.#wide ? "Compact panel" : "Wide panel");
    }
    #restoreLayout() {
      const panel = this.#els?.panel;
      if (!panel) return;
      const saved = readPanelStore();
      if (!saved) {
        this.#syncWideButton();
        return;
      }
      this.#wide = saved.wide === true;
      let width = Number(saved.width);
      if (!Number.isFinite(width)) width = this.#wide ? PANEL_WIDE : PANEL_COMPACT;
      width = Math.min(Math.max(width, PANEL_MIN_W), this.#widthCap());
      panel.style.width = `${Math.round(width)}px`;
      this.#layoutWidth = Math.round(width);
      const height = Number(saved.height);
      if (Number.isFinite(height) && height >= 120) {
        const next = Math.min(height, this.#heightCap());
        panel.style.height = `${Math.round(next)}px`;
        this.#layoutHeight = Math.round(next);
      }
      const left = Number(saved.left);
      const top = Number(saved.top);
      if (Number.isFinite(left)) {
        panel.style.left = `${Math.round(left)}px`;
        this.#layoutLeft = Math.round(left);
      }
      if (Number.isFinite(top)) {
        panel.style.top = `${Math.round(top)}px`;
        this.#layoutTop = Math.round(top);
      }
      this.#pill = saved.pill === true;
      this.#syncWideButton();
      this.#syncPillButton();
    }
    #watchPanel() {
      const panel = this.#els?.panel;
      if (!panel || typeof ResizeObserver !== "function") return;
      this.#panelObserver = new ResizeObserver(() => this.#onPanelSize());
      this.#panelObserver.observe(panel);
    }
    #stopPanelWatch() {
      if (this.#panelObserver) {
        this.#panelObserver.disconnect();
        this.#panelObserver = null;
      }
      if (this.#saveTimer && typeof clearTimeout === "function") clearTimeout(this.#saveTimer);
      this.#saveTimer = 0;
    }
    #onPanelSize() {
      const panel = this.#els?.panel;
      const canvas = this.#els?.graph;
      if (!panel || !canvas || !this.core) return;
      if (canvas.clientWidth < 2 || canvas.clientHeight < 2) return;
      if (panel.style.height) {
        const height = Math.round(panel.getBoundingClientRect().height);
        if (height >= 120) this.#layoutHeight = height;
      }
      this.#paintGraph(this.core.getPrimaryHistory());
      this.#queueLayoutSave();
    }
    #queueLayoutSave() {
      if (typeof setTimeout !== "function") {
        this.#rememberLayout();
        return;
      }
      if (this.#saveTimer) clearTimeout(this.#saveTimer);
      this.#saveTimer = setTimeout(() => {
        this.#saveTimer = 0;
        this.#rememberLayout();
      }, 150);
    }
    #rememberLayout() {
      const panel = this.#els?.panel;
      if (!panel || !panel.isConnected) return;
      let width = this.#layoutWidth;
      if (!this.#pill) {
        const rect = panel.getBoundingClientRect();
        if (rect.width >= 80) {
          width = Math.round(rect.width);
          this.#layoutWidth = width;
        }
        const offset = this.#offsetOf(panel);
        this.#layoutLeft = Math.round(offset.left);
        this.#layoutTop = Math.round(offset.top);
      }
      if (!(width >= 80)) return;
      const data = {
        width: Math.round(width),
        height: this.#layoutHeight,
        wide: this.#wide === true,
        left: Number.isFinite(this.#layoutLeft) ? this.#layoutLeft : 12,
        top: Number.isFinite(this.#layoutTop) ? this.#layoutTop : 12,
        pill: this.#pill === true
      };
      try {
        if (typeof localStorage === "undefined") return;
        localStorage.setItem(PANEL_STORE_KEY, JSON.stringify(data));
      } catch {
      }
    }
    #widthCap() {
      if (typeof window === "undefined") return PANEL_WIDE;
      const view = Number(window.innerWidth) || PANEL_COMPACT;
      return Math.max(PANEL_MIN_W, Math.floor(view * 0.9));
    }
    #heightCap() {
      if (typeof window === "undefined") return 900;
      const view = Number(window.innerHeight) || 400;
      return Math.max(160, Math.floor(view * 0.9));
    }
    #bindDrag() {
      const head = this.#root?.querySelector(".bl-head");
      head?.addEventListener("pointerdown", (event) => this.#pointerDown(event, head, false));
      this.#els?.pill?.addEventListener("pointerdown", (event) => this.#pointerDown(event, this.#els.pill, true));
    }
    #pointerDown(event, handle, fromPill) {
      if (!handle || event.button != null && event.button !== 0) return;
      if (!fromPill && event.target.closest("button")) return;
      const el = fromPill ? this.#els?.pill : this.#els?.panel;
      if (!el) return;
      event.preventDefault();
      const origin = this.#offsetOf(el);
      this.#drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        left: origin.left,
        top: origin.top,
        moved: false,
        fromPill,
        handle
      };
      el.dataset.dragging = "true";
      try {
        handle.setPointerCapture(event.pointerId);
      } catch {
      }
      handle.addEventListener("pointermove", this.#onPointerMove);
      handle.addEventListener("pointerup", this.#onPointerUp);
      handle.addEventListener("pointercancel", this.#onPointerUp);
    }
    #pointerMove(event) {
      const drag = this.#drag;
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (Math.hypot(dx, dy) <= 10) return;
      drag.moved = true;
      const el = drag.fromPill ? this.#els?.pill : this.#els?.panel;
      if (!el) return;
      this.#moveEl(el, drag.left + dx, drag.top + dy);
    }
    #pointerUp(event) {
      const drag = this.#drag;
      if (!drag || event.pointerId !== drag.id) return;
      const reopen = event.type === "pointerup" && drag.fromPill && !drag.moved;
      this.#stopDrag();
      this.#rememberLayout();
      if (reopen) this.#setPill(false);
    }
    #stopDrag() {
      const drag = this.#drag;
      if (drag?.handle) {
        drag.handle.removeEventListener("pointermove", this.#onPointerMove);
        drag.handle.removeEventListener("pointerup", this.#onPointerUp);
        drag.handle.removeEventListener("pointercancel", this.#onPointerUp);
      }
      this.#drag = null;
      if (this.#els?.panel) delete this.#els.panel.dataset.dragging;
      if (this.#els?.pill) delete this.#els.pill.dataset.dragging;
    }
    #watchViewport(on = true) {
      if (typeof window === "undefined") return;
      window.removeEventListener("resize", this.#onViewport);
      if (on) window.addEventListener("resize", this.#onViewport);
    }
    #setPill(on) {
      const panel = this.#els?.panel;
      if (!panel) return;
      if (on && !this.#pill) {
        const rect = panel.getBoundingClientRect();
        if (rect.width >= 80) this.#layoutWidth = Math.round(rect.width);
        const offset = this.#offsetOf(panel);
        this.#layoutLeft = Math.round(offset.left);
        this.#layoutTop = Math.round(offset.top);
      }
      this.#pill = on === true;
      this.#applyChrome();
      const el = this.#pill ? this.#els.pill : panel;
      const left = Number.isFinite(this.#layoutLeft) ? this.#layoutLeft : 12;
      const top = Number.isFinite(this.#layoutTop) ? this.#layoutTop : 12;
      this.#moveEl(el, left, top);
      this.#syncPillButton();
      this.#rememberLayout();
      if (!this.#pill && this.core) this.#paintGraph(this.core.getPrimaryHistory());
    }
    #applyChrome() {
      const panel = this.#els?.panel;
      const pill = this.#els?.pill;
      if (panel) panel.dataset.collapsed = this.#pill ? "true" : "false";
      if (pill) pill.hidden = !this.#pill;
      this.#syncPillButton();
    }
    #syncPillButton() {
      const btn = this.#els?.pillToggle;
      if (!btn) return;
      btn.setAttribute("aria-pressed", this.#pill ? "true" : "false");
    }
    #clampVisible(save) {
      const el = this.#pill ? this.#els?.pill : this.#els?.panel;
      if (!el || el.hidden) return;
      const offset = this.#offsetOf(el);
      const left = Number.isFinite(this.#layoutLeft) ? this.#layoutLeft : offset.left;
      const top = Number.isFinite(this.#layoutTop) ? this.#layoutTop : offset.top;
      this.#moveEl(el, left, top);
      if (save) this.#queueLayoutSave();
    }
    #offsetOf(el) {
      const left = parseFloat(el.style.left);
      const top = parseFloat(el.style.top);
      if (Number.isFinite(left) && Number.isFinite(top)) return { left, top };
      const rect = el.getBoundingClientRect();
      return { left: rect.left, top: rect.top };
    }
    #moveEl(el, left, top) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const width = rect.width || el.offsetWidth;
      const height = rect.height || el.offsetHeight;
      let x = left;
      let y = top;
      if (width >= 2 && height >= 2 && typeof window !== "undefined") {
        const maxL = Math.max(0, window.innerWidth - width);
        const maxT = Math.max(0, window.innerHeight - height);
        x = Math.min(maxL, Math.max(0, left));
        y = Math.min(maxT, Math.max(0, top));
      }
      x = Math.round(x);
      y = Math.round(y);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      this.#layoutLeft = x;
      this.#layoutTop = y;
      const other = el === this.#els?.panel ? this.#els?.pill : this.#els?.panel;
      if (other) {
        other.style.left = `${x}px`;
        other.style.top = `${y}px`;
      }
    }
    #paintGraph(series) {
      const canvas = this.#els?.graph;
      if (!canvas || !series || this.#pill) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (cssW < 2 || cssH < 2) return;
      const pixelW = Math.round(cssW * dpr);
      const pixelH = Math.round(cssH * dpr);
      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = cssW;
      const h = cssH;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060a";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255, 211, 106, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.floor(h / 2) + 0.5);
      ctx.lineTo(w, Math.floor(h / 2) + 0.5);
      ctx.stroke();
      const values = series.values;
      this.#els.graphName.textContent = (series.name || "HISTORY").toUpperCase();
      if (!values.length) {
        this.#els.graphStats.textContent = "min \u2014  max \u2014";
        return;
      }
      const min = series.min;
      const max = series.max;
      const span = max - min || 1;
      ctx.beginPath();
      for (let i = 0; i < values.length; i++) {
        const x = i / Math.max(values.length - 1, 1) * (w - 2) + 1;
        const y = h - 3 - (values[i] - min) / span * (h - 6);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#ff3b4e";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      this.#els.graphStats.textContent = `min ${min.toFixed(1)}  max ${max.toFixed(1)}  avg ${series.avg.toFixed(1)}`;
    }
  };
  function readPanelStore() {
    try {
      if (typeof localStorage === "undefined") return null;
      const raw = localStorage.getItem(PANEL_STORE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;
      return data;
    } catch {
      return null;
    }
  }
  function abbrevName(name) {
    const s = String(name || "?");
    return s.slice(0, 2).toUpperCase();
  }
  function fmtHud(value) {
    if (value == null) return "\u2014";
    if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2);
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }
  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // src/core/AiAssistant.js
  var SECRET_KEY = /key|token|secret|password|authorization|cookie|apikey/i;
  function buildAssistantSnapshot(core, question) {
    const logs = core.getLogs().slice(-40).map((packet) => ({
      type: packet.type,
      level: packet.level,
      source: packet.source,
      message: String(packet.payload?.message ?? packet.payload?.value ?? packet.type),
      frame: packet.frame
    }));
    const history = core.getPrimaryHistory();
    return {
      question: String(question || ""),
      version: core.version,
      state: core.getState(),
      hud: scrub(core.getHud()),
      logs,
      history: {
        name: history.name,
        min: history.min,
        max: history.max,
        avg: history.avg,
        last: history.last,
        samples: history.values.slice(-24)
      }
    };
  }
  function normalizeAssistant(provider) {
    if (!provider || typeof provider.complete !== "function") return null;
    const name = typeof provider.name === "string" && provider.name ? provider.name : "custom";
    return { name, complete: provider.complete.bind(provider) };
  }
  function scrub(value, depth = 0) {
    if (value == null || typeof value !== "object") {
      if (typeof value === "string" && value.length > 400) return `${value.slice(0, 400)}\u2026`;
      return value;
    }
    if (depth > 4) return "[\u2026]";
    if (Array.isArray(value)) {
      return value.slice(0, 24).map((item) => scrub(item, depth + 1));
    }
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = SECRET_KEY.test(key) ? "[redacted]" : scrub(value[key], depth + 1);
    }
    return out;
  }

  // src/core/ReportExporter.js
  var LATEST_TYPES = Object.freeze([
    "fps",
    "metric",
    "coord",
    "log",
    "warn",
    "error",
    "state",
    "sys",
    "telemetry"
  ]);
  function exportReport(core, options = {}) {
    if (!core || typeof core.getState !== "function" || typeof core.collectSnapshots !== "function") {
      throw new TypeError("exportReport() needs a BeeLadybug core.");
    }
    const format = normalizeFormat(options.format);
    const report = buildReport(core);
    if (format === "json") {
      saveIfMounted(core, report, "json", "application/json", JSON.stringify(report, null, 2));
      return report;
    }
    if (format === "csv") {
      const text = renderCsv(report);
      saveIfMounted(core, report, "csv", "text/csv", text);
      return text;
    }
    const html = renderHtml(report);
    saveIfMounted(core, report, "html", "text/html", html);
    return html;
  }
  function isReportNoise(node) {
    if (!node || typeof node !== "object") return false;
    const el = node.nodeType === 1 ? node : node.parentElement || node;
    if (!el || typeof el !== "object") return false;
    const seen = /* @__PURE__ */ new Set();
    let current = el;
    while (current && typeof current === "object") {
      if (seen.has(current)) break;
      seen.add(current);
      if (current.id === "wpadminbar" || elementId(current) === "wpadminbar") return true;
      if (hasAbClass(classText(current))) return true;
      if (current.tagName === "BEE-LADYBUG-OVERLAY") return true;
      if (hasBeeAttribute(current)) return true;
      if (typeof current.closest === "function") {
        try {
          const bar = current.closest("#wpadminbar");
          if (bar) return true;
        } catch {
        }
      }
      current = current.parentElement || (current.parentNode && current.parentNode.nodeType === 1 ? current.parentNode : null);
    }
    const style = readStyle(el);
    if (style && (style.display === "none" || style.visibility === "hidden")) return true;
    if (typeof el.getBoundingClientRect === "function") {
      const rect = el.getBoundingClientRect();
      if (rect && (Number(rect.width) === 0 || Number(rect.height) === 0)) return true;
    }
    return false;
  }
  function buildReport(core) {
    const state = core.getState();
    const generatedAt = /* @__PURE__ */ new Date();
    const env = readEnvironment();
    const logs = readLogs(core);
    const series = readSeries(core);
    const latest = readLatest(core);
    const adapters = readAdapters(core);
    const summary = countFindings(adapters, logs);
    return {
      version: state.version,
      generatedAt: generatedAt.toISOString(),
      fileStamp: fileStamp(generatedAt),
      url: env.url,
      viewport: env.viewport,
      clock: {
        wallTime: generatedAt.getTime(),
        simTime: state.simTime,
        frame: state.frameCount,
        frozen: state.frozen,
        timeScale: state.timeScale,
        coreFps: state.coreFps
      },
      summary,
      logs,
      series,
      latest,
      adapters
    };
  }
  function readLogs(core) {
    const logs = typeof core.getLogs === "function" ? core.getLogs() : [];
    return logs.map((packet) => ({
      type: packet.type,
      level: packet.level ?? null,
      source: packet.source,
      message: packetMessage(packet),
      wallTime: packet.wallTime,
      simTime: packet.simTime,
      frame: packet.frame
    }));
  }
  function readSeries(core) {
    const names = /* @__PURE__ */ new Set(["fps"]);
    const hud = typeof core.getHud === "function" ? core.getHud() : {};
    for (const [name, entry] of Object.entries(hud)) {
      if (entry && entry.type === "metric") names.add(name);
    }
    const series = [];
    for (const name of names) {
      const history = core.getHistory(name);
      if (!history || !history.values || !history.values.length) continue;
      series.push({
        name: history.name,
        min: history.min,
        max: history.max,
        avg: history.avg,
        last: history.last,
        samples: history.values.slice()
      });
    }
    return series;
  }
  function readLatest(core) {
    if (typeof core.getLatest !== "function") return [];
    const packets = [];
    for (const type of LATEST_TYPES) {
      const packet = core.getLatest(type);
      if (!packet) continue;
      packets.push({
        id: packet.id,
        type: packet.type,
        payload: packet.payload,
        wallTime: packet.wallTime,
        simTime: packet.simTime,
        frame: packet.frame,
        source: packet.source,
        level: packet.level ?? null
      });
    }
    return packets;
  }
  function readAdapters(core) {
    const raw = core.collectSnapshots();
    const sections = [];
    for (const entry of raw) {
      if (entry.error) {
        sections.push({
          name: entry.name,
          items: [makeItem({
            severity: "warn",
            rule: "snapshot",
            value: entry.error,
            source: entry.name
          })]
        });
        continue;
      }
      const result = entry.result;
      const name = result && typeof result.name === "string" && result.name ? result.name : entry.name;
      const list = result && Array.isArray(result.items) ? result.items : [];
      sections.push({
        name,
        items: groupIdentical(list.filter((row) => row && typeof row === "object").map((row) => makeItem(row, name)))
      });
    }
    return sections;
  }
  function makeItem(row, fallbackSource = "") {
    return {
      severity: normalizeSeverity(row.severity),
      selector: asText(row.selector),
      rule: asText(row.rule),
      value: asText(row.value),
      source: asText(row.source) || fallbackSource
    };
  }
  function groupIdentical(items) {
    const order = [];
    const map = /* @__PURE__ */ new Map();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const key = `${item.selector}\0${item.rule}\0${item.value}`;
      const prev = map.get(key);
      if (!prev) {
        const row = { ...item, count: 1 };
        map.set(key, row);
        order.push(row);
        continue;
      }
      prev.count += 1;
    }
    return order.map((row) => ({
      severity: row.severity,
      selector: row.selector,
      rule: row.rule,
      value: row.count > 1 ? `${row.value} \xD7${row.count}` : row.value,
      source: row.source
    }));
  }
  function countFindings(adapters, logs) {
    const summary = { error: 0, warn: 0, info: 0, ok: 0 };
    for (const section of adapters) {
      for (const item of section.items) summary[item.severity] += 1;
    }
    for (let i = 0; i < logs.length; i++) summary[logSeverity(logs[i])] += 1;
    return summary;
  }
  function normalizeFormat(format) {
    if (format === "json" || format === "csv" || format === "html") return format;
    return "html";
  }
  function normalizeSeverity(value) {
    const text = String(value || "").toLowerCase();
    if (text === "error") return "error";
    if (text === "warn" || text === "warning" || text === "warm") return "warn";
    if (text === "info") return "info";
    return "ok";
  }
  function renderCsv(report) {
    const lines = ["adapter,severity,selector,rule,value,source"];
    for (const log of report.logs) {
      lines.push(csvRow([
        "core",
        logSeverity(log),
        "",
        log.type,
        log.message,
        log.source
      ]));
    }
    for (const series of report.series) {
      lines.push(csvRow([
        "core",
        "ok",
        "",
        series.name,
        `min ${formatNum(series.min)} / avg ${formatNum(series.avg)} / max ${formatNum(series.max)}`,
        "core"
      ]));
    }
    for (const section of report.adapters) {
      for (const item of section.items) {
        lines.push(csvRow([
          section.name,
          item.severity,
          item.selector,
          item.rule,
          item.value,
          item.source
        ]));
      }
    }
    return `${lines.join("\n")}
`;
  }
  function csvRow(cells) {
    return cells.map(csvCell).join(",");
  }
  function csvCell(value) {
    const text = value == null ? "" : String(value);
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }
  function logSeverity(log) {
    const level = String(log.level || "").toLowerCase();
    if (level === "warn" || level === "warning" || level === "warm") return "warn";
    if (level === "error" || log.type === "error") return "error";
    if (log.type === "warn") return "warn";
    return "ok";
  }
  function renderHtml(report) {
    const title = `BeeLadybug report ${report.fileStamp}`;
    const viewport = report.viewport ? `${report.viewport.width}\xD7${report.viewport.height}` : "n/a";
    const adapters = report.adapters.map((section) => {
      const items = section.items.filter((item) => !isFocusSkipOpacity(item));
      return {
        name: section.name,
        items: section.name === "css" ? groupImportantRows(items) : items
      };
    });
    const summary = htmlSummary(report, adapters);
    const sections = adapters.map((section) => renderSection(section)).join("\n");
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml2(title)}</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #07080c;
    color: #f1f2f6;
    font: 14px/1.45 ui-monospace, Consolas, monospace;
  }
  main { max-width: 1100px; margin: 0 auto; padding: 28px 22px 64px; }
  h1 { margin: 0 0 8px; color: #ff3b4e; font-size: 22px; letter-spacing: 0.04em; }
  h2 { margin: 28px 0 10px; font-size: 13px; letter-spacing: 0.14em; color: #8b91a3; }
  .meta { color: #8b91a3; margin: 0 0 18px; }
  .counts { display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 8px; }
  .count, .info-toggle {
    padding: 8px 12px;
    background: #101218;
    border: 1px solid #2a2e3a;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .count b { display: block; font-size: 20px; }
  .count.error b { color: #ff3b4e; }
  .count.warn b { color: #ffd36a; }
  .count.info b { color: #6ee7ff; }
  .count.ok b { color: #3dd68c; }
  .count[aria-pressed="true"], .info-toggle[aria-pressed="true"] { border-color: #ffd36a; }
  body.hide-info:not([data-filter="info"]) tr[data-sev="info"] { display: none; }
  body[data-filter="error"] tr:not([data-sev="error"]) { display: none; }
  body[data-filter="warn"] tr:not([data-sev="warn"]) { display: none; }
  body[data-filter="info"] tr:not([data-sev="info"]) { display: none; }
  body[data-filter="ok"] tr:not([data-sev="ok"]) { display: none; }
  details summary { cursor: pointer; }
  tr.sev-info td { color: #d5d8e2; }
  tr.sev-info td.sev { color: #6ee7ff; }
  table { width: 100%; border-collapse: collapse; margin: 0 0 8px; }
  th, td { text-align: left; padding: 7px 8px; border-bottom: 1px solid #2a2e3a; vertical-align: top; }
  th { color: #8b91a3; font-weight: 600; cursor: pointer; background: #101218; }
  tr.sev-error td { color: #ff8b96; }
  tr.sev-warn td { color: #ffd36a; }
  tr.sev-ok td { color: #d5d8e2; }
  td.sev { font-weight: 700; }
  tr.sev-error td.sev { color: #ff3b4e; }
  tr.sev-warn td.sev { color: #ffd36a; }
  tr.sev-ok td.sev { color: #3dd68c; }
  .empty { color: #8b91a3; }
  @media print {
    body { background: #07080c; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    main { max-width: none; padding: 0; }
    h2, table, .count { break-inside: avoid; }
    thead { display: table-header-group; }
    th { cursor: default; }
  }
</style>
</head>
<body class="hide-info">
<main>
  <h1>${escapeHtml2(title)}</h1>
  <p class="meta">v${escapeHtml2(report.version)} \xB7 ${escapeHtml2(report.generatedAt)} \xB7 sim ${escapeHtml2(formatSim(report.clock.simTime))} \xB7 frame ${escapeHtml2(report.clock.frame)} \xB7 ${escapeHtml2(report.clock.frozen ? "FREEZE" : `${formatNum(report.clock.timeScale)}x`)}<br>
  ${escapeHtml2(report.url || "n/a")} \xB7 viewport ${escapeHtml2(viewport)}</p>
  <div class="counts">
    <button type="button" class="count error" data-filter="error" aria-pressed="false"><b>${summary.error}</b>errors</button>
    <button type="button" class="count warn" data-filter="warn" aria-pressed="false"><b>${summary.warn}</b>warnings</button>
    <button type="button" class="count info" data-filter="info" aria-pressed="false"><b>${summary.info}</b>info</button>
    <button type="button" class="count ok" data-filter="ok" aria-pressed="false"><b>${summary.ok}</b>ok</button>
  </div>
  <p><button type="button" class="info-toggle" id="show-info" aria-pressed="false">mostra info (${summary.info})</button></p>
  <h2>CORE \xB7 LOG</h2>
  ${renderLogTable(report.logs)}
  <h2>CORE \xB7 SERIES</h2>
  ${renderSeriesTable(report.series)}
  ${sections || '<h2>ADAPTERS</h2><p class="empty">No attached module exposed a snapshot.</p>'}
</main>
<script>
(function () {
  var root = document.body;
  var filters = document.querySelectorAll('.count[data-filter]');
  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      var next = button.getAttribute('data-filter');
      var current = root.getAttribute('data-filter') || '';
      filters.forEach(function (other) { other.setAttribute('aria-pressed', 'false'); });
      if (current === next) {
        root.removeAttribute('data-filter');
        return;
      }
      root.setAttribute('data-filter', next);
      button.setAttribute('aria-pressed', 'true');
    });
  });
  var infoButton = document.getElementById('show-info');
  if (infoButton) {
    infoButton.addEventListener('click', function () {
      var show = root.classList.toggle('show-info');
      root.classList.toggle('hide-info', !show);
      infoButton.setAttribute('aria-pressed', show ? 'true' : 'false');
    });
  }
})();
document.querySelectorAll('table').forEach((table) => {
  table.querySelectorAll('thead th').forEach((th, index) => {
    th.addEventListener('click', () => {
      const body = table.tBodies[0];
      if (!body) return;
      const dir = th.dataset.dir === 'asc' ? 'desc' : 'asc';
      table.querySelectorAll('thead th').forEach((other) => { delete other.dataset.dir; });
      th.dataset.dir = dir;
      const mul = dir === 'asc' ? 1 : -1;
      [...body.rows].sort((a, b) => {
        const av = a.cells[index] ? a.cells[index].textContent : '';
        const bv = b.cells[index] ? b.cells[index].textContent : '';
        const an = Number(av);
        const bn = Number(bv);
        if (av !== '' && bv !== '' && Number.isFinite(an) && Number.isFinite(bn)) return (an - bn) * mul;
        return av.localeCompare(bv) * mul;
      }).forEach((row) => body.appendChild(row));
    });
  });
});
<\/script>
</body>
</html>
`;
  }
  function renderLogTable(logs) {
    if (!logs.length) return '<p class="empty">No log lines.</p>';
    const rows = logs.map((log) => {
      const severity = logSeverity(log);
      return `<tr class="sev-${severity}" data-sev="${severity}"><td class="sev">${escapeHtml2(severity)}</td><td>${escapeHtml2(log.type)}</td><td>${escapeHtml2(log.source)}</td><td>${escapeHtml2(log.message)}</td><td>${escapeHtml2(formatSim(log.simTime))}</td><td>${escapeHtml2(log.frame)}</td></tr>`;
    }).join("");
    return `<table>
<thead><tr><th>severity</th><th>type</th><th>source</th><th>message</th><th>sim</th><th>frame</th></tr></thead>
<tbody>${rows}</tbody>
</table>`;
  }
  function renderSeriesTable(series) {
    if (!series.length) return '<p class="empty">No fps or metric samples.</p>';
    const rows = series.map((entry) => `<tr class="sev-ok" data-sev="ok"><td>${escapeHtml2(entry.name)}</td><td>${escapeHtml2(formatNum(entry.min))}</td><td>${escapeHtml2(formatNum(entry.avg))}</td><td>${escapeHtml2(formatNum(entry.max))}</td><td>${escapeHtml2(formatNum(entry.last))}</td><td>${entry.samples.length}</td></tr>`).join("");
    return `<table>
<thead><tr><th>name</th><th>min</th><th>avg</th><th>max</th><th>last</th><th>samples</th></tr></thead>
<tbody>${rows}</tbody>
</table>`;
  }
  function renderSection(section) {
    const title = escapeHtml2(section.name);
    const items = section.items;
    if (!items.length) {
      return `<h2>${title}</h2><p class="empty">No rows.</p>`;
    }
    const rows = items.map((item) => renderItemRow(item)).join("");
    return `<h2>${title}</h2>
<table>
<thead><tr><th>severity</th><th>selector</th><th>rule</th><th>value</th><th>source</th></tr></thead>
<tbody>${rows}</tbody>
</table>`;
  }
  function renderItemRow(item) {
    const severity = item.severity;
    const selector = item.selectors ? renderSelectorList(item.selectors) : escapeHtml2(item.selector);
    return `<tr class="sev-${severity}" data-sev="${severity}"><td class="sev">${escapeHtml2(severity)}</td><td>${selector}</td><td>${escapeHtml2(item.rule)}</td><td>${escapeHtml2(item.value)}</td><td>${escapeHtml2(item.source)}</td></tr>`;
  }
  function groupImportantRows(items) {
    const out = [];
    const groups = /* @__PURE__ */ new Map();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.rule !== "!important") {
        out.push(item);
        continue;
      }
      const key = String(item.value || "");
      const prev = groups.get(key);
      if (!prev) {
        const group = {
          severity: item.severity,
          rule: item.rule,
          value: item.value,
          source: item.source,
          selectors: [item.selector || ""]
        };
        groups.set(key, group);
        out.push(group);
        continue;
      }
      prev.selectors.push(item.selector || "");
      prev.severity = worseSeverity(prev.severity, item.severity);
    }
    return out;
  }
  function renderSelectorList(selectors) {
    const unique = [];
    const seen = /* @__PURE__ */ new Set();
    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i] || "";
      if (seen.has(selector)) continue;
      seen.add(selector);
      unique.push(selector);
    }
    const label = `${unique.length} elementi`;
    const list = unique.map((selector) => `<li>${escapeHtml2(selector)}</li>`).join("");
    return `<details><summary>${escapeHtml2(label)}</summary><ul>${list}</ul></details>`;
  }
  function worseSeverity(current, next) {
    const rank = { error: 0, warn: 1, info: 2, ok: 3 };
    const left = rank[current] ?? 3;
    const right = rank[next] ?? 3;
    return right < left ? next : current;
  }
  function isFocusSkipOpacity(item) {
    const text = `${item.rule || ""} ${item.value || ""}`;
    if (!text.includes("invisible text (opacity 0)")) return false;
    return /skip/i.test(String(item.selector || ""));
  }
  function htmlSummary(report, adapters) {
    const summary = { error: 0, warn: 0, info: 0, ok: 0 };
    for (let i = 0; i < adapters.length; i++) {
      const items = adapters[i].items;
      for (let j = 0; j < items.length; j++) {
        const severity = items[j].severity;
        if (summary[severity] != null) summary[severity] += 1;
      }
    }
    const logs = Array.isArray(report.logs) ? report.logs : [];
    for (let i = 0; i < logs.length; i++) summary[logSeverity(logs[i])] += 1;
    return summary;
  }
  function saveIfMounted(core, report, ext, mime, text) {
    if (!core.ui) return;
    if (typeof document === "undefined" || !document.body) return;
    if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function" || typeof Blob === "undefined") return;
    const filename = `report-${report.fileStamp}.${ext}`;
    const type = `${mime};charset=utf-8`;
    let blob;
    try {
      blob = typeof File === "function" ? new File([text], filename, { type }) : new Blob([text], { type });
    } catch {
      if (typeof Blob !== "function") return;
      blob = new Blob([text], { type });
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.setAttribute("download", filename);
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function readEnvironment() {
    if (typeof window === "undefined" || typeof location === "undefined") {
      return { url: "", viewport: null };
    }
    const width = Number(window.innerWidth);
    const height = Number(window.innerHeight);
    return {
      url: String(location.href || ""),
      viewport: Number.isFinite(width) && Number.isFinite(height) ? { width, height } : null
    };
  }
  function packetMessage(packet) {
    const payload = packet && packet.payload;
    if (!payload || typeof payload !== "object") return "";
    if (typeof payload.message === "string") return payload.message;
    if (payload.value != null) return String(payload.value);
    return "";
  }
  function asText(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  function formatNum(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    if (Number.isInteger(n)) return String(n);
    return String(Math.round(n * 100) / 100);
  }
  function formatSim(ms) {
    const total = Math.max(0, Number(ms) || 0) / 1e3;
    const minutes = Math.floor(total / 60);
    const seconds = total - minutes * 60;
    return `${String(minutes).padStart(2, "0")}:${seconds.toFixed(1).padStart(4, "0")}`;
  }
  function fileStamp(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
  }
  function escapeHtml2(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function classText(node) {
    if (!node || typeof node !== "object") return "";
    const parts = [];
    if (typeof node.className === "string" && node.className) parts.push(node.className);
    else if (node.className && typeof node.className === "object" && "baseVal" in node.className && node.className.baseVal) {
      parts.push(String(node.className.baseVal));
    }
    if (node.classList && typeof node.classList.length === "number") {
      try {
        parts.push([...node.classList].join(" "));
      } catch {
      }
    }
    if (typeof node.getAttribute === "function") {
      const attr = node.getAttribute("class");
      if (attr) parts.push(attr);
    }
    return parts.join(" ");
  }
  function elementId(node) {
    if (!node || typeof node !== "object") return "";
    if (typeof node.id === "string" && node.id) return node.id;
    if (typeof node.getAttribute === "function") return node.getAttribute("id") || "";
    return "";
  }
  function hasAbClass(className) {
    const raw = typeof className === "string" ? className : className && typeof className === "object" && "baseVal" in className ? String(className.baseVal) : "";
    return raw.split(/\s+/).some((token) => token.startsWith("ab-"));
  }
  function hasBeeAttribute(el) {
    if (typeof el.hasAttribute !== "function") return false;
    return el.hasAttribute("data-bee-ladybug-dom") || el.hasAttribute("data-bee-ladybug-canvas") || el.hasAttribute("data-bee-ladybug-css");
  }
  function readStyle(el) {
    if (typeof getComputedStyle !== "function") return null;
    try {
      return getComputedStyle(el);
    } catch {
      return null;
    }
  }

  // src/core/BeeLadybugCore.js
  var BEE_LADYBUG_VERSION = "0.6.14";
  var CORE_DEFAULTS = Object.freeze({
    toggleKey: "F2",
    slowKey: "F3",
    freezeKey: "F4",
    exportKey: "F8",
    slowScale: 0.25,
    maxLogs: 250,
    historySize: 120,
    /** @type {'auto' | false | HTMLElement} */
    mount: "auto",
    ui: true,
    autoAttach: true,
    autoStart: true
  });
  var WELL_KNOWN_TYPES = Object.freeze([
    "fps",
    "metric",
    "coord",
    "log",
    "warn",
    "error",
    "state",
    "sys",
    "clear",
    "telemetry"
  ]);
  var BeeLadybugCore = class {
    /**
     * @param {Partial<typeof CORE_DEFAULTS> & { overlay?: object }} [options]
     */
    constructor(options = {}) {
      const cfg = { ...CORE_DEFAULTS, ...options };
      this.version = BEE_LADYBUG_VERSION;
      this.toggleKey = cfg.toggleKey;
      this.slowKey = cfg.slowKey;
      this.freezeKey = cfg.freezeKey;
      this.exportKey = cfg.exportKey;
      this.slowScale = cfg.slowScale;
      this.maxLogs = cfg.maxLogs;
      this.historySize = cfg.historySize;
      this.visible = true;
      this.frozen = false;
      this.timeScale = 1;
      this.simTime = 0;
      this.frameCount = 0;
      this.coreFps = 0;
      this.#logs = [];
      this.#history = /* @__PURE__ */ new Map();
      this.#hud = /* @__PURE__ */ new Map();
      this.#latest = /* @__PURE__ */ new Map();
      this.#listeners = /* @__PURE__ */ new Set();
      this.#seq = 0;
      this.#lastRaf = 0;
      this.#rafId = 0;
      this.#bound = false;
      this.#onKeyDown = (event) => this.#handleKey(event);
      this.#onTick = (now) => this.#tick(now);
      this.#started = false;
      this.#assistants = /* @__PURE__ */ new Map();
      this.#activeAssistant = null;
      this.#askBusy = false;
      this.#adapters = /* @__PURE__ */ new Map();
      this.#detail = [];
      this.#issues = [];
      this.ui = null;
      if (cfg.ui !== false && typeof document !== "undefined") {
        this.ui = new UIOverlay(this, options.overlay);
      }
      if (cfg.autoAttach) this.attach();
      if (cfg.mount !== false && this.ui) this.ui.mount(cfg.mount);
      if (cfg.autoStart) this.start();
      this.sendData("sys", { op: "boot", version: this.version });
      this.sendData("log", {
        source: "core",
        message: `BeeLadybug ${this.version} online. Waiting for adapters.`
      });
    }
    #logs;
    #history;
    #hud;
    #latest;
    #listeners;
    #seq;
    #lastRaf;
    #rafId;
    #bound;
    #onKeyDown;
    #onTick;
    #started;
    /** @type {Map<string, { name: string, complete: Function }>} */
    #assistants;
    /** @type {string | null} */
    #activeAssistant;
    #askBusy;
    /** @type {Array<{ text: string, level?: string, onSelect?: () => void }>} */
    #detail;
    /** @type {Array<{ text: string, level?: string, onSelect?: () => void }>} */
    #issues;
    /** @type {Map<string, { name: string, label: string, hotkey: string, enabled: boolean, enable: Function, disable: Function, snapshot: Function | null }>} */
    #adapters;
    /**
     * Public adapter contract. `type` is a channel name; `payload` is raw data.
     * Scalars are wrapped as `{ value }`.
     *
     * @param {string} type
     * @param {unknown} [payload]
     * @returns {BeePacket | null}
     */
    sendData(type, payload) {
      if (typeof type !== "string" || !type) return null;
      if (type === "clear") {
        this.#clear(payload && typeof payload === "object" ? payload : {});
        return this.#emit(this.#makePacket("sys", { op: "clear", ...asObject(payload) }));
      }
      const packet = this.#makePacket(type, payload);
      this.#latest.set(type, packet);
      this.#ingest(packet);
      return this.#emit(packet);
    }
    /**
     * @param {(packet: BeePacket) => void} handler
     * @returns {() => void} unsubscribe
     */
    subscribe(handler) {
      this.#listeners.add(handler);
      return () => this.#listeners.delete(handler);
    }
    get hasAssistant() {
      return Boolean(this.#activeProvider());
    }
    get assistantBusy() {
      return this.#askBusy;
    }
    /** Registered provider names, insertion order. */
    getAssistants() {
      return [...this.#assistants.keys()];
    }
    /**
     * Add a model without dropping the others. Same `name` updates that slot.
     * The first registration becomes active; later ones do not steal focus.
     * @param {{ name?: string, complete: (input: { question: string, snapshot: object }) => unknown }} provider
     */
    registerAssistant(provider) {
      return this.#putAssistant(provider, { activate: !this.#activeAssistant, via: "registerAssistant" });
    }
    /**
     * @param {string} name
     */
    setActiveAssistant(name) {
      const key = String(name || "");
      if (!this.#assistants.has(key)) {
        this.sendData("warn", {
          source: "ai",
          message: `No assistant named "${key}". bee.registerAssistant({ name, complete }) first.`
        });
        return this;
      }
      this.#activeAssistant = key;
      this.sendData("state", { source: "ai", key: "ai.assist", value: key });
      this.sendData("log", { source: "ai", message: `assistant active (${key})` });
      return this;
    }
    /**
     * Register and activate one provider. Does not remove the others.
     * @param {{ name?: string, complete: (input: { question: string, snapshot: object }) => unknown }} provider
     */
    setAssistant(provider) {
      return this.#putAssistant(provider, { activate: true, via: "setAssistant" });
    }
    /**
     * @param {string} [name] omit to drop every provider
     */
    clearAssistant(name) {
      if (name == null || name === "") {
        this.#assistants.clear();
        this.#activeAssistant = null;
      } else {
        const key = String(name);
        this.#assistants.delete(key);
        if (this.#activeAssistant === key) {
          this.#activeAssistant = this.#assistants.keys().next().value ?? null;
        }
      }
      this.sendData("state", {
        source: "ai",
        key: "ai.assist",
        value: this.#activeAssistant ?? "off"
      });
      return this;
    }
    /**
     * Send recent telemetry to the active assistant and print the answer.
     * @param {string} [question]
     * @returns {Promise<string|null>}
     */
    async ask(question = "Diagnose the current telemetry.") {
      const assistant = this.#activeProvider();
      if (!assistant) {
        this.sendData("warn", {
          source: "ai",
          message: "No assistant. bee.registerAssistant({ name, complete }) then ASK AI."
        });
        return null;
      }
      if (this.#askBusy) {
        this.sendData("warn", { source: "ai", message: "assistant busy" });
        return null;
      }
      const q = String(question || "Diagnose the current telemetry.");
      this.#askBusy = true;
      this.sendData("state", { source: "ai", key: "ai.assist", value: "thinking" });
      this.sendData("log", { source: "ai", message: `ask: ${q}` });
      try {
        const snapshot = buildAssistantSnapshot(this, q);
        const raw = await assistant.complete({ question: q, snapshot });
        const text = String(raw ?? "").trim() || "(empty answer)";
        this.sendData("log", { source: "ai", message: text });
        this.sendData("state", { source: "ai", key: "ai.assist", value: assistant.name });
        return text;
      } catch (err) {
        this.sendData("error", {
          source: "ai",
          message: err instanceof Error ? err.message : String(err)
        });
        this.sendData("state", {
          source: "ai",
          key: "ai.assist",
          value: assistant?.name ?? "error"
        });
        return null;
      } finally {
        this.#askBusy = false;
      }
    }
    #activeProvider() {
      return this.#activeAssistant ? this.#assistants.get(this.#activeAssistant) ?? null : null;
    }
    /**
     * Register a toggleable diagnostic adapter. The core stores hooks only —
     * it does not import or special-case adapter modules.
     * @param {string} name
     * @param {{ enable: () => void, disable: () => void, label?: string, hotkey?: string, enabled?: boolean, snapshot?: () => { name?: string, items?: object[] } | null }} hooks
     */
    registerAdapter(name, hooks = {}) {
      const key = String(name || "").trim();
      if (!key || typeof hooks.enable !== "function" || typeof hooks.disable !== "function") {
        this.sendData("warn", {
          source: "core",
          message: "registerAdapter() needs a name and { enable, disable }."
        });
        return this;
      }
      const label = String(hooks.label || key).trim() || key;
      const hotkey = typeof hooks.hotkey === "string" ? hooks.hotkey : "";
      const enabled = hooks.enabled !== false;
      this.#adapters.set(key, {
        name: key,
        label,
        hotkey,
        enabled,
        enable: hooks.enable,
        disable: hooks.disable,
        snapshot: typeof hooks.snapshot === "function" ? hooks.snapshot : null
      });
      this.sendData("sys", {
        op: "adapter",
        name: key,
        registered: true,
        label,
        hotkey,
        enabled
      });
      return this;
    }
    /**
     * @param {string} name
     */
    unregisterAdapter(name) {
      const key = String(name || "").trim();
      if (!key || !this.#adapters.has(key)) return this;
      this.#adapters.delete(key);
      this.sendData("sys", { op: "adapter", name: key, registered: false });
      return this;
    }
    /** Registered diagnostic adapters, insertion order. */
    getAdapters() {
      return [...this.#adapters.values()].map((entry) => ({
        name: entry.name,
        label: entry.label,
        hotkey: entry.hotkey || "",
        enabled: entry.enabled
      }));
    }
    /**
     * Ask every registered adapter for a report snapshot.
     * Modules without a snapshot hook are skipped. The core does not read the rows.
     * A thrown snapshot becomes `{ name, error }` so one module cannot abort the report.
     * @returns {Array<{ name: string, result?: unknown, error?: string }>}
     */
    collectSnapshots() {
      const out = [];
      for (const entry of this.#adapters.values()) {
        if (typeof entry.snapshot !== "function") continue;
        try {
          const result = entry.snapshot();
          if (result == null) continue;
          out.push({ name: entry.name, result });
        } catch (err) {
          out.push({
            name: entry.name,
            error: err instanceof Error ? err.message : String(err)
          });
        }
      }
      return out;
    }
    /**
     * Clickable rows inside the overlay. The core does not interpret them.
     * @param {Array<{ text: string, level?: string, onSelect?: () => void }>} items
     */
    publishDetail(items) {
      this.#detail = Array.isArray(items) ? items : [];
      this.ui?.setDetail(this.#detail);
      return this;
    }
    /**
     * Sticky red warnings. The core does not interpret them.
     * @param {Array<{ text: string, level?: string, onSelect?: () => void }>} items
     */
    publishIssues(items) {
      const list = Array.isArray(items) ? items : [];
      this.#issues = list;
      this.ui?.setIssues(this.#issues);
      return this;
    }
    /**
     * @param {string} name
     */
    toggleAdapter(name) {
      const entry = this.#adapters.get(String(name || "").trim());
      if (!entry) return this;
      return this.setAdapterEnabled(entry.name, !entry.enabled);
    }
    /**
     * @param {string} name
     * @param {boolean} enabled
     */
    setAdapterEnabled(name, enabled) {
      const entry = this.#adapters.get(String(name || "").trim());
      if (!entry) return this;
      const next = Boolean(enabled);
      if (entry.enabled === next) return this;
      try {
        if (next) entry.enable();
        else entry.disable();
        entry.enabled = next;
      } catch (err) {
        console.warn("[BeeLadybug] adapter toggle error", err);
      }
      this.sendData("sys", {
        op: "adapter",
        name: entry.name,
        enabled: entry.enabled
      });
      return this;
    }
    /**
     * @param {{ name?: string, complete: Function }} provider
     * @param {{ activate: boolean, via: string }} opts
     */
    #putAssistant(provider, opts) {
      const next = normalizeAssistant(provider);
      if (!next) {
        this.sendData("warn", {
          source: "ai",
          message: `${opts.via}() needs { complete(ctx) }. No vendor is bundled.`
        });
        return this;
      }
      this.#assistants.set(next.name, next);
      if (opts.activate) this.#activeAssistant = next.name;
      this.sendData("state", {
        source: "ai",
        key: "ai.assist",
        value: this.#activeAssistant ?? next.name
      });
      this.sendData("log", {
        source: "ai",
        message: `assistant ready (${next.name})`
      });
      return this;
    }
    start() {
      if (this.#started) return this;
      this.#started = true;
      this.#lastRaf = 0;
      if (typeof requestAnimationFrame === "function") {
        this.#rafId = requestAnimationFrame(this.#onTick);
      }
      return this;
    }
    stop() {
      this.#started = false;
      if (this.#rafId && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(this.#rafId);
      }
      this.#rafId = 0;
      return this;
    }
    attach() {
      if (this.#bound || typeof window === "undefined") return this;
      window.addEventListener("keydown", this.#onKeyDown);
      this.#bound = true;
      return this;
    }
    detach() {
      if (!this.#bound || typeof window === "undefined") return this;
      window.removeEventListener("keydown", this.#onKeyDown);
      this.#bound = false;
      return this;
    }
    destroy() {
      this.stop();
      this.detach();
      this.#listeners.clear();
      this.#logs.length = 0;
      this.#history.clear();
      this.#hud.clear();
      this.#latest.clear();
      this.#assistants.clear();
      this.#activeAssistant = null;
      this.#askBusy = false;
      this.#adapters.clear();
      this.#detail = [];
      this.#issues = [];
      this.ui?.destroy();
      this.ui = null;
      return this;
    }
    show() {
      if (this.visible) return this;
      this.visible = true;
      this.ui?.setVisible(true);
      this.sendData("sys", { op: "visibility", visible: true });
      return this;
    }
    hide() {
      if (!this.visible) return this;
      this.visible = false;
      this.ui?.setVisible(false);
      this.sendData("sys", { op: "visibility", visible: false });
      return this;
    }
    toggle() {
      return this.visible ? this.hide() : this.show();
    }
    /**
     * Stops the simulated clock only. Overlay RAF keeps running.
     * Adapters must listen for `sys` packets with `op: 'freeze'`.
     */
    freeze() {
      if (this.frozen) return this;
      this.frozen = true;
      this.sendData("sys", { op: "freeze", frozen: true });
      this.sendData("log", { source: "core", level: "warn", message: "Sim clock FREEZE" });
      return this;
    }
    unfreeze() {
      if (!this.frozen) return this;
      this.frozen = false;
      this.sendData("sys", { op: "freeze", frozen: false });
      this.sendData("log", { source: "core", message: "Sim clock RUN" });
      return this;
    }
    toggleFreeze() {
      return this.frozen ? this.unfreeze() : this.freeze();
    }
    setTimeScale(scale) {
      const next = Number(scale);
      if (!Number.isFinite(next) || next < 0) return this;
      this.timeScale = next;
      this.sendData("sys", { op: "timescale", scale: next });
      return this;
    }
    /**
     * Build a telemetry report. HTML and CSV return a string; JSON returns
     * the plain object. A mounted overlay downloads the file.
     * @param {'html' | 'json' | 'csv'} [format]
     * @returns {object | string}
     */
    exportReport(format = "html") {
      return exportReport(this, { format });
    }
    applySlowMo() {
      if (this.frozen) this.unfreeze();
      const next = this.timeScale === this.slowScale ? 1 : this.slowScale;
      this.setTimeScale(next);
      this.sendData("log", {
        source: "core",
        message: next === 1 ? "Sim clock 1x LIVE" : `Sim clock SLOW ${next}x`
      });
      return this;
    }
    restoreRealtime() {
      if (this.frozen) this.unfreeze();
      this.setTimeScale(1);
      this.sendData("log", { source: "core", message: "Sim clock 1x LIVE" });
      return this;
    }
    getState() {
      return {
        version: this.version,
        visible: this.visible,
        frozen: this.frozen,
        timeScale: this.timeScale,
        simTime: this.simTime,
        frameCount: this.frameCount,
        coreFps: this.coreFps,
        logCount: this.#logs.length,
        hud: this.getHud(),
        mode: this.#modeLabel(),
        assistant: this.#activeAssistant,
        assistants: this.getAssistants(),
        adapters: this.getAdapters()
      };
    }
    /** @returns {BeePacket[]} */
    getLogs() {
      return this.#logs;
    }
    /**
     * @param {string} name
     * @returns {{ name: string, values: number[], min: number, max: number, avg: number, last: number }}
     */
    getHistory(name) {
      const values = this.#history.get(name) ?? [];
      return summarize(name, values);
    }
    /**
     * Prefer host `fps` history; fall back to the core tick rate.
     * @returns {{ name: string, values: number[], min: number, max: number, avg: number, last: number }}
     */
    getPrimaryHistory() {
      const host = this.#history.get("fps");
      if (host && host.length) return summarize("fps", host);
      const tick = this.#history.get("core.fps");
      return summarize("core.fps", tick ?? []);
    }
    getHud() {
      const out = {};
      for (const [key, entry] of this.#hud) out[key] = entry;
      return out;
    }
    /** @param {string} type */
    getLatest(type) {
      return this.#latest.get(type) ?? null;
    }
    #modeLabel() {
      if (this.frozen) return "FREEZE";
      if (this.timeScale !== 1) return `SLOW ${this.timeScale}x`;
      return "LIVE";
    }
    #makePacket(type, payload) {
      const body = asObject(payload);
      const source = typeof body.source === "string" && body.source ? body.source : "adapter";
      return {
        id: ++this.#seq,
        type,
        payload: body,
        wallTime: Date.now(),
        simTime: this.simTime,
        frame: this.frameCount,
        source,
        level: inferLevel(type, body)
      };
    }
    #emit(packet) {
      for (const handler of this.#listeners) {
        try {
          handler(packet);
        } catch (err) {
          console.warn("[BeeLadybug] subscriber error", err);
        }
      }
      this.ui?.onPacket(packet);
      return packet;
    }
    #ingest(packet) {
      const { type, payload } = packet;
      if (type === "sys") return;
      if (type === "fps") {
        const value = numeric(payload.value ?? payload.fps);
        if (value != null) {
          this.#pushHistory("fps", value);
          this.#hud.set("fps", { value, unit: "fps", type });
        }
        return;
      }
      if (type === "metric") {
        const name = String(payload.name ?? payload.key ?? "metric");
        const value = numeric(payload.value);
        if (value != null) this.#pushHistory(name, value);
        this.#hud.set(name, { value: payload.value, unit: payload.unit, type });
        return;
      }
      if (type === "coord") {
        const label = String(payload.label ?? payload.name ?? "coord");
        const x = numeric(payload.x);
        const y = numeric(payload.y);
        this.#hud.set(label, {
          value: x != null && y != null ? `${formatNum2(x)}, ${formatNum2(y)}` : payload,
          type
        });
        return;
      }
      if (type === "state") {
        const key = String(payload.key ?? payload.name ?? "state");
        this.#hud.set(key, { value: payload.value, unit: payload.unit, type });
        return;
      }
      if (type === "telemetry") {
        const name = String(payload.kind ?? payload.name ?? "telemetry");
        const value = numeric(payload.duration ?? payload.value);
        if (value != null) this.#pushHistory(name, value);
        return;
      }
      if (isConsoleType(type) || packet.level) {
        this.#pushLog(packet);
      }
    }
    #pushLog(packet) {
      this.#logs.push(packet);
      if (this.#logs.length > this.maxLogs) {
        this.#logs.splice(0, this.#logs.length - this.maxLogs);
      }
    }
    #pushHistory(name, value) {
      let series = this.#history.get(name);
      if (!series) {
        series = [];
        this.#history.set(name, series);
      }
      series.push(value);
      if (series.length > this.historySize) series.shift();
    }
    #clear(payload) {
      const channel = payload.channel ?? payload.type;
      if (!channel || channel === "logs") this.#logs.length = 0;
      if (!channel || channel === "history") this.#history.clear();
      if (!channel || channel === "hud") this.#hud.clear();
      this.ui?.onClear(channel);
    }
    #tick(now) {
      if (!this.#started) return;
      this.#rafId = requestAnimationFrame(this.#onTick);
      const dt = this.#lastRaf ? now - this.#lastRaf : 16.67;
      this.#lastRaf = now;
      const clamped = Math.min(Math.max(dt, 0), 100);
      const instant = clamped > 0 ? 1e3 / clamped : 0;
      this.coreFps = this.coreFps ? this.coreFps * 0.9 + instant * 0.1 : instant;
      this.#pushHistory("core.fps", this.coreFps);
      if (!this.frozen) {
        this.simTime += clamped * this.timeScale;
        this.frameCount += 1;
      }
      this.#hud.set("frame", { value: this.frameCount, type: "sys" });
      this.#hud.set("sim", { value: formatSimTime2(this.simTime), type: "sys" });
      this.#hud.set("scale", { value: `${this.timeScale.toFixed(2)}x`, type: "sys" });
      if (this.visible) this.ui?.render();
    }
    #handleKey(event) {
      if (event.repeat) return;
      const code = event.code;
      if (code === this.toggleKey) {
        event.preventDefault();
        this.toggle();
        return;
      }
      if (code === this.exportKey) {
        event.preventDefault();
        this.exportReport("html");
        return;
      }
      if (!this.visible) return;
      if (code === this.slowKey) {
        event.preventDefault();
        this.applySlowMo();
        return;
      }
      if (code === this.freezeKey) {
        event.preventDefault();
        this.toggleFreeze();
        return;
      }
      if (isTypingTarget(event.target)) return;
      for (const entry of this.#adapters.values()) {
        if (!entry.hotkey || code !== entry.hotkey) continue;
        event.preventDefault();
        this.toggleAdapter(entry.name);
        return;
      }
    }
  };
  function isTypingTarget(target) {
    if (!target || typeof target !== "object") return false;
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    return Boolean(target.isContentEditable);
  }
  function asObject(payload) {
    if (payload == null) return {};
    if (typeof payload !== "object") return { value: payload, message: String(payload) };
    return payload;
  }
  function numeric(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  function inferLevel(type, payload) {
    if (payload.level) return String(payload.level);
    if (type === "error") return "error";
    if (type === "warn") return "warn";
    if (type === "log" || type === "debug") return payload.level ?? "info";
    return null;
  }
  function isConsoleType(type) {
    return type === "log" || type === "warn" || type === "error" || type === "debug";
  }
  function formatNum2(n) {
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  }
  function formatSimTime2(ms) {
    const total = Math.max(0, ms) / 1e3;
    const m = Math.floor(total / 60);
    const s = total - m * 60;
    return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
  }
  function summarize(name, values) {
    if (!values.length) {
      return { name, values, min: 0, max: 0, avg: 0, last: 0 };
    }
    let min = values[0];
    let max = values[0];
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
    }
    return {
      name,
      values,
      min,
      max,
      avg: sum / values.length,
      last: values[values.length - 1]
    };
  }

  // src/adapters/CanvasAdapter.js
  var CANVAS_ADAPTER_DEFAULTS = Object.freeze({
    overlay: true,
    computeCollisions: true,
    autoPump: false,
    colorActive: "#3dff6a",
    colorColliding: "#ff3b3b",
    colorInactive: "#8a8a8a",
    source: "canvas"
  });
  var CanvasAdapter = class {
    /**
     * @param {import('../core/BeeLadybugCore.js').BeeLadybugCore} core
     * @param {Partial<typeof CANVAS_ADAPTER_DEFAULTS> & {
     *   canvas?: HTMLCanvasElement,
     *   entities?: object[]
     * }} [options]
     */
    constructor(core, options = {}) {
      const cfg = { ...CANVAS_ADAPTER_DEFAULTS, ...options };
      this.core = core;
      this.canvas = options.canvas ?? null;
      this.entities = options.entities ?? [];
      this.overlayEnabled = cfg.overlay;
      this.computeCollisions = cfg.computeCollisions;
      this.autoPump = Boolean(cfg.autoPump);
      this.colorActive = cfg.colorActive;
      this.colorColliding = cfg.colorColliding;
      this.colorInactive = cfg.colorInactive;
      this.source = cfg.source;
      this.frozen = false;
      this.timeScale = 1;
      this.#attached = false;
      this.#reporting = true;
      this.#overlay = null;
      this.#unsubscribe = null;
      this.#rafId = 0;
      this.#pumpFromAuto = false;
      this.#manualPumpWarned = false;
      this.#lastPump = 0;
      this.#fps = 0;
      this.#fpsSamples = [];
      this.#wasColliding = /* @__PURE__ */ new Set();
      this.#names = /* @__PURE__ */ new Map();
      this.#overlayStyle = null;
      this.#onResize = () => this.#syncOverlay();
      this.#onTick = () => {
        this.#rafId = requestAnimationFrame(this.#onTick);
        this.#pumpFromAuto = true;
        try {
          this.pump();
        } finally {
          this.#pumpFromAuto = false;
        }
      };
    }
    #attached;
    #reporting;
    #overlay;
    #unsubscribe;
    #rafId;
    #pumpFromAuto;
    #manualPumpWarned;
    #lastPump;
    #fps;
    #fpsSamples;
    #wasColliding;
    /** id -> display name, refreshed on every pump. */
    #names;
    /** Last style values written to the overlay. */
    #overlayStyle;
    #onResize;
    #onTick;
    attach() {
      if (this.#attached) return this;
      this.#attached = true;
      this.frozen = Boolean(this.core?.frozen);
      this.timeScale = this.core?.timeScale ?? 1;
      if (this.core && typeof this.core.subscribe === "function") {
        this.#unsubscribe = this.core.subscribe((packet) => this.#onCore(packet));
      }
      if (this.overlayEnabled) this.#mountOverlay();
      if (typeof window !== "undefined") {
        window.addEventListener("resize", this.#onResize);
        window.addEventListener("scroll", this.#onResize, true);
      }
      if (this.autoPump) this.startAutoPump();
      this.#reporting = true;
      this.core?.registerAdapter("canvas", {
        label: "CANVAS",
        enabled: true,
        enable: () => this.#enable(),
        disable: () => this.#disable(),
        snapshot: () => this.snapshot()
      });
      this.core?.sendData("log", {
        source: this.source,
        message: `CanvasAdapter attached (${this.entities.length} entities).`
      });
      if (this.overlayEnabled && !this.canvas) {
        this.core?.sendData("warn", {
          source: this.source,
          message: "no canvas: hitboxes are not drawn. Pass { canvas } or call setCanvas()."
        });
      }
      this.core?.sendData("state", {
        source: this.source,
        key: "adapter",
        value: "canvas"
      });
      return this;
    }
    detach() {
      if (!this.#attached) return this;
      this.#attached = false;
      this.#stopAutoPumpLoop();
      if (this.#unsubscribe) this.#unsubscribe();
      this.#unsubscribe = null;
      this.core?.unregisterAdapter("canvas");
      this.#unmountOverlay();
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", this.#onResize);
        window.removeEventListener("scroll", this.#onResize, true);
      }
      this.#wasColliding = /* @__PURE__ */ new Set();
      this.#names = /* @__PURE__ */ new Map();
      this.#lastPump = 0;
      this.#fps = 0;
      this.#fpsSamples = [];
      return this;
    }
    /**
     * Drive `pump()` from an internal `requestAnimationFrame` loop.
     * Use this when the host game loop cannot call `pump()` (bookmarklet / console).
     */
    startAutoPump() {
      this.autoPump = true;
      if (!this.#attached) return this;
      if (this.#rafId) return this;
      if (typeof requestAnimationFrame !== "function") return this;
      this.#manualPumpWarned = false;
      this.#rafId = requestAnimationFrame(this.#onTick);
      return this;
    }
    /**
     * Stop the internal loop and make a manual `pump()` valid again.
     * Mirror of `startAutoPump()`.
     */
    stopAutoPump() {
      this.autoPump = false;
      this.#stopAutoPumpLoop();
      return this;
    }
    /** @param {HTMLCanvasElement | null} canvas */
    setCanvas(canvas) {
      this.canvas = canvas;
      if (!this.#attached) return this;
      if (!canvas) {
        this.#unmountOverlay();
      } else if (this.overlayEnabled) {
        if (this.#overlay) this.#syncOverlay();
        else this.#mountOverlay();
      }
      return this;
    }
    /** @param {object[]} entities */
    setEntities(entities) {
      this.entities = entities ?? [];
      return this;
    }
    /**
     * Hitboxes currently on the entity list, plus FPS min/avg/max.
     * Returns null when the adapter is not attached. The core stores this
     * function and does not read the rows.
     * @returns {{ name: string, items: Array<{ severity: string, selector: string, rule: string, value: string, source: string }> } | null}
     */
    snapshot() {
      if (!this.#attached) return null;
      const boxes = this.#collectBoxes();
      this.#markCollisions(boxes);
      const items = boxes.map((box) => ({
        severity: box.hit ? "warn" : "ok",
        selector: box.name,
        rule: "hitbox",
        value: `${round1(box.x)},${round1(box.y)} ${round1(box.w)}x${round1(box.h)}${box.hit ? " colliding" : ""}`,
        source: this.source
      }));
      const fps = this.#fpsItem();
      if (fps) items.push(fps);
      return { name: "canvas", items };
    }
    /**
     * Call once per host frame, after entity positions are updated.
     * Pass a 2D context only if overlay is disabled and you want hitboxes
     * drawn onto the game canvas itself.
     * Ignored (with a warning) while `autoPump` owns the frame loop.
     * @param {CanvasRenderingContext2D} [ctx]
     */
    pump(ctx) {
      if (!this.#attached || !this.core) return this;
      if (this.#rafId && !this.#pumpFromAuto) {
        this.#warnManualPump();
        return this;
      }
      if (!this.#reporting) return this;
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (this.#lastPump) {
        const dt = Math.min(Math.max(now - this.#lastPump, 0), 100);
        const instant = dt > 0 ? 1e3 / dt : 0;
        this.#fps = this.#fps ? this.#fps * 0.85 + instant * 0.15 : instant;
      }
      this.#lastPump = now;
      const boxes = this.#collectBoxes();
      this.#markCollisions(boxes);
      this.#emitTelemetry(boxes);
      this.#emitCollisionEdges(boxes);
      this.#drawHitboxes(boxes, ctx);
      return this;
    }
    #stopAutoPumpLoop() {
      if (this.#rafId && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(this.#rafId);
      }
      this.#rafId = 0;
      this.#pumpFromAuto = false;
      this.#manualPumpWarned = false;
    }
    #warnManualPump() {
      if (this.#manualPumpWarned) return;
      this.#manualPumpWarned = true;
      const message = "pump() skipped: autoPump already drives the frame loop.";
      if (typeof console !== "undefined" && typeof console.warn === "function") {
        console.warn(`[BeeLadybug] CanvasAdapter ${message}`);
      }
      this.core.sendData("warn", { source: this.source, message });
    }
    #onCore(packet) {
      if (packet.type !== "sys") return;
      const op = packet.payload.op;
      if (op === "freeze") this.frozen = Boolean(packet.payload.frozen);
      if (op === "timescale") {
        const scale = Number(packet.payload.scale);
        if (Number.isFinite(scale)) this.timeScale = scale;
      }
      if (op === "visibility") this.#syncOverlay();
    }
    #collectBoxes() {
      const list = this.entities;
      const boxes = [];
      for (let i = 0; i < list.length; i++) {
        const box = aabbOf(list[i], i);
        if (box) boxes.push(box);
      }
      return boxes;
    }
    #markCollisions(boxes) {
      for (let i = 0; i < boxes.length; i++) boxes[i].hit = Boolean(boxes[i].entity.colliding);
      if (!this.computeCollisions) return;
      for (let i = 0; i < boxes.length; i++) {
        const a = boxes[i];
        for (let j = i + 1; j < boxes.length; j++) {
          const b = boxes[j];
          if (!overlaps(a, b)) continue;
          a.hit = true;
          b.hit = true;
        }
      }
    }
    #emitTelemetry(boxes) {
      let hits = 0;
      let tracked = null;
      for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].hit) hits += 1;
        if (!tracked && isPrimary(boxes[i].entity)) tracked = boxes[i];
      }
      if (!tracked && boxes[0]) tracked = boxes[0];
      if (this.#fps > 0) {
        this.#fpsSamples.push(this.#fps);
        if (this.#fpsSamples.length > 120) this.#fpsSamples.shift();
        this.core.sendData("fps", { value: this.#fps, source: this.source });
      }
      this.core.sendData("metric", {
        name: "entities",
        value: boxes.length,
        source: this.source
      });
      this.core.sendData("metric", {
        name: "hits",
        value: hits,
        source: this.source
      });
      this.core.sendData("state", {
        source: this.source,
        key: "hits",
        value: `${hits} / ${boxes.length}`
      });
      if (tracked) {
        this.core.sendData("coord", {
          source: this.source,
          label: tracked.name,
          x: tracked.x,
          y: tracked.y
        });
      }
    }
    #emitCollisionEdges(boxes) {
      const now = /* @__PURE__ */ new Set();
      const names = /* @__PURE__ */ new Map();
      for (let i = 0; i < boxes.length; i++) {
        names.set(boxes[i].id, boxes[i].name);
        if (!boxes[i].hit) continue;
        now.add(boxes[i].id);
        if (!this.#wasColliding.has(boxes[i].id)) {
          this.core.sendData("warn", {
            source: this.source,
            message: `${boxes[i].name} entered collision`
          });
        }
      }
      for (const id of this.#wasColliding) {
        if (now.has(id)) continue;
        const name = names.get(id) ?? this.#names.get(id) ?? id;
        this.core.sendData("log", {
          source: this.source,
          message: `${name} left collision`
        });
      }
      this.#wasColliding = now;
      this.#names = names;
    }
    #drawHitboxes(boxes, hostCtx) {
      const overlayCtx = this.#overlay ? this.#overlay.getContext("2d") : null;
      if (overlayCtx) this.#syncOverlay();
      const ctx = overlayCtx || hostCtx;
      if (!ctx) return;
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      if (overlayCtx) ctx.clearRect(0, 0, w, h);
      if (this.core && this.core.visible === false) return;
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.font = "11px ui-monospace, Consolas, monospace";
      ctx.textBaseline = "bottom";
      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        const active = box.entity.active !== false;
        const color = box.hit ? this.colorColliding : active ? this.colorActive : this.colorInactive;
        ctx.strokeStyle = color;
        ctx.fillStyle = box.hit ? "rgba(255, 59, 59, 0.16)" : "rgba(61, 255, 106, 0.08)";
        ctx.fillRect(box.x, box.y, box.w, box.h);
        ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w, box.h);
        ctx.fillStyle = color;
        ctx.fillText(box.name, box.x + 3, box.y - 3);
      }
      ctx.restore();
    }
    #mountOverlay() {
      if (typeof document === "undefined" || this.#overlay || !this.canvas) return;
      const canvas = document.createElement("canvas");
      canvas.setAttribute("data-bee-ladybug-canvas", "");
      canvas.style.background = "transparent";
      canvas.style.border = "0";
      canvas.style.padding = "0";
      canvas.style.boxShadow = "none";
      canvas.style.outline = "none";
      canvas.style.filter = "none";
      canvas.style.opacity = "1";
      canvas.style.transform = "none";
      canvas.style.pointerEvents = "none";
      canvas.style.position = "fixed";
      canvas.style.zIndex = "2147483645";
      canvas.style.margin = "0";
      document.body.appendChild(canvas);
      this.#overlay = canvas;
      this.#overlayStyle = null;
      this.#syncOverlay();
    }
    #unmountOverlay() {
      if (this.#overlay?.parentNode) this.#overlay.parentNode.removeChild(this.#overlay);
      this.#overlay = null;
      this.#overlayStyle = null;
    }
    #syncOverlay() {
      const host = this.canvas;
      const overlay = this.#overlay;
      if (!host || !overlay) return;
      const rect = host.getBoundingClientRect();
      if (overlay.width !== host.width) overlay.width = host.width;
      if (overlay.height !== host.height) overlay.height = host.height;
      const hidden = !this.#reporting || this.core && this.core.visible === false;
      const next = {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        display: hidden ? "none" : "block"
      };
      const prev = this.#overlayStyle;
      for (const key of Object.keys(next)) {
        if (!prev || prev[key] !== next[key]) overlay.style[key] = next[key];
      }
      this.#overlayStyle = next;
    }
    #enable() {
      this.#reporting = true;
      this.#syncOverlay();
    }
    #disable() {
      this.#reporting = false;
      this.#syncOverlay();
    }
    #fpsItem() {
      const stats = this.#fpsStats();
      if (!stats) return null;
      return {
        severity: "ok",
        selector: "host",
        rule: "fps",
        value: `min ${round1(stats.min)} avg ${round1(stats.avg)} max ${round1(stats.max)}`,
        source: this.source
      };
    }
    #fpsStats() {
      const history = typeof this.core?.getHistory === "function" ? this.core.getHistory("fps") : null;
      if (history && Array.isArray(history.values) && history.values.length) {
        return { min: history.min, avg: history.avg, max: history.max };
      }
      const samples = this.#fpsSamples;
      if (!samples.length) return null;
      let min = samples[0];
      let max = samples[0];
      let sum = 0;
      for (let i = 0; i < samples.length; i++) {
        const value = samples[i];
        if (value < min) min = value;
        if (value > max) max = value;
        sum += value;
      }
      return { min, avg: sum / samples.length, max };
    }
  };
  function aabbOf(entity, index) {
    if (!entity) return null;
    const x = numberOr(entity.worldX, entity.x);
    const y = numberOr(entity.worldY, entity.y);
    const w = numberOr(entity.width, entity.w);
    const h = numberOr(entity.height, entity.h);
    if (x == null || y == null || !w || !h || w <= 0 || h <= 0) return null;
    const name = String(entity.name ?? entity.label ?? entity.id ?? `#${index}`);
    const id = entity.id != null ? `id:${entity.id}` : `idx:${index}:${name}`;
    return { entity, x, y, w, h, name, id, hit: false };
  }
  function numberOr(a, b) {
    if (typeof a === "number" && Number.isFinite(a)) return a;
    if (typeof b === "number" && Number.isFinite(b)) return b;
    return null;
  }
  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function isPrimary(entity) {
    const key = String(entity.name ?? entity.label ?? entity.role ?? "").toLowerCase();
    return key === "player" || key === "hero" || entity.primary === true;
  }
  function round1(value) {
    return Math.round(Number(value) * 10) / 10;
  }

  // src/adapters/WebDOMAdapter.js
  var MAX_PROBLEM_ROWS = 40;
  var OBSERVE_OPTIONS = Object.freeze({
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "hidden", "disabled", "open"]
  });
  var WEB_DOM_ADAPTER_DEFAULTS = Object.freeze({
    overlay: true,
    autoTick: true,
    watch: [],
    source: "dom",
    colorHover: "#6ee7ff",
    colorWatch: "#3dff6a",
    colorMargin: "rgba(255, 211, 106, 0.18)",
    colorPadding: "rgba(61, 255, 106, 0.16)",
    colorContent: "rgba(110, 231, 255, 0.20)"
  });
  var WebDOMAdapter = class {
    /**
     * @param {import('../core/BeeLadybugCore.js').BeeLadybugCore} core
     * @param {Partial<typeof WEB_DOM_ADAPTER_DEFAULTS> & {
     *   root?: ParentNode | null
     * }} [options]
     */
    constructor(core, options = {}) {
      const cfg = { ...WEB_DOM_ADAPTER_DEFAULTS, ...options };
      this.core = core;
      this.root = options.root !== void 0 ? options.root : typeof document !== "undefined" ? document.body : null;
      this.overlayEnabled = cfg.overlay;
      this.autoTick = cfg.autoTick;
      this.watch = Array.isArray(cfg.watch) ? cfg.watch.slice() : [];
      this.source = cfg.source;
      this.colorHover = cfg.colorHover;
      this.colorWatch = cfg.colorWatch;
      this.colorMargin = cfg.colorMargin;
      this.colorPadding = cfg.colorPadding;
      this.colorContent = cfg.colorContent;
      this.frozen = false;
      this.timeScale = 1;
      this.hover = null;
      this.#attached = false;
      this.#reporting = true;
      this.#overlay = null;
      this.#unsubscribe = null;
      this.#observer = null;
      this.#rafId = 0;
      this.#pointer = { x: 0, y: 0, dirty: false };
      this.#lastPump = 0;
      this.#fps = 0;
      this.#mutAdded = 0;
      this.#mutRemoved = 0;
      this.#mutAttr = 0;
      this.#seenAdded = 0;
      this.#seenRemoved = 0;
      this.#seenAttr = 0;
      this.#mutTimer = 0;
      this.#lastHoverKey = "";
      this.#overlayStyle = null;
      this.#onMove = (event) => {
        this.#pointer.x = event.clientX;
        this.#pointer.y = event.clientY;
        this.#pointer.dirty = true;
      };
      this.#onResize = () => this.#syncOverlay();
      this.#onTick = () => {
        this.#rafId = requestAnimationFrame(this.#onTick);
        this.pump();
      };
      this.#onMutate = (records) => this.#queueMutations(records);
    }
    #attached;
    #reporting;
    #overlay;
    #unsubscribe;
    #observer;
    #rafId;
    #pointer;
    #lastPump;
    #fps;
    #mutAdded;
    #mutRemoved;
    #mutAttr;
    #seenAdded;
    #seenRemoved;
    #seenAttr;
    #mutTimer;
    #lastHoverKey;
    /** Last style values written to the overlay. */
    #overlayStyle;
    #onMove;
    #onResize;
    #onTick;
    #onMutate;
    attach() {
      if (this.#attached) return this;
      this.#attached = true;
      this.frozen = Boolean(this.core?.frozen);
      this.timeScale = this.core?.timeScale ?? 1;
      if (this.core && typeof this.core.subscribe === "function") {
        this.#unsubscribe = this.core.subscribe((packet) => this.#onCore(packet));
      }
      this.#reporting = true;
      if (this.overlayEnabled) this.#mountOverlay();
      if (typeof window !== "undefined") {
        window.addEventListener("mousemove", this.#onMove, true);
        window.addEventListener("resize", this.#onResize);
        window.addEventListener("scroll", this.#onResize, true);
      }
      if (this.root && typeof MutationObserver !== "undefined") {
        this.#observer = new MutationObserver(this.#onMutate);
        this.#observer.observe(this.root, OBSERVE_OPTIONS);
      }
      if (this.autoTick && typeof requestAnimationFrame === "function") {
        this.#rafId = requestAnimationFrame(this.#onTick);
      }
      this.core?.registerAdapter("dom", {
        label: "DOM",
        enabled: true,
        enable: () => this.#enable(),
        disable: () => this.#disable(),
        snapshot: () => this.snapshot()
      });
      this.core?.sendData("log", {
        source: this.source,
        message: "WebDOMAdapter attached. Hover a node to inspect the box model."
      });
      this.core?.sendData("state", {
        source: this.source,
        key: "adapter",
        value: "dom"
      });
      return this;
    }
    detach() {
      if (!this.#attached) return this;
      this.#attached = false;
      if (this.#unsubscribe) this.#unsubscribe();
      this.#unsubscribe = null;
      if (this.#observer) this.#observer.disconnect();
      this.#observer = null;
      if (this.#rafId && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(this.#rafId);
      }
      this.#rafId = 0;
      if (this.#mutTimer && typeof clearTimeout === "function") clearTimeout(this.#mutTimer);
      this.#mutTimer = 0;
      this.core?.unregisterAdapter("dom");
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", this.#onMove, true);
        window.removeEventListener("resize", this.#onResize);
        window.removeEventListener("scroll", this.#onResize, true);
      }
      this.#unmountOverlay();
      this.hover = null;
      this.#lastHoverKey = "";
      this.#lastPump = 0;
      this.#fps = 0;
      this.#pointer = { x: 0, y: 0, dirty: false };
      this.#mutAdded = 0;
      this.#mutRemoved = 0;
      this.#mutAttr = 0;
      this.#seenAdded = 0;
      this.#seenRemoved = 0;
      this.#seenAttr = 0;
      return this;
    }
    /** @param {ParentNode | null} root */
    setRoot(root) {
      this.root = root;
      if (this.#observer) this.#observer.disconnect();
      if (!root) {
        this.#observer = null;
      } else if (this.#attached && typeof MutationObserver !== "undefined") {
        if (!this.#observer) this.#observer = new MutationObserver(this.#onMutate);
        this.#observer.observe(root, OBSERVE_OPTIONS);
      }
      if (this.hover && !this.#rootHolds(this.hover)) this.hover = null;
      return this;
    }
    #rootHolds(node) {
      const root = this.root;
      if (!root) return false;
      if (typeof document !== "undefined" && root === document) return true;
      return node === root || Boolean(root.contains?.(node));
    }
    /**
     * Box model of the hover and watched nodes, layout problems under root,
     * and the latest mutation counts. Returns null when detached.
     * Hidden boxes, the WordPress admin bar, and BeeLadybug chrome are skipped.
     * The core stores this function and does not read the rows.
     * @returns {{ name: string, items: Array<{ severity: string, selector: string, rule: string, value: string, source: string }> } | null}
     */
    snapshot() {
      if (!this.#attached) return null;
      const items = [];
      const seen = /* @__PURE__ */ new Set();
      const targets = [];
      if (this.hover) targets.push(this.hover);
      const watched = this.#watchedNodes();
      for (let i = 0; i < watched.length; i++) targets.push(watched[i]);
      for (let i = 0; i < targets.length; i++) {
        const node = targets[i];
        if (!node || seen.has(node) || !reportable(node)) continue;
        seen.add(node);
        items.push(boxItem(node, this.source));
      }
      const problems = problemItems(this.root, this.source);
      for (let i = 0; i < problems.length; i++) items.push(problems[i]);
      items.push(mutationItem(this.#mutationCounts(), this.root, this.source));
      return { name: "dom", items };
    }
    pump() {
      if (!this.#attached || !this.core) return this;
      if (!this.#reporting) return this;
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (this.#lastPump) {
        const dt = Math.min(Math.max(now - this.#lastPump, 0), 100);
        const instant = dt > 0 ? 1e3 / dt : 0;
        this.#fps = this.#fps ? this.#fps * 0.85 + instant * 0.15 : instant;
      }
      this.#lastPump = now;
      if (!this.frozen && this.#pointer.dirty) {
        this.#pointer.dirty = false;
        this.hover = this.#pick(this.#pointer.x, this.#pointer.y);
      }
      this.#emitTelemetry();
      this.#draw();
      return this;
    }
    #onCore(packet) {
      if (packet.type !== "sys") return;
      const op = packet.payload.op;
      if (op === "freeze") this.frozen = Boolean(packet.payload.frozen);
      if (op === "timescale") {
        const scale = Number(packet.payload.scale);
        if (Number.isFinite(scale)) this.timeScale = scale;
      }
      if (op === "visibility") this.#syncOverlay();
    }
    #pick(x, y) {
      if (typeof document === "undefined" || typeof document.elementsFromPoint !== "function") {
        return null;
      }
      const stack = document.elementsFromPoint(x, y);
      for (let i = 0; i < stack.length; i++) {
        const el = stack[i];
        if (!el || el.nodeType !== 1) continue;
        if (isBeeChrome(el)) continue;
        if (this.root && this.root !== document && !this.root.contains(el) && el !== this.root) continue;
        return el;
      }
      return null;
    }
    #watchedNodes() {
      if (!this.root || !this.watch.length || typeof this.root.querySelectorAll !== "function") return [];
      const out = [];
      const seen = /* @__PURE__ */ new Set();
      for (let i = 0; i < this.watch.length; i++) {
        const sel = this.watch[i];
        let list;
        try {
          list = this.root.querySelectorAll(sel);
        } catch {
          continue;
        }
        for (let j = 0; j < list.length; j++) {
          if (seen.has(list[j])) continue;
          seen.add(list[j]);
          out.push(list[j]);
        }
      }
      return out;
    }
    #emitTelemetry() {
      const hover = this.hover;
      const nodes = countElements(this.root);
      if (this.#fps > 0) {
        this.core.sendData("fps", { value: this.#fps, source: this.source });
      }
      this.core.sendData("metric", { name: "nodes", value: nodes, source: this.source });
      this.core.sendData("coord", {
        source: this.source,
        label: "pointer",
        x: this.#pointer.x,
        y: this.#pointer.y
      });
      if (!hover) {
        if (this.#lastHoverKey) {
          this.#lastHoverKey = "";
          this.core.sendData("state", { source: this.source, key: "hover", value: "\u2014" });
          this.core.sendData("state", { source: this.source, key: "box", value: "\u2014" });
          this.core.sendData("state", { source: this.source, key: "display", value: "\u2014" });
        }
        return;
      }
      const model = boxModel(hover);
      const key = cssPath(hover);
      this.core.sendData("state", { source: this.source, key: "hover", value: key });
      this.core.sendData("state", {
        source: this.source,
        key: "box",
        value: `${Math.round(model.border.w)}\xD7${Math.round(model.border.h)}`
      });
      this.core.sendData("state", {
        source: this.source,
        key: "display",
        value: model.display
      });
      if (key !== this.#lastHoverKey) {
        this.#lastHoverKey = key;
        if (!domNoiseQuiet(cssHuntEnabled(this.core), this.frozen, this.timeScale)) {
          this.core.sendData("log", {
            source: this.source,
            message: `hover ${key}  ${Math.round(model.border.w)}\xD7${Math.round(model.border.h)}  ${model.display}`
          });
        }
      }
    }
    #queueMutations(records) {
      if (this.frozen || !this.#reporting) return;
      for (let i = 0; i < records.length; i++) {
        const rec = records[i];
        if (isBeeChrome(rec.target)) continue;
        if (rec.type === "childList") {
          this.#mutAdded += rec.addedNodes.length;
          this.#mutRemoved += rec.removedNodes.length;
        } else if (rec.type === "attributes") {
          this.#mutAttr += 1;
        }
      }
      if (this.#mutTimer || typeof setTimeout !== "function") return;
      this.#mutTimer = setTimeout(() => {
        this.#mutTimer = 0;
        this.#flushMutations();
      }, 180);
    }
    #flushMutations() {
      const added = this.#mutAdded;
      const removed = this.#mutRemoved;
      const attr = this.#mutAttr;
      if (added || removed || attr) {
        this.#seenAdded = added;
        this.#seenRemoved = removed;
        this.#seenAttr = attr;
      }
      this.#mutAdded = 0;
      this.#mutRemoved = 0;
      this.#mutAttr = 0;
      if (!added && !removed && !attr) return;
      const quiet = domNoiseQuiet(cssHuntEnabled(this.core), this.frozen, this.timeScale);
      const parts = [];
      if (added) parts.push(`+${added}`);
      if (removed) parts.push(`-${removed}`);
      if (attr && !quiet) parts.push(`attr ${attr}`);
      if (parts.length) {
        this.core?.sendData("warn", {
          source: this.source,
          message: `mutate ${parts.join(" ")}`
        });
      }
      this.core?.sendData("metric", {
        name: "mutations",
        value: added + removed + attr,
        source: this.source
      });
    }
    #draw() {
      const canvas = this.#overlay;
      if (!canvas) return;
      this.#syncOverlay();
      const ctx = canvas.getContext("2d");
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (this.core && this.core.visible === false) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const watched = this.#watchedNodes();
      for (let i = 0; i < watched.length; i++) {
        if (watched[i] === this.hover) continue;
        strokeBox(ctx, boxModel(watched[i]).border, this.colorWatch);
      }
      if (this.hover) {
        drawBoxModel(ctx, boxModel(this.hover), {
          margin: this.colorMargin,
          padding: this.colorPadding,
          content: this.colorContent,
          line: this.colorHover
        });
        drawLabel(ctx, this.hover, w, h, this.colorHover);
      }
    }
    #mountOverlay() {
      if (typeof document === "undefined" || this.#overlay) return;
      const canvas = document.createElement("canvas");
      canvas.setAttribute("data-bee-ladybug-dom", "");
      canvas.style.background = "transparent";
      canvas.style.border = "0";
      canvas.style.padding = "0";
      canvas.style.boxShadow = "none";
      canvas.style.outline = "none";
      canvas.style.filter = "none";
      canvas.style.opacity = "1";
      canvas.style.transform = "none";
      canvas.style.pointerEvents = "none";
      canvas.style.position = "fixed";
      canvas.style.left = "0";
      canvas.style.top = "0";
      canvas.style.zIndex = "2147483645";
      canvas.style.margin = "0";
      document.body.appendChild(canvas);
      this.#overlay = canvas;
      this.#overlayStyle = null;
      this.#syncOverlay();
    }
    #unmountOverlay() {
      if (this.#overlay?.parentNode) this.#overlay.parentNode.removeChild(this.#overlay);
      this.#overlay = null;
      this.#overlayStyle = null;
    }
    #syncOverlay() {
      const canvas = this.#overlay;
      if (!canvas || typeof window === "undefined") return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const bitmapW = Math.round(w * dpr);
      const bitmapH = Math.round(h * dpr);
      if (canvas.width !== bitmapW) canvas.width = bitmapW;
      if (canvas.height !== bitmapH) canvas.height = bitmapH;
      const hidden = !this.#reporting || this.core && this.core.visible === false;
      const next = {
        width: `${w}px`,
        height: `${h}px`,
        display: hidden ? "none" : "block"
      };
      const prev = this.#overlayStyle;
      for (const key of Object.keys(next)) {
        if (!prev || prev[key] !== next[key]) canvas.style[key] = next[key];
      }
      this.#overlayStyle = next;
    }
    #enable() {
      this.#reporting = true;
      this.#syncOverlay();
    }
    #disable() {
      this.#reporting = false;
      if (this.#mutTimer && typeof clearTimeout === "function") clearTimeout(this.#mutTimer);
      this.#mutTimer = 0;
      this.#mutAdded = 0;
      this.#mutRemoved = 0;
      this.#mutAttr = 0;
      this.#syncOverlay();
    }
    #mutationCounts() {
      const pending = this.#mutAdded + this.#mutRemoved + this.#mutAttr;
      if (pending) {
        return { added: this.#mutAdded, removed: this.#mutRemoved, attr: this.#mutAttr };
      }
      return { added: this.#seenAdded, removed: this.#seenRemoved, attr: this.#seenAttr };
    }
  };
  function isBeeChrome(node) {
    let el = node && node.nodeType === 1 ? node : node?.parentElement;
    while (el) {
      const tag = el.tagName;
      if (tag === "BEE-LADYBUG-OVERLAY") return true;
      if (el.hasAttribute?.("data-bee-ladybug-dom")) return true;
      if (el.hasAttribute?.("data-bee-ladybug-canvas")) return true;
      if (el.hasAttribute?.("data-bee-ladybug-css")) return true;
      el = el.parentElement;
    }
    return false;
  }
  function cssPath(el) {
    if (!el || !el.tagName) return "node";
    const tag = el.tagName.toLowerCase();
    if (el.id) return `${tag}#${cssEscape(el.id)}`;
    const classes = el.classList ? [...el.classList].slice(0, 2) : [];
    if (classes.length) return `${tag}.${classes.map(cssEscape).join(".")}`;
    return tag;
  }
  function cssEscape(value) {
    return String(value).replace(/[^\w-]/g, "\\$&");
  }
  function parsePx(value) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }
  function boxModel(el) {
    const r = el.getBoundingClientRect();
    const s = typeof getComputedStyle === "function" ? getComputedStyle(el) : null;
    const mt = s ? parsePx(s.marginTop) : 0;
    const mr = s ? parsePx(s.marginRight) : 0;
    const mb = s ? parsePx(s.marginBottom) : 0;
    const ml = s ? parsePx(s.marginLeft) : 0;
    const bt = s ? parsePx(s.borderTopWidth) : 0;
    const br = s ? parsePx(s.borderRightWidth) : 0;
    const bb = s ? parsePx(s.borderBottomWidth) : 0;
    const bl = s ? parsePx(s.borderLeftWidth) : 0;
    const pt = s ? parsePx(s.paddingTop) : 0;
    const pr = s ? parsePx(s.paddingRight) : 0;
    const pb = s ? parsePx(s.paddingBottom) : 0;
    const pl = s ? parsePx(s.paddingLeft) : 0;
    return {
      display: s ? s.display : "block",
      margin: { x: r.left - ml, y: r.top - mt, w: r.width + ml + mr, h: r.height + mt + mb },
      border: { x: r.left, y: r.top, w: r.width, h: r.height },
      padding: {
        x: r.left + bl,
        y: r.top + bt,
        w: Math.max(0, r.width - bl - br),
        h: Math.max(0, r.height - bt - bb)
      },
      content: {
        x: r.left + bl + pl,
        y: r.top + bt + pt,
        w: Math.max(0, r.width - bl - br - pl - pr),
        h: Math.max(0, r.height - bt - bb - pt - pb)
      }
    };
  }
  function fillBox(ctx, box, color) {
    if (!box.w || !box.h) return;
    ctx.fillStyle = color;
    ctx.fillRect(box.x, box.y, box.w, box.h);
  }
  function strokeBox(ctx, box, color) {
    if (!box.w || !box.h) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w, box.h);
  }
  function drawBoxModel(ctx, model, colors) {
    fillBox(ctx, model.margin, colors.margin);
    fillBox(ctx, model.border, "rgba(7, 8, 12, 0.04)");
    fillBox(ctx, model.padding, colors.padding);
    fillBox(ctx, model.content, colors.content);
    strokeBox(ctx, model.border, colors.line);
  }
  function drawLabel(ctx, el, viewW, viewH, color) {
    const model = boxModel(el);
    const text = `${cssPath(el)}  ${Math.round(model.border.w)}\xD7${Math.round(model.border.h)}`;
    ctx.font = "11px ui-monospace, Consolas, monospace";
    const width = Math.ceil(ctx.measureText(text).width) + 12;
    const height = 18;
    let x = model.border.x;
    let y = model.border.y - height - 4;
    if (y < 8) y = model.border.y + model.border.h + 4;
    if (x + width > viewW - 8) x = Math.max(8, viewW - width - 8);
    if (x < 8) x = 8;
    if (y + height > viewH - 8) y = Math.max(8, viewH - height - 8);
    ctx.fillStyle = "rgba(7, 8, 12, 0.92)";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = color;
    ctx.strokeRect(x + 0.5, y + 0.5, width, height);
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + 6, y + height / 2);
  }
  function reportable(node) {
    if (!node || node.nodeType !== 1) return false;
    if (typeof node.getBoundingClientRect !== "function") return false;
    if (isBeeChrome(node) || isReportNoise(node)) return false;
    return true;
  }
  function boxItem(node, source) {
    const model = boxModel(node);
    return {
      severity: "ok",
      selector: cssPath(node),
      rule: "box",
      value: boxValue(model, styleOf(node)),
      source
    };
  }
  function boxValue(model, style) {
    const border = model.border;
    const content = model.content;
    return `border ${Math.round(border.w)}x${Math.round(border.h)} margin ${sideText(style, "margin")} padding ${sideText(style, "padding")} content ${Math.round(content.w)}x${Math.round(content.h)} ${model.display}`;
  }
  function sideText(style, kind) {
    const prefix = kind === "margin" ? "margin" : "padding";
    const top = style ? parsePx(style[`${prefix}Top`]) : 0;
    const right = style ? parsePx(style[`${prefix}Right`]) : 0;
    const bottom = style ? parsePx(style[`${prefix}Bottom`]) : 0;
    const left = style ? parsePx(style[`${prefix}Left`]) : 0;
    return `${top},${right},${bottom},${left}`;
  }
  function problemItems(root, source) {
    const nodes = collectElements(root);
    const items = [];
    const seen = /* @__PURE__ */ new Set();
    for (let i = 0; i < nodes.length && items.length < MAX_PROBLEM_ROWS; i++) {
      const node = nodes[i];
      if (!node || seen.has(node) || !reportable(node)) continue;
      seen.add(node);
      const style = styleOf(node);
      const margin = sideText(style, "margin");
      if (hasNegative(margin) && !isQuietProblem(node)) {
        items.push(problemItem(node, "negative margin", margin, source, "info"));
        if (items.length >= MAX_PROBLEM_ROWS) break;
      }
      const clip = clipValue(node);
      if (clip && !isQuietProblem(node) && !insideClippingContainer(node) && !elementClips(node)) {
        items.push(problemItem(node, "clipped", clip, source));
        if (items.length >= MAX_PROBLEM_ROWS) break;
      }
      const model = boxModel(node);
      if (model.border.w > 0 && model.border.h > 0 && (model.content.w === 0 || model.content.h === 0)) {
        if (isUnloadedLazyImage(node)) continue;
        items.push(problemItem(
          node,
          "collapsed content",
          `content ${Math.round(model.content.w)}x${Math.round(model.content.h)}`,
          source
        ));
      }
    }
    return items;
  }
  function problemItem(node, rule, value, source, severity = "warn") {
    return {
      severity,
      selector: cssPath(node),
      rule,
      value,
      source
    };
  }
  function isQuietProblem(node) {
    return isSrOnly(node) || hasAriaHidden(node);
  }
  function hasAriaHidden(el) {
    let node = el;
    while (node && node.nodeType === 1) {
      if (typeof node.getAttribute === "function" && node.getAttribute("aria-hidden") === "true") return true;
      node = node.parentElement;
    }
    return false;
  }
  function isSrOnly(el) {
    if (typeof getComputedStyle !== "function") return false;
    let style = null;
    try {
      style = getComputedStyle(el);
    } catch {
      return false;
    }
    if (!style) return false;
    const width = parseFloat(style.width || "");
    const height = parseFloat(style.height || "");
    const tiny = Number.isFinite(width) && width <= 1 || Number.isFinite(height) && height <= 1;
    if (!tiny) return false;
    const clip = String(style.clip || "");
    const clipPath = String(style.clipPath || "");
    return clip && clip !== "auto" && clip !== "none" || clipPath && clipPath !== "none";
  }
  function elementClips(el) {
    if (typeof getComputedStyle !== "function") return false;
    let style = null;
    try {
      style = getComputedStyle(el);
    } catch {
      return false;
    }
    const value = `${style.overflow || ""} ${style.overflowX || ""} ${style.overflowY || ""}`;
    return /\b(hidden|auto|scroll|clip)\b/.test(value);
  }
  function insideClippingContainer(el) {
    let node = el && el.parentElement;
    while (node && node.nodeType === 1) {
      if (typeof document !== "undefined" && (node === document.body || node === document.documentElement)) break;
      if (elementClips(node)) return true;
      node = node.parentElement;
    }
    return false;
  }
  function isUnloadedLazyImage(node) {
    if (!node || String(node.tagName || "").toUpperCase() !== "IMG") return false;
    const loading = typeof node.getAttribute === "function" ? node.getAttribute("loading") : node.loading;
    if (String(loading || node.loading || "").toLowerCase() !== "lazy") return false;
    if (node.complete === false) return true;
    return !Number(node.naturalWidth);
  }
  function hasNegative(sides) {
    return sides.split(",").some((part) => Number(part) < 0);
  }
  function clipValue(node) {
    const sw = finite(node.scrollWidth);
    const cw = finite(node.clientWidth);
    const sh = finite(node.scrollHeight);
    const ch = finite(node.clientHeight);
    const wide = sw != null && cw != null && sw > cw + 2;
    const tall = sh != null && ch != null && sh > ch + 2;
    if (!wide && !tall) return "";
    return `scroll ${sw ?? 0}x${sh ?? 0} client ${cw ?? 0}x${ch ?? 0}`;
  }
  function mutationItem(counts, root, source) {
    const total = counts.added + counts.removed + counts.attr;
    return {
      severity: total > 0 ? "warn" : "ok",
      selector: root && root.nodeType === 1 ? cssPath(root) : "root",
      rule: "mutations",
      value: `+${counts.added} -${counts.removed} attr ${counts.attr}`,
      source
    };
  }
  function styleOf(node) {
    if (typeof getComputedStyle !== "function") return null;
    try {
      return getComputedStyle(node);
    } catch {
      return null;
    }
  }
  function collectElements(root) {
    if (!root) return [];
    const out = [];
    if (root.nodeType === 1) out.push(root);
    let list = null;
    if (typeof root.querySelectorAll === "function") {
      try {
        list = root.querySelectorAll("*");
      } catch {
        list = null;
      }
    }
    if (list) {
      for (let i = 0; i < list.length; i++) out.push(list[i]);
    }
    return out;
  }
  function finite(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }
  function countElements(root) {
    if (!root) return 0;
    if (root.nodeType === 1) return 1 + (root.getElementsByTagName?.("*").length ?? 0);
    return root.getElementsByTagName?.("*").length ?? 0;
  }
  function domNoiseQuiet(cssEnabled, frozen, timeScale) {
    if (!cssEnabled) return false;
    return Boolean(frozen) || timeScale === 1;
  }
  function cssHuntEnabled(core) {
    if (!core || typeof core.getAdapters !== "function") return false;
    const list = core.getAdapters();
    for (let i = 0; i < list.length; i++) {
      if (list[i].name === "css" && list[i].enabled) return true;
    }
    return false;
  }

  // src/adapters/CSSAdapter.js
  var MAX_SNAPSHOT = 80;
  var CSS_ADAPTER_DEFAULTS = Object.freeze({
    source: "css",
    hotkey: "F6",
    scanKey: "KeyS",
    pinKey: "KeyP",
    label: "F6 CSS",
    maxScan: 8,
    issueWindow: 5e3,
    maxIssues: 10
  });
  var CSSAdapter = class {
    /**
     * @param {import('../core/BeeLadybugCore.js').BeeLadybugCore} core
     * @param {Partial<typeof CSS_ADAPTER_DEFAULTS>} [options]
     */
    constructor(core, options = {}) {
      const cfg = { ...CSS_ADAPTER_DEFAULTS, ...options };
      this.core = core;
      this.source = cfg.source;
      this.hotkey = cfg.hotkey;
      this.scanKey = cfg.scanKey;
      this.pinKey = cfg.pinKey;
      this.label = cfg.label;
      this.maxScan = cfg.maxScan;
      this.issueWindow = cfg.issueWindow;
      this.maxIssues = cfg.maxIssues;
      this.#attached = false;
      this.#active = false;
      this.#rules = [];
      this.#sheetsDirty = true;
      this.#x = 0;
      this.#y = 0;
      this.#rafId = 0;
      this.#lastEl = null;
      this.#pinned = null;
      this.#panelLock = false;
      this.#issues = [];
      this.#notes = [];
      this.#seenSheets = /* @__PURE__ */ new Set();
      this.#issueLog = /* @__PURE__ */ new Map();
      this.#hoverBox = null;
      this.#pinBox = null;
      this.#observer = null;
      this.#unsubscribe = null;
      this.#hasPointer = false;
      this.#onMove = (event) => {
        if (this.core && this.core.visible === false) return;
        this.#x = event.clientX;
        this.#y = event.clientY;
        this.#hasPointer = true;
        this.#schedule();
      };
      this.#onKey = (event) => this.#handleKey(event);
      this.#onScroll = () => this.#placeBoxes();
      this.#onMutate = (records) => {
        if (!records.some(touchesSheet)) return;
        this.#sheetsDirty = true;
        if (this.#hasPointer) this.#schedule();
      };
    }
    #attached;
    #active;
    #rules;
    #sheetsDirty;
    #x;
    #y;
    #rafId;
    #lastEl;
    #pinned;
    #panelLock;
    #issues;
    #notes;
    #seenSheets;
    #issueLog;
    #hoverBox;
    #pinBox;
    #observer;
    #unsubscribe;
    /** True after the first mousemove: before that (x, y) is not a real pointer. */
    #hasPointer;
    #onMove;
    #onKey;
    #onScroll;
    #onMutate;
    get active() {
      return this.#active;
    }
    attach() {
      if (this.#attached) return this;
      this.#attached = true;
      if (this.core && typeof this.core.subscribe === "function") {
        this.#unsubscribe = this.core.subscribe((packet) => this.#onCore(packet));
      }
      this.core?.registerAdapter("css", {
        label: this.label,
        hotkey: this.hotkey,
        enabled: false,
        enable: () => this.#enable(),
        disable: () => this.#disable(),
        snapshot: () => this.snapshot()
      });
      this.core?.sendData("log", {
        source: this.source,
        message: "CSSAdapter attached. F6 CSS hunt. S scans. P pins the panel."
      });
      this.core?.sendData("state", {
        source: this.source,
        key: "css.hunt",
        value: "off"
      });
      return this;
    }
    detach() {
      if (!this.#attached) return this;
      this.#disable();
      this.#attached = false;
      if (this.#unsubscribe) this.#unsubscribe();
      this.#unsubscribe = null;
      this.core?.unregisterAdapter("css");
      return this;
    }
    #onCore(packet) {
      if (packet.type !== "sys" || packet.payload?.op !== "visibility") return;
      this.#placeBoxes();
    }
    #boxesVisible() {
      return !(this.core && this.core.visible === false);
    }
    /** Page scan. Click a row to outline one element of that group. */
    scan() {
      if (!this.#active || typeof document === "undefined") return this;
      if (this.#sheetsDirty) this.#rebuildSheets();
      const nodes = document.body ? document.body.querySelectorAll("*") : [];
      resetCookieCover();
      const overflow = [];
      const rows = [];
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        if (!el || isBeeChrome2(el) || isSkippedTag(el) || isReportNoise(el)) continue;
        const measured = measureViewportOverflow(el);
        if (measured) overflow.push(measured);
        const findings = [];
        pushNegativeMargins(el, findings);
        pushInvisible(el, findings);
        pushBlockers(el, findings, true);
        pushImage(el, findings);
        pushStacking(el, findings, true);
        pushImportant(el, this.#rules, findings);
        for (let j = 0; j < findings.length; j++) {
          rows.push({ el, selector: cssPath2(el), ...findings[j] });
        }
      }
      const causes = keepOverflowCauses(overflow);
      for (let i = 0; i < causes.length; i++) {
        const cause = causes[i];
        rows.push({
          el: cause.el,
          selector: cssPath2(cause.el),
          kind: "overflows viewport",
          rank: 0,
          level: overflowLevel(cause.el),
          score: cause.score
        });
      }
      const banner = takeCookieCover();
      if (banner) rows.push(banner);
      const groups = groupIssues(rows);
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        this.#rememberCause(row.el, row.selector, row.kind, row.level);
      }
      this.#publishIssues();
      const shown = groups.slice(0, this.maxScan);
      const items = shown.map((group) => ({
        level: group.level,
        text: formatIssue(group),
        onSelect: () => this.#pin(group.el)
      }));
      this.#lastEl = null;
      this.core?.publishDetail(items);
      this.core?.sendData("state", {
        source: this.source,
        key: "css.scan",
        value: String(shown.length)
      });
      if (shown.length || isVerbose(this.core)) {
        this.core?.sendData("warn", {
          source: this.source,
          message: shown.length ? `scan ${shown.length} issue(s). Click a row to outline it.` : "scan clean: no causes found."
        });
      }
      return this;
    }
    /**
     * Full hunt scan for the report. Hunt can stay off: nothing is logged,
     * pinned, or published. Hidden boxes, WordPress admin, and BeeLadybug
     * chrome are skipped.
     * @returns {{ name: string, items: Array<{ severity: string, selector: string, rule: string, value: string, source: string }> } | null}
     */
    snapshot() {
      if (!this.#attached) return null;
      if (typeof document === "undefined" || !document.body) return { name: "css", items: [] };
      const built = collectImportantRules();
      const nodes = document.body.querySelectorAll("*");
      resetCookieCover();
      const overflow = [];
      const rows = [];
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        if (!el || isBeeChrome2(el) || isSkippedTag(el) || isReportNoise(el)) continue;
        const measured = measureViewportOverflow(el);
        if (measured) overflow.push(measured);
        const findings = [];
        pushNegativeMargins(el, findings);
        pushInvisible(el, findings);
        pushBlockers(el, findings, true);
        pushImage(el, findings);
        pushStacking(el, findings, true);
        pushImportant(el, built.rules, findings);
        for (let j = 0; j < findings.length; j++) {
          rows.push({ el, selector: cssPath2(el), ...findings[j] });
        }
      }
      const kept = keepOverflowCauses(overflow);
      for (let i = 0; i < kept.length; i++) {
        const cause = kept[i];
        rows.push({
          el: cause.el,
          selector: cssPath2(cause.el),
          kind: "overflows viewport",
          rank: 0,
          level: overflowLevel(cause.el),
          score: cause.score
        });
      }
      const banner = takeCookieCover();
      if (banner) rows.push(banner);
      let causes = [];
      const plain = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (describeCause(row.kind, row.selector)) {
          causes = addCause(causes, { kind: row.kind, path: row.selector, el: row.el, level: row.level }, Infinity);
        } else {
          plain.push(row);
        }
      }
      const items = [];
      for (let i = 0; i < causes.length; i++) {
        const entry = causes[i];
        items.push({
          severity: reportSeverity(entry.level),
          selector: entry.cause,
          rule: causeRule(entry.type),
          value: formatCause(entry),
          source: this.source
        });
      }
      const groups = groupIssues(plain);
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const count = group.count > 1 ? ` \xD7${group.count}` : "";
        items.push({
          severity: reportSeverity(group.level),
          selector: group.selector,
          rule: plainRule(group.kind),
          value: `${group.kind}${count}`,
          source: this.source
        });
      }
      for (let i = 0; i < built.unreadable.length; i++) {
        const label = built.unreadable[i];
        items.push({
          severity: "ok",
          selector: label,
          rule: "unreadable sheet",
          value: label,
          source: this.source
        });
      }
      items.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
      if (items.length > MAX_SNAPSHOT) items.length = MAX_SNAPSHOT;
      return { name: "css", items };
    }
    #enable() {
      if (this.#active || typeof document === "undefined" || typeof window === "undefined") return;
      this.#active = true;
      this.#sheetsDirty = true;
      this.#mountBoxes();
      window.addEventListener("mousemove", this.#onMove, true);
      window.addEventListener("keydown", this.#onKey);
      window.addEventListener("scroll", this.#onScroll, true);
      window.addEventListener("resize", this.#onScroll);
      if (typeof MutationObserver !== "undefined" && document.documentElement) {
        this.#observer = new MutationObserver(this.#onMutate);
        this.#observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["href", "rel", "media", "disabled", "type"],
          characterData: true
        });
      }
      this.#rebuildSheets();
      this.core?.sendData("state", { source: this.source, key: "css.hunt", value: "on" });
      this.core?.sendData("log", {
        source: this.source,
        message: "CSS hunt on. Hover an element, P pins the panel, S scans."
      });
    }
    #disable() {
      if (!this.#active) return;
      this.#active = false;
      this.#hasPointer = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", this.#onMove, true);
        window.removeEventListener("keydown", this.#onKey);
        window.removeEventListener("scroll", this.#onScroll, true);
        window.removeEventListener("resize", this.#onScroll);
      }
      if (this.#rafId && typeof cancelAnimationFrame === "function") cancelAnimationFrame(this.#rafId);
      this.#rafId = 0;
      if (this.#observer) this.#observer.disconnect();
      this.#observer = null;
      this.#lastEl = null;
      this.#pinned = null;
      this.#panelLock = false;
      this.#issues = [];
      this.#notes = [];
      this.#seenSheets.clear();
      this.#issueLog.clear();
      this.#unmountBoxes();
      this.core?.publishDetail([]);
      this.core?.publishIssues([]);
      this.core?.sendData("state", { source: this.source, key: "css.hunt", value: "off" });
      this.core?.sendData("state", { source: this.source, key: "css.target", value: "\u2014" });
      this.core?.sendData("state", { source: this.source, key: "css.hits", value: "0" });
      this.core?.sendData("state", { source: this.source, key: "css.pin", value: "off" });
      this.core?.sendData("log", { source: this.source, message: "CSS hunt off." });
    }
    #handleKey(event) {
      if (!this.#active || event.repeat) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (this.core && this.core.visible === false) return;
      if (isTypingTarget2(event.target)) return;
      if (event.code === this.pinKey) {
        event.preventDefault();
        this.#togglePanelPin();
        return;
      }
      if (event.code !== this.scanKey) return;
      event.preventDefault();
      this.#panelLock = false;
      this.scan();
    }
    #schedule() {
      if (!this.#active || this.#rafId || typeof requestAnimationFrame !== "function") return;
      this.#rafId = requestAnimationFrame(() => {
        this.#rafId = 0;
        if (!this.#active) return;
        if (this.#sheetsDirty) this.#rebuildSheets();
        this.#inspect(this.#x, this.#y);
      });
    }
    #rebuildSheets() {
      this.#sheetsDirty = false;
      const built = collectImportantRules();
      this.#rules = built.rules;
      for (let i = 0; i < built.unreadable.length; i++) this.#rememberSheet(built.unreadable[i]);
      this.#publishIssues();
    }
    #inspect(x, y) {
      const el = pickElement(x, y);
      placeBox(this.#hoverBox, el, this.#boxesVisible());
      if (this.#panelLock) return;
      if (el === this.#lastEl) return;
      this.#lastEl = el;
      if (!el) {
        this.core?.publishDetail([]);
        this.core?.sendData("state", { source: this.source, key: "css.target", value: "\u2014" });
        this.core?.sendData("state", { source: this.source, key: "css.hits", value: "0" });
        return;
      }
      const findings = [];
      resetCookieCover();
      pushImportant(el, this.#rules, findings);
      pushOverflow(el, findings);
      pushInvisible(el, findings);
      pushBlockers(el, findings, true);
      const banner = takeCookieCover();
      if (banner) findings.push(banner);
      pushImage(el, findings);
      pushStacking(el, findings, true);
      const path = cssPath2(el);
      this.core?.sendData("state", { source: this.source, key: "css.target", value: path });
      this.core?.sendData("state", {
        source: this.source,
        key: "css.hits",
        value: String(findings.length)
      });
      this.core?.publishDetail(findings.map((hit) => ({
        level: hit.level,
        text: `${path}  ${hit.text}`,
        onSelect: () => this.#pin(el)
      })));
      this.#stickFindings(el, path, findings);
      if (!findings.length) {
        if (isVerbose(this.core)) {
          this.core?.sendData("log", { source: this.source, message: `${path}  clean` });
        }
        return;
      }
      this.#logFindings(path, findings);
    }
    #togglePanelPin() {
      if (this.#panelLock) {
        this.#panelLock = false;
        this.#pinned = null;
        placeBox(this.#pinBox, null, this.#boxesVisible());
        this.core?.sendData("state", { source: this.source, key: "css.pin", value: "off" });
        this.core?.sendData("log", { source: this.source, message: "CSS pin off." });
        this.#lastEl = null;
        this.#schedule();
        return;
      }
      const el = this.#lastEl;
      if (!el) return;
      this.#panelLock = true;
      this.#pin(el);
      const path = cssPath2(el);
      this.core?.sendData("state", { source: this.source, key: "css.pin", value: path });
      this.core?.sendData("log", { source: this.source, message: `CSS pin ${path}` });
    }
    #logFindings(path, findings) {
      const now = nowMs();
      for (let i = 0; i < findings.length; i++) {
        const hit = findings[i];
        const text = hit.text || hit.kind || "";
        if (!text || text.startsWith("unreadable sheet:") || hit.level === "info") continue;
        if (!rememberIssue(this.#issueLog, `${path}\0${text}`, now, this.issueWindow)) continue;
        const level = hit.level === "error" ? "error" : "warn";
        this.core?.sendData(level, {
          source: this.source,
          message: `${path}  ${text}`
        });
      }
    }
    #stickFindings(el, path, findings) {
      let changed = false;
      for (let i = 0; i < findings.length; i++) {
        const hit = findings[i];
        if (hit.kind === "overflows viewport" && !elementCausesOverflow(el)) continue;
        if (this.#rememberCause(el, path, hit.kind, hit.level)) changed = true;
      }
      if (changed) this.#publishIssues();
    }
    #rememberCause(el, path, kind, level) {
      const next = addCause(this.#issues, { kind, path, el, level }, this.maxIssues);
      if (next === this.#issues) return false;
      this.#issues = next;
      return true;
    }
    #rememberSheet(href) {
      const label = String(href || "");
      if (!label || this.#seenSheets.has(label)) return;
      this.#seenSheets.add(label);
      this.#notes.push({ text: `unreadable sheet: ${label}` });
      this.core?.sendData("log", {
        source: this.source,
        level: "info",
        message: `unreadable sheet: ${label}`
      });
    }
    #publishIssues() {
      const bugs = [];
      const notes = this.#notes.map((note) => ({
        level: "info",
        key: note.text,
        text: note.text
      }));
      for (let i = 0; i < this.#issues.length; i++) {
        const entry = this.#issues[i];
        const shown = uniqueTargetTexts(entry.targets);
        const item = {
          key: entry.key,
          text: formatCause(entry),
          targets: shown.map((target) => ({
            text: target.text,
            onSelect: () => this.#pin(target.el)
          }))
        };
        const level = entry.level === "info" || entry.level === "warn" ? entry.level : "error";
        if (level === "info") notes.push({ ...item, level });
        else bugs.push({ ...item, level });
      }
      this.core?.publishIssues(bugs.concat(notes));
    }
    #pin(el) {
      this.#pinned = el;
      placeBox(this.#pinBox, el, this.#boxesVisible());
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      }
    }
    #placeBoxes() {
      const visible = this.#boxesVisible();
      placeBox(this.#hoverBox, this.#lastEl, visible);
      placeBox(this.#pinBox, this.#pinned, visible);
    }
    #mountBoxes() {
      if (typeof document === "undefined" || this.#hoverBox) return;
      this.#hoverBox = makeBox("hover", "1px solid #ffd36a", "transparent");
      this.#pinBox = makeBox("pin", "2px solid #ff3b4e", "rgba(255, 59, 78, 0.12)");
      document.body.appendChild(this.#hoverBox);
      document.body.appendChild(this.#pinBox);
    }
    #unmountBoxes() {
      this.#hoverBox?.remove();
      this.#pinBox?.remove();
      this.#hoverBox = null;
      this.#pinBox = null;
    }
  };
  function collectImportantRules() {
    const rules = [];
    const unreadable = [];
    if (typeof document === "undefined") return { rules, unreadable };
    const sheets = document.styleSheets;
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      if (sheet.disabled === true) continue;
      if (sheet.media && sheet.media.mediaText && !mediaMatches(sheet.media.mediaText)) continue;
      let list = null;
      try {
        list = sheet.cssRules;
      } catch {
        unreadable.push(sheet.href || "<style> inline");
        continue;
      }
      walkRules(list, sheetLabel(sheet), rules);
    }
    return { rules, unreadable };
  }
  function mediaMatches(mediaText) {
    try {
      return typeof matchMedia === "function" ? matchMedia(mediaText).matches : true;
    } catch {
      return true;
    }
  }
  function walkRules(list, source, into) {
    if (!list) return;
    for (let i = 0; i < list.length; i++) {
      const rule = list[i];
      if (!rule) continue;
      if (rule.type === 4 && rule.media) {
        if (mediaMatches(rule.media.mediaText)) walkRules(rule.cssRules, source, into);
        continue;
      }
      if (rule.type === 1 && rule.selectorText && rule.style) {
        const props = collapseImportantProps(importantProps(rule.style));
        if (props.length) into.push({ selector: rule.selectorText, source, props });
      } else if (rule.cssRules) {
        walkRules(rule.cssRules, source, into);
      }
    }
  }
  function importantProps(style) {
    const props = [];
    for (let i = 0; i < style.length; i++) {
      const property = style.item(i);
      if (style.getPropertyPriority(property) !== "important") continue;
      props.push({ property, value: style.getPropertyValue(property).trim() });
    }
    return props;
  }
  var LONGHAND_FAMILIES = Object.freeze([
    { shorthand: "margin", sides: ["margin-top", "margin-right", "margin-bottom", "margin-left"] },
    { shorthand: "padding", sides: ["padding-top", "padding-right", "padding-bottom", "padding-left"] },
    { shorthand: "border", sides: ["border-top", "border-right", "border-bottom", "border-left"], equalOnly: true },
    { shorthand: "inset", sides: ["top", "right", "bottom", "left"] }
  ]);
  function collapseImportantProps(props) {
    const list = Array.isArray(props) ? props : [];
    const byName = /* @__PURE__ */ new Map();
    for (let i = 0; i < list.length; i++) byName.set(list[i].property, list[i].value);
    const used = /* @__PURE__ */ new Set();
    const collapsed = [];
    for (let i = 0; i < LONGHAND_FAMILIES.length; i++) {
      const family = LONGHAND_FAMILIES[i];
      if (!family.sides.every((side) => byName.has(side))) continue;
      const values = family.sides.map((side) => byName.get(side));
      if (family.equalOnly && values.some((value) => value !== values[0])) continue;
      for (let s = 0; s < family.sides.length; s++) used.add(family.sides[s]);
      collapsed.push({ property: family.shorthand, value: boxShorthand(values) });
    }
    collapseBorderLonghands(byName, used, collapsed);
    const out = collapsed.slice();
    for (let i = 0; i < list.length; i++) {
      if (used.has(list[i].property)) continue;
      out.push(list[i]);
    }
    return out;
  }
  var BORDER_EDGES = Object.freeze(["top", "right", "bottom", "left"]);
  var BORDER_PARTS = Object.freeze(["width", "style", "color"]);
  function collapseBorderLonghands(byName, used, collapsed) {
    const got = {};
    for (let i = 0; i < BORDER_PARTS.length; i++) {
      const part = BORDER_PARTS[i];
      const values = [];
      for (let e = 0; e < BORDER_EDGES.length; e++) {
        const name = `border-${BORDER_EDGES[e]}-${part}`;
        if (!byName.has(name)) {
          values.length = 0;
          break;
        }
        values.push(byName.get(name));
      }
      if (values.length === 4 && values.every((value) => value === values[0])) got[part] = values[0];
    }
    const parts = Object.keys(got);
    if (!parts.length) return;
    if (got.width && got.style && got.color) {
      markBorderParts(used, BORDER_PARTS);
      collapsed.push({ property: "border", value: `${got.width} ${got.style} ${got.color}` });
      return;
    }
    markBorderParts(used, parts);
    for (let i = 0; i < parts.length; i++) {
      collapsed.push({ property: `border-${parts[i]}`, value: got[parts[i]] });
    }
  }
  function markBorderParts(used, parts) {
    for (let i = 0; i < parts.length; i++) {
      for (let e = 0; e < BORDER_EDGES.length; e++) {
        used.add(`border-${BORDER_EDGES[e]}-${parts[i]}`);
      }
    }
  }
  function boxShorthand(values) {
    const top = values[0];
    const right = values[1];
    const bottom = values[2];
    const left = values[3];
    if (top === right && right === bottom && bottom === left) return top;
    if (top === bottom && right === left) return `${top} ${right}`;
    if (right === left) return `${top} ${right} ${bottom}`;
    return `${top} ${right} ${bottom} ${left}`;
  }
  function sheetLabel(sheet) {
    if (sheet.href) return sheet.href;
    return "<style> inline";
  }
  function pushImportant(el, rules, findings) {
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      let matched = false;
      try {
        matched = el.matches(rule.selector);
      } catch {
        continue;
      }
      if (!matched || !rule.props.length) continue;
      const body = rule.props.map((prop) => `${prop.property}: ${prop.value}`).join("; ");
      const decl = `!important ${rule.selector} { ${body} }`;
      findings.push({
        level: "info",
        rank: 4,
        score: rule.props.length,
        kind: decl,
        text: `${decl} @ ${rule.source}`
      });
    }
  }
  function pushOverflow(el, findings) {
    if (isQuietHide(el)) return;
    const measured = measureViewportOverflow(el);
    if (measured) {
      const past = measured.left > 1 ? `left ${Math.round(-measured.left)}px` : `right +${Math.round(measured.right)}px`;
      findings.push({
        level: overflowLevel(el),
        rank: 0,
        score: measured.score,
        kind: "overflows viewport",
        text: `overflows viewport (${past})`
      });
    }
    pushNegativeMargins(el, findings);
  }
  function measureViewportOverflow(el) {
    if (!el || typeof el.getBoundingClientRect !== "function") return null;
    if (typeof document === "undefined") return null;
    if (el === document.documentElement || el === document.body) return null;
    if (isQuietHide(el)) return null;
    const rect = el.getBoundingClientRect();
    const view = document.documentElement.clientWidth;
    const left = rect.left < -1 ? -rect.left : 0;
    const right = rect.right > view + 1 ? rect.right - view : 0;
    if (left <= 1 && right <= 1) return null;
    return { el, left, right, width: rect.width, view, score: Math.max(left, right) };
  }
  function keepOverflowCauses(items) {
    return items.filter((item) => !echoedByDescendant(item, items) && !fitsOnlyBecauseOfChild(item, items));
  }
  function echoedByDescendant(item, items) {
    for (let i = 0; i < items.length; i++) {
      const other = items[i];
      if (other.el === item.el || typeof item.el.contains !== "function" || !item.el.contains(other.el)) continue;
      const leftEcho = item.left <= 1 || Math.abs(item.left - other.left) <= 2;
      const rightEcho = item.right <= 1 || Math.abs(item.right - other.right) <= 2;
      const matched = item.left > 1 && Math.abs(item.left - other.left) <= 2 || item.right > 1 && Math.abs(item.right - other.right) <= 2;
      if (matched && leftEcho && rightEcho) return true;
    }
    return false;
  }
  function fitsOnlyBecauseOfChild(item, items) {
    if (item.width > item.view + 2) return false;
    if (item.left <= 1 && item.right <= 1) return false;
    let leftOk = item.left <= 1;
    let rightOk = item.right <= 1;
    let childOverflows = false;
    for (let i = 0; i < items.length; i++) {
      const other = items[i];
      if (other.el === item.el || typeof item.el.contains !== "function" || !item.el.contains(other.el)) continue;
      if (other.left > 1 || other.right > 1) childOverflows = true;
      if (item.left > 1 && other.left + 2 >= item.left) leftOk = true;
      if (item.right > 1 && other.right + 2 >= item.right) rightOk = true;
    }
    return childOverflows && leftOk && rightOk;
  }
  function pushNegativeMargins(el, findings) {
    if (typeof getComputedStyle !== "function" || isQuietHide(el) || insideClippingContainer2(el)) return;
    const style = getComputedStyle(el);
    const sides = ["top", "right", "bottom", "left"];
    for (let i = 0; i < sides.length; i++) {
      const raw = style.getPropertyValue(`margin-${sides[i]}`);
      const value = parseFloat(raw);
      if (!Number.isFinite(value) || value >= 0) continue;
      findings.push({
        level: "info",
        rank: 5,
        score: Math.abs(value),
        kind: `negative margin margin-${sides[i]}: ${raw.trim()}`,
        text: `negative margin margin-${sides[i]}: ${raw.trim()}`
      });
    }
  }
  var ISSUE_RANK = Object.freeze({
    overflow: 0,
    blocker: 1,
    stack: 1,
    invisible: 2,
    image: 3,
    important: 4,
    hint: 6
  });
  function groupIssues(rows) {
    const map = /* @__PURE__ */ new Map();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const kind = row.kind || row.text;
      const key = `${row.selector}\0${kind}`;
      const prev = map.get(key);
      if (!prev) {
        map.set(key, { ...row, kind, count: 1 });
        continue;
      }
      prev.count += 1;
      if (row.score > prev.score) {
        prev.score = row.score;
        prev.el = row.el;
      }
    }
    return [...map.values()].sort((a, b) => a.rank - b.rank || b.score - a.score || b.count - a.count);
  }
  function formatIssue(group) {
    const count = group.count > 1 ? ` \xD7${group.count}` : "";
    if (typeof group.kind === "string" && group.kind.startsWith("click blocked by ")) {
      return `${group.selector} possible click blocked (verify)${count}`;
    }
    return `${group.selector} ${group.kind}${count}`;
  }
  function pushInvisible(el, findings) {
    if (!hasOwnText(el) || isQuietHide(el) || insideClippingContainer2(el)) return;
    const style = getComputedStyle(el);
    if (opacityZero(el)) {
      findings.push(issue("invisible text (opacity 0)", ISSUE_RANK.invisible, 30));
    }
    const color = parseColor(style.color);
    if (!color) return;
    if (color.a === 0) {
      findings.push(issue("invisible text (transparent color)", ISSUE_RANK.invisible, 30));
      return;
    }
    const behind = paintBehind(el);
    if (behind && nearlySame(color, behind)) {
      findings.push(issue("invisible text (color matches background)", ISSUE_RANK.invisible, 30));
    }
  }
  var SVG_HIT_TAGS = /* @__PURE__ */ new Set(["svg", "path", "circle", "ellipse", "rect", "polygon"]);
  var COOKIE_MARK = /cookie|consent|onetrust|ot-sdk|cookiebot/i;
  var cookieCover = null;
  function pushBlockers(el, findings, skipNoise = false) {
    if (!el.getBoundingClientRect || typeof document.elementFromPoint !== "function") return;
    if (isCookieBanner(el)) return;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return;
    const pseudo = coveringPseudo(x, y);
    if (pseudo) findings.push(blockerFinding(pseudo));
    const hit = document.elementFromPoint(x, y);
    if (!hit || isBeeChrome2(hit) || hit === el) return;
    if (typeof el.contains === "function" && el.contains(hit)) return;
    if (typeof hit.contains === "function" && hit.contains(el)) return;
    if (isSvgHit(hit)) return;
    if (pseudo && (hit === document.documentElement || hit === document.body)) return;
    if (skipNoise && isReportNoise(hit)) return;
    if (isCookieBanner(hit)) {
      if (!cookieCover) cookieCover = hit;
      return;
    }
    findings.push(blockerFinding(cssPath2(hit)));
  }
  function blockerFinding(by) {
    return {
      level: "warn",
      rank: ISSUE_RANK.blocker,
      score: 40,
      kind: `click blocked by ${by}`,
      text: "possible click blocked (verify)"
    };
  }
  function resetCookieCover() {
    cookieCover = null;
  }
  function takeCookieCover() {
    const hit = cookieCover;
    cookieCover = null;
    if (!hit) return null;
    return {
      el: hit,
      selector: cssPath2(hit),
      kind: "cookie banner open, covering page",
      text: "cookie banner open, covering page",
      level: "info",
      rank: ISSUE_RANK.hint,
      score: 1
    };
  }
  function isSvgHit(el) {
    return SVG_HIT_TAGS.has(String(el && el.tagName || "").toLowerCase());
  }
  function isCookieBanner(el) {
    let node = el;
    while (node && node.nodeType === 1) {
      const id = node.id || "";
      let cls = "";
      if (typeof node.className === "string") cls = node.className;
      else if (node.className && typeof node.className.baseVal === "string") cls = node.className.baseVal;
      if (COOKIE_MARK.test(`${id} ${cls}`)) return true;
      node = node.parentElement;
    }
    return false;
  }
  function pushImage(el, findings) {
    if (!el || el.tagName !== "IMG") return;
    const naturalW = el.naturalWidth;
    const naturalH = el.naturalHeight;
    if (!naturalW || !naturalH || typeof el.getBoundingClientRect !== "function") return;
    const rect = el.getBoundingClientRect();
    const fit = (typeof getComputedStyle === "function" ? getComputedStyle(el).objectFit : "") || "fill";
    if (!isDistortedImage(naturalW, naturalH, rect.width, rect.height, fit)) return;
    const gap = renderedRatioGap(naturalW, naturalH, rect.width, rect.height);
    findings.push({
      level: "error",
      rank: ISSUE_RANK.image,
      score: gap * 100,
      kind: "distorted image",
      text: `distorted image ${Math.round(gap * 100)}% (object-fit: fill)`
    });
  }
  function isDistortedImage(naturalW, naturalH, renderedW, renderedH, objectFit) {
    const fit = objectFit || "fill";
    if (fit !== "fill") return false;
    return renderedRatioGap(naturalW, naturalH, renderedW, renderedH) > 0.05;
  }
  function renderedRatioGap(naturalW, naturalH, renderedW, renderedH) {
    if (!naturalW || !naturalH || !renderedW || !renderedH) return 0;
    const natural = naturalW / naturalH;
    const rendered = renderedW / renderedH;
    return Math.abs(natural - rendered) / natural;
  }
  function rememberIssue(seen, key, now, windowMs = 5e3) {
    const prev = seen.get(key);
    if (typeof prev === "number" && now - prev < windowMs) return false;
    seen.set(key, now);
    if (seen.size > 64) {
      for (const [name, at] of seen) {
        if (now - at >= windowMs) seen.delete(name);
      }
    }
    return true;
  }
  function describeCause(kind, path) {
    if (kind === "overflows viewport") {
      return { key: `overflow\0${path}`, type: "overflow", cause: path, reason: "", level: "error" };
    }
    const prefix = "click blocked by ";
    if (typeof kind === "string" && kind.startsWith(prefix)) {
      const cause = kind.slice(prefix.length);
      return { key: `block\0${cause}`, type: "block", cause, reason: "", level: "warn" };
    }
    const stack = typeof kind === "string" ? kind.match(/^stacking context \(([^)]+)\) by (.+)$/) : null;
    if (stack) {
      return {
        key: `stack\0${stack[2]}\0${stack[1]}`,
        type: "stack",
        cause: stack[2],
        reason: stack[1],
        level: "info"
      };
    }
    const hint = typeof kind === "string" ? kind.match(/^will-change (.+?) by (.+)$/) : null;
    if (hint) {
      return {
        key: `will\0${hint[2]}\0${hint[1]}`,
        type: "stack-hint",
        cause: hint[2],
        reason: hint[1],
        level: "info"
      };
    }
    return null;
  }
  function addCause(list, entry, max = 10) {
    const described = describeCause(entry.kind, entry.path);
    if (!described) return list;
    const target = { text: entry.path, el: entry.el };
    const rest = [];
    let prev = null;
    for (let i = 0; i < list.length; i++) {
      if (list[i].key === described.key) prev = list[i];
      else rest.push(list[i]);
    }
    const targets = prev ? prev.targets.filter((item) => !sameTarget(item, target)) : [];
    targets.unshift(target);
    rest.unshift({
      key: described.key,
      type: described.type,
      cause: described.cause,
      reason: described.reason || "",
      level: causeLevel(entry, prev, described),
      targets
    });
    return rest.slice(0, max);
  }
  function formatCause(entry) {
    const count = entry.targets.length;
    if (entry.type === "block") return "possible click blocked (verify)";
    if (entry.type === "stack") {
      const noun = count === 1 ? "child" : "children";
      return `${entry.cause} creates stacking context (${entry.reason}) - z-index of ${count} ${noun} is trapped`;
    }
    if (entry.type === "stack-hint") {
      const noun = count === 1 ? "child" : "children";
      return `${entry.cause} will-change: ${entry.reason} \u2014 z-index of ${count} ${noun} stays in this layer`;
    }
    if (count <= 1) return `${entry.cause} overflows viewport`;
    return `${entry.cause} overflows viewport \xD7${count}`;
  }
  function stackingReasons(style) {
    const read = (prop, camel) => {
      if (style && typeof style.getPropertyValue === "function") {
        const raw = style.getPropertyValue(prop);
        if (raw) return String(raw).trim();
      }
      if (style && style[camel] != null && style[camel] !== "") return String(style[camel]).trim();
      return "";
    };
    const bugs = [];
    const transform = read("transform", "transform");
    if (transform && transform !== "none") bugs.push("transform");
    const opacity = parseFloat(read("opacity", "opacity"));
    if (Number.isFinite(opacity) && opacity < 1) bugs.push("opacity");
    const filter = read("filter", "filter");
    if (filter && filter !== "none") bugs.push("filter");
    const position = read("position", "position") || "static";
    const zIndex = read("z-index", "zIndex") || "auto";
    if (position !== "static" && zIndex !== "auto") bugs.push("z-index");
    const hint = willChangeHint(read("will-change", "willChange"));
    return { bugs, hint };
  }
  function willChangeHint(value) {
    if (!value || value === "auto") return "";
    const parts = value.split(",").map((part) => part.trim().toLowerCase());
    const hit = [];
    for (let i = 0; i < parts.length; i++) {
      if ((parts[i] === "transform" || parts[i] === "opacity") && !hit.includes(parts[i])) hit.push(parts[i]);
    }
    return hit.join(", ");
  }
  function pushStacking(el, findings, skipNoise = false) {
    if (!el || typeof getComputedStyle !== "function" || !el.parentElement) return;
    const own = getComputedStyle(el);
    const ownZ = own.zIndex || own.getPropertyValue?.("z-index") || "auto";
    if (!ownZ || ownZ === "auto") return;
    let node = el.parentElement;
    while (node && node.nodeType === 1) {
      if (isBeeChrome2(node)) return;
      if (skipNoise && isReportNoise(node)) return;
      const found = stackingReasons(getComputedStyle(node));
      const ancestor = cssPath2(node);
      if (found.bugs.length) {
        const reason = found.bugs[0];
        findings.push({
          level: stackingIsCovered(el) ? "error" : "info",
          rank: ISSUE_RANK.stack,
          score: 35,
          kind: `stacking context (${reason}) by ${ancestor}`,
          text: `z-index trapped by ${ancestor} (${reason})`
        });
        if (found.hint) findings.push(stackHint(ancestor, found.hint));
        return;
      }
      if (found.hint) {
        findings.push(stackHint(ancestor, found.hint));
        return;
      }
      node = node.parentElement;
    }
  }
  function stackHint(ancestor, hint) {
    return {
      level: "info",
      rank: ISSUE_RANK.hint,
      score: 1,
      kind: `will-change ${hint} by ${ancestor}`,
      text: `will-change: ${hint} on ${ancestor}`
    };
  }
  function sameTarget(a, b) {
    if (a.el && b.el) return a.el === b.el;
    return a.text === b.text;
  }
  function uniqueTargetTexts(targets) {
    const list = Array.isArray(targets) ? targets : [];
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const text = list[i].text;
      if (seen.has(text)) continue;
      seen.add(text);
      out.push(list[i]);
    }
    return out;
  }
  function elementCausesOverflow(el) {
    const self = measureViewportOverflow(el);
    if (!self) return false;
    const items = [self];
    if (typeof el.querySelectorAll === "function") {
      const nodes = el.querySelectorAll("*");
      for (let i = 0; i < nodes.length; i++) {
        const measured = measureViewportOverflow(nodes[i]);
        if (measured) items.push(measured);
      }
    }
    const causes = keepOverflowCauses(items);
    for (let i = 0; i < causes.length; i++) {
      if (causes[i].el === el) return true;
    }
    return false;
  }
  function nowMs() {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
  }
  function causeLevel(entry, prev, described) {
    if (entry.level === "error" || prev && prev.level === "error") return "error";
    return entry.level || described.level || "info";
  }
  function isQuietHide(el) {
    if (!el || el.nodeType !== 1 || typeof document === "undefined") return false;
    return hasAriaHidden2(el) || isSrOnly2(el);
  }
  function overflowLevel(el) {
    return insideClippingContainer2(el) ? "info" : "error";
  }
  function hasAriaHidden2(el) {
    let node = el;
    while (node && node.nodeType === 1) {
      if (readAttr(node, "aria-hidden") === "true") return true;
      node = node.parentElement;
    }
    return false;
  }
  function readAttr(el, name) {
    if (!el || typeof el.getAttribute !== "function") return "";
    const value = el.getAttribute(name);
    return value == null ? "" : String(value);
  }
  function readStyle2(style, prop, camel) {
    if (style && typeof style.getPropertyValue === "function") {
      const raw = style.getPropertyValue(prop);
      if (raw) return String(raw).trim();
    }
    if (style && style[camel] != null && style[camel] !== "") return String(style[camel]).trim();
    return "";
  }
  function isSrOnly2(el) {
    if (typeof getComputedStyle !== "function") return false;
    let style = null;
    try {
      style = getComputedStyle(el);
    } catch {
      return false;
    }
    if (!style) return false;
    const width = parseFloat(readStyle2(style, "width", "width"));
    const height = parseFloat(readStyle2(style, "height", "height"));
    const tiny = Number.isFinite(width) && width <= 1 || Number.isFinite(height) && height <= 1;
    if (!tiny) return false;
    const clip = readStyle2(style, "clip", "clip");
    const clipPath = readStyle2(style, "clip-path", "clipPath");
    return clip && clip !== "auto" && clip !== "none" || clipPath && clipPath !== "none";
  }
  function insideClippingContainer2(el) {
    let node = el.parentElement;
    while (node && node.nodeType === 1) {
      if (node === document.body || node === document.documentElement) break;
      if (elementClips2(node)) return true;
      node = node.parentElement;
    }
    return false;
  }
  function elementClips2(el) {
    if (typeof getComputedStyle !== "function") return false;
    let style = null;
    try {
      style = getComputedStyle(el);
    } catch {
      return false;
    }
    const ox = readStyle2(style, "overflow-x", "overflowX") || readStyle2(style, "overflow", "overflow");
    const oy = readStyle2(style, "overflow-y", "overflowY") || readStyle2(style, "overflow", "overflow");
    return ox === "hidden" || ox === "auto" || ox === "scroll" || ox === "clip" || oy === "hidden" || oy === "auto" || oy === "scroll" || oy === "clip";
  }
  function stackingIsCovered(el) {
    if (!el || typeof el.getBoundingClientRect !== "function" || typeof document === "undefined") return false;
    if (typeof document.elementFromPoint !== "function") return false;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    if (typeof window !== "undefined" && (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight)) return false;
    const hit = document.elementFromPoint(x, y);
    if (!hit || hit === el || isBeeChrome2(hit)) return false;
    if (typeof el.contains === "function" && el.contains(hit)) return false;
    if (typeof hit.contains === "function" && hit.contains(el)) return false;
    return true;
  }
  function reportSeverity(level) {
    if (level === "error") return "error";
    if (level === "warn" || level === "warning") return "warn";
    if (level === "info") return "info";
    return "ok";
  }
  function severityRank(level) {
    if (level === "error") return 0;
    if (level === "warn") return 1;
    if (level === "info") return 2;
    return 3;
  }
  function causeRule(type) {
    if (type === "block") return "click blocked";
    if (type === "stack") return "stacking context";
    if (type === "stack-hint") return "will-change";
    return "overflow";
  }
  function plainRule(kind) {
    const text = String(kind || "");
    if (text.startsWith("!important")) return "!important";
    if (text.startsWith("invisible text")) return "invisible text";
    if (text.startsWith("negative margin")) return "negative margin";
    if (text === "distorted image") return "distorted image";
    return text;
  }
  function issue(kind, rank, score) {
    return { level: "error", rank, score, kind, text: kind };
  }
  function isVerbose(core) {
    return Boolean(core) && !core.frozen && core.timeScale !== 1;
  }
  function coveringPseudo(x, y) {
    const hosts = [document.documentElement, document.body];
    const names = ["::before", "::after"];
    for (let i = 0; i < hosts.length; i++) {
      const host = hosts[i];
      if (!host) continue;
      for (let j = 0; j < names.length; j++) {
        const box = pseudoBox(host, names[j]);
        if (!box || box.pointerEvents === "none") continue;
        if (x < box.x || y < box.y || x > box.x + box.w || y > box.y + box.h) continue;
        return `${host.tagName.toLowerCase()}${names[j]}`;
      }
    }
    return "";
  }
  function pseudoBox(el, pseudo) {
    const style = getComputedStyle(el, pseudo);
    const content = style.content;
    if (!content || content === "none" || content === "normal") return null;
    if (style.position !== "fixed" && style.position !== "absolute") return null;
    const width = parseFloat(style.width);
    const height = parseFloat(style.height);
    if (!width || !height || width < 2 || height < 2) return null;
    let x = parseFloat(style.left);
    let y = parseFloat(style.top);
    if (!Number.isFinite(x)) x = 0;
    if (!Number.isFinite(y)) y = 0;
    if (style.position === "absolute") {
      const host = el.getBoundingClientRect();
      x = host.left + x;
      y = host.top + y;
    }
    return { x, y, w: width, h: height, pointerEvents: style.pointerEvents };
  }
  function pickElement(x, y) {
    if (typeof document === "undefined" || typeof document.elementsFromPoint !== "function") return null;
    const stack = document.elementsFromPoint(x, y);
    for (let i = 0; i < stack.length; i++) {
      const el = stack[i];
      if (!el || isBeeChrome2(el) || isReportNoise(el)) continue;
      if (el === document.documentElement || el === document.body) continue;
      return el;
    }
    return null;
  }
  function paintBehind(el) {
    const own = parseColor(getComputedStyle(el).backgroundColor);
    if (own && own.a > 0.04) return own;
    let node = el.parentElement;
    while (node) {
      const bg = parseColor(getComputedStyle(node).backgroundColor);
      if (bg && bg.a > 0.04) return bg;
      node = node.parentElement;
    }
    return null;
  }
  function opacityZero(el) {
    let node = el;
    while (node && node.nodeType === 1) {
      const value = parseFloat(getComputedStyle(node).opacity);
      if (value === 0) return true;
      node = node.parentElement;
    }
    return false;
  }
  function parseColor(value) {
    const text = String(value || "").trim();
    if (text === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
    const match = text.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/);
    if (!match) return null;
    let alpha = 1;
    if (match[4] != null) {
      alpha = match[4].endsWith("%") ? parseFloat(match[4]) / 100 : parseFloat(match[4]);
    }
    return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: alpha };
  }
  function nearlySame(a, b) {
    return Math.abs(a.r - b.r) < 2 && Math.abs(a.g - b.g) < 2 && Math.abs(a.b - b.b) < 2 && Math.abs(a.a - b.a) < 0.05;
  }
  function hasOwnText(el) {
    const tag = el.tagName;
    if (tag === "BUTTON" || tag === "A" || tag === "LABEL" || tag === "INPUT" || tag === "TEXTAREA") return true;
    if (el.childElementCount > 0) return false;
    return Boolean((el.textContent || "").trim());
  }
  function cssPath2(el) {
    if (!el || !el.tagName) return "node";
    const tag = el.tagName.toLowerCase();
    if (el.id) return `${tag}#${cssEscape2(el.id)}`;
    const classes = el.classList ? [...el.classList].slice(0, 2) : [];
    if (classes.length) return `${tag}.${classes.map(cssEscape2).join(".")}`;
    return tag;
  }
  function cssEscape2(value) {
    return String(value).replace(/[^\w-]/g, "\\$&");
  }
  function isSkippedTag(el) {
    const tag = el.tagName;
    return tag === "SCRIPT" || tag === "STYLE" || tag === "LINK" || tag === "META";
  }
  function isTypingTarget2(target) {
    if (!target || !target.tagName) return false;
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    return Boolean(target.isContentEditable);
  }
  function touchesSheet(record) {
    if (!record) return false;
    if (record.type === "characterData") return record.target?.parentElement?.nodeName === "STYLE";
    if (record.type === "attributes") {
      const name = record.target?.nodeName;
      return name === "STYLE" || name === "LINK";
    }
    if (record.target?.nodeName === "STYLE") return true;
    const nodes = [];
    if (record.addedNodes) {
      for (let i = 0; i < record.addedNodes.length; i++) nodes.push(record.addedNodes[i]);
    }
    if (record.removedNodes) {
      for (let i = 0; i < record.removedNodes.length; i++) nodes.push(record.removedNodes[i]);
    }
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node || node.nodeType !== 1) continue;
      if (node.nodeName === "STYLE" || node.nodeName === "LINK") return true;
      if (typeof node.querySelector === "function" && node.querySelector("style, link")) return true;
    }
    return false;
  }
  function isBeeChrome2(node) {
    let el = node && node.nodeType === 1 ? node : node?.parentElement;
    while (el) {
      if (el.tagName === "BEE-LADYBUG-OVERLAY") return true;
      if (el.hasAttribute?.("data-bee-ladybug-dom")) return true;
      if (el.hasAttribute?.("data-bee-ladybug-canvas")) return true;
      if (el.hasAttribute?.("data-bee-ladybug-css")) return true;
      el = el.parentElement;
    }
    return false;
  }
  function makeBox(kind, border, fill) {
    const node = document.createElement("div");
    node.setAttribute("data-bee-ladybug-css", kind);
    node.style.position = "fixed";
    node.style.pointerEvents = "none";
    node.style.zIndex = "2147483644";
    node.style.display = "none";
    node.style.boxSizing = "border-box";
    node.style.border = border;
    node.style.background = fill;
    return node;
  }
  function placeBox(node, el, visible = true) {
    if (!node) return;
    if (visible === false || !el || typeof el.getBoundingClientRect !== "function" || isBeeChrome2(el)) {
      node.style.display = "none";
      return;
    }
    const rect = el.getBoundingClientRect();
    node.style.display = "block";
    node.style.left = `${rect.left}px`;
    node.style.top = `${rect.top}px`;
    node.style.width = `${rect.width}px`;
    node.style.height = `${rect.height}px`;
  }

  // src/adapters/AntAdapter.js
  var ANT_ADAPTER_DEFAULTS = Object.freeze({
    threshold: 30,
    windowMs: 1e3,
    source: "ant"
  });

  // src/adapters/SpiderAdapter.js
  var SPIDER_ADAPTER_DEFAULTS = Object.freeze({
    longTaskThreshold: 50,
    resourceThreshold: 500,
    source: "spider"
  });

  // src/adapters/python/PythonBridge.js
  var PYTHON_BRIDGE_DEFAULTS = Object.freeze({
    url: "ws://127.0.0.1:8765",
    autoReconnect: true,
    reconnectMs: 1500,
    source: "python"
  });

  // extension/content.src.js
  var STATE_KEY = "__BEE_LADYBUG_EXTENSION__";
  var HOST_TAG2 = "bee-ladybug-overlay";
  var ENTITY_MESSAGE = "bee-ladybug-entities";
  var MISSING_ENTITIES = "nessuna entit\xE0: il gioco deve esporre window.__BEE_ENTITIES__";
  var GAME_KEYS = /* @__PURE__ */ new Set(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
  function pagePlan(hasCanvas) {
    if (hasCanvas) {
      return { canvas: true, domEnabled: false, cssEnabled: false, autoPump: true };
    }
    return { canvas: false, domEnabled: true, cssEnabled: true, autoPump: false };
  }
  function findGameCanvas(doc) {
    if (!doc || typeof doc.querySelectorAll !== "function") return null;
    const list = doc.querySelectorAll("canvas");
    for (let i = 0; i < list.length; i++) {
      const canvas = list[i];
      if (!canvas) continue;
      if (typeof canvas.hasAttribute === "function" && canvas.hasAttribute("data-bee-ladybug-canvas")) continue;
      if (typeof canvas.hasAttribute === "function" && canvas.hasAttribute("data-bee-ladybug-dom")) continue;
      return canvas;
    }
    return null;
  }
  function entitiesFromMessage(data) {
    if (!data || typeof data !== "object" || data.source !== ENTITY_MESSAGE) {
      return { accept: false, entities: null, missing: false };
    }
    if (Array.isArray(data.entities)) {
      return { accept: true, entities: data.entities, missing: false };
    }
    return { accept: true, entities: null, missing: true };
  }
  function isHudGameKey(event, root) {
    if (!event || !GAME_KEYS.has(event.code) || !root) return false;
    const target = event.target;
    const button = target && typeof target.closest === "function" ? target.closest("button") : null;
    if (!button || typeof root.contains !== "function") return false;
    return root.contains(button);
  }
  function hideAskButton(root) {
    if (!root || typeof root.querySelector !== "function") return;
    if (typeof document !== "undefined" && typeof root.appendChild === "function" && !root.querySelector("style[data-bee-hide-ask]")) {
      const style = document.createElement("style");
      style.setAttribute("data-bee-hide-ask", "");
      style.textContent = 'button[data-act="ask"]{display:none !important}';
      root.appendChild(style);
    }
    const button = root.querySelector('[data-act="ask"]');
    if (!button) return;
    button.hidden = true;
    if (button.style) button.style.display = "none";
    if (typeof button.setAttribute === "function") button.setAttribute("aria-hidden", "true");
  }
  function guardHudButtons(root) {
    if (!root || typeof root.addEventListener !== "function") return function noop() {
    };
    const onMouseDown = (event) => {
      const button = event.target && typeof event.target.closest === "function" ? event.target.closest("button") : null;
      if (!button || !root.contains(button)) return;
      event.preventDefault();
    };
    const onClick = (event) => {
      const button = event.target && typeof event.target.closest === "function" ? event.target.closest("button") : null;
      if (!button || !root.contains(button)) return;
      if (typeof button.blur === "function") button.blur();
    };
    const onKeyDown = (event) => {
      if (!isHudGameKey(event, root)) return;
      event.preventDefault();
      const button = event.target.closest("button");
      if (button && typeof button.blur === "function") button.blur();
    };
    root.addEventListener("mousedown", onMouseDown, true);
    root.addEventListener("click", onClick, true);
    root.addEventListener("keydown", onKeyDown, true);
    return function unguard() {
      root.removeEventListener("mousedown", onMouseDown, true);
      root.removeEventListener("click", onClick, true);
      root.removeEventListener("keydown", onKeyDown, true);
    };
  }
  function applyEntityMessage(game, core, state, data) {
    const parsed = entitiesFromMessage(data);
    if (!parsed.accept || !game) return state;
    if (parsed.missing) {
      if (!state.warned && core && typeof core.sendData === "function") {
        state.warned = true;
        core.sendData("warn", { source: "canvas", message: MISSING_ENTITIES });
      }
      return state;
    }
    if (typeof game.setEntities === "function") game.setEntities(parsed.entities);
    return state;
  }
  function stop(state) {
    if (state && typeof state.unlisten === "function") {
      try {
        state.unlisten();
      } catch {
      }
    }
    if (state && typeof state.unguard === "function") {
      try {
        state.unguard();
      } catch {
      }
    }
    try {
      const bridge = globalThis.__BEE_LADYBUG_ENTITY_BRIDGE__;
      if (bridge && typeof bridge.stop === "function") bridge.stop();
    } catch {
    }
    const adapters = state && Array.isArray(state.adapters) ? state.adapters : [];
    for (let i = 0; i < adapters.length; i++) {
      const adapter = adapters[i];
      try {
        if (adapter && typeof adapter.detach === "function") adapter.detach();
      } catch {
      }
    }
    try {
      if (state && state.core && typeof state.core.destroy === "function") state.core.destroy();
    } catch {
    }
    globalThis[STATE_KEY] = void 0;
  }
  function listenEntities(game, core) {
    const state = { warned: false };
    const onMessage = (event) => {
      if (!event || event.source !== globalThis) return;
      applyEntityMessage(game, core, state, event.data);
    };
    globalThis.addEventListener("message", onMessage);
    return () => globalThis.removeEventListener("message", onMessage);
  }
  function start() {
    const canvas = findGameCanvas(document);
    const plan = pagePlan(Boolean(canvas));
    const adapters = [];
    let core;
    let unguard = function noop() {
    };
    let unlisten = function noop() {
    };
    try {
      core = new BeeLadybugCore();
      const host = document.querySelector(HOST_TAG2);
      const shadow = host && host.shadowRoot;
      hideAskButton(shadow);
      unguard = guardHudButtons(shadow);
      if (plan.canvas) {
        const game = new CanvasAdapter(core, { canvas, autoPump: true });
        game.attach();
        adapters.push(game);
        unlisten = listenEntities(game, core);
        const dom = new WebDOMAdapter(core, {
          root: document.body || document.documentElement
        });
        dom.attach();
        adapters.push(dom);
        core.setAdapterEnabled("dom", false);
        const css = new CSSAdapter(core);
        css.attach();
        adapters.push(css);
      } else {
        const dom = new WebDOMAdapter(core, {
          root: document.body || document.documentElement
        });
        dom.attach();
        adapters.push(dom);
        const css = new CSSAdapter(core);
        css.attach();
        adapters.push(css);
        core.setAdapterEnabled("css", true);
      }
      globalThis[STATE_KEY] = { core, adapters, unguard, unlisten };
    } catch (error) {
      console.error("[BeeLadybug extension]", error);
      stop({ core, adapters, unguard, unlisten });
    }
  }
  function boot() {
    const current = globalThis[STATE_KEY];
    if (current) stop(current);
    else start();
  }
  if (typeof document !== "undefined") boot();
})();
