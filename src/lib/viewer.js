import { diff, TYPE } from "./diff.js";
import styles from "./styles.js";

const STAT_TYPES = ["added", "removed", "modified", "type_changed"];

const format = (val) => {
  if (val === null) return ["null", "null"];
  if (val === undefined) return ["undefined", "null"];
  const type = typeof val;
  if (type === "string") return [val, "string"];
  if (type === "number" || type === "boolean") return [String(val), type];
  return [JSON.stringify(val), "string"];
};

class JsonDiffViewer extends HTMLElement {
  #left = null;
  #right = null;
  #tree = null;
  #exp = {};
  #rendering = false;
  #proxy = new Proxy(this.#exp, {
    set: (t, k, v) => {
      t[k] = v;
      if (!this.#rendering) this.#render();
      return true;
    },
  });
  #stats = {};
  #showOnlyChanged = false;

  static observedAttributes = ["left", "right"];
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.#render();
  }
  attributeChangedCallback(name, _, value) {
    if (name === "left") this.#left = JSON.parse(value);
    if (name === "right") this.#right = JSON.parse(value);
    this.#compute();
  }
  set left(v) {
    this.#left = v;
    this.#compute();
  }
  set right(v) {
    this.#right = v;
    this.#compute();
  }
  get left() {
    return this.#left;
  }
  get right() {
    return this.#right;
  }
  setData(left, right) {
    this.#left = left;
    this.#right = right;
    this.#compute();
  }

  #compute() {
    if (!this.#left || !this.#right) return;
    this.#tree = diff(this.#left, this.#right);
    this.#stats = Object.fromEntries(STAT_TYPES.map((t) => [t, 0]));
    this.#walk(this.#tree, (n) => {
      if (n.type !== TYPE.UNCHANGED) this.#stats[n.type]++;
    });
    for (const k of Object.keys(this.#exp)) delete this.#exp[k];
    this.#walk(this.#tree, (n, p) => {
      if ((n.isArray || n.isObject) && !n.hasDiff) this.#exp[p] = false;
    });
    this.#render();
  }

  #walk(node, fn, path = "") {
    const currentPath = path ? `${path}.${node.key}` : String(node.key);
    fn(node, currentPath);
    for (const child of node.children || []) this.#walk(child, fn, currentPath);
  }

  #collapseAll() {
    if (!this.#tree) return;
    this.#rendering = true;
    this.#walk(this.#tree, (n, p) => {
      if (n.isArray || n.isObject) this.#proxy[p] = false;
    });
    this.#rendering = false;
    this.#render();
  }

  #expandAll() {
    this.#rendering = true;
    for (const k of Object.keys(this.#exp)) delete this.#exp[k];
    this.#rendering = false;
    this.#render();
  }

  #render() {
    if (!this.#tree)
      return (this.shadowRoot.innerHTML = `<style>${styles}</style><div class="empty">Provide left and right JSON</div>`);
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="stats">
        ${STAT_TYPES.map((t) => `<div class="stat stat-${t}"><span class="dot"></span>${this.#stats[t]} ${t.replace("_", " ")}</div>`).join("")}
        <div class="stats-buttons">
          <button class="btn-filter" data-action="filter" aria-label="Show only changed">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" class="checkbox-icon ${this.#showOnlyChanged ? 'checked' : ''}">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </button>
          <button class="btn-collapse" data-action="collapse"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9 15H6q-.425 0-.712-.288T5 14t.288-.712T6 13h4q.425 0 .713.288T11 14v4q0 .425-.288.713T10 19t-.712-.288T9 18zm6-6h3q.425 0 .713.288T19 10t-.288.713T18 11h-4q-.425 0-.712-.288T13 10V6q0-.425.288-.712T14 5t.713.288T15 6z"/></svg></button>
          <button class="btn-expand" data-action="expand"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M7 17h3q.425 0 .713.288T11 18t-.288.713T10 19H6q-.425 0-.712-.288T5 18v-4q0-.425.288-.712T6 13t.713.288T7 14zM17 7h-3q-.425 0-.712-.288T13 6t.288-.712T14 5h4q.425 0 .713.288T19 6v4q0 .425-.288.713T18 11t-.712-.288T17 10z"/></svg></button>
        </div>
      </div>
      <div class="container">
        ${["left", "right"]
          .map((side) => {
            const label = side === "left" ? "Original" : "Modified";
            return `<div class="panel" data-side="${side}"><div class="header">${label}</div>${this.#node(this.#tree, side, "")}</div>`;
          })
          .join("")}
      </div>`;
    this.#bind();
  }

  #node(node, side, path, root = true) {
    const currentPath = path ? `${path}.${node.key}` : String(node.key);
    const value = node[side];
    const hasDiff = node.hasDiff && node.type !== TYPE.UNCHANGED;
    const diffClass = hasDiff ? `diff-${node.type}` : "";
    const hasChildDiff = node.hasDiff && node.children?.some((c) => c.hasDiff);
    const dotType = node.type === TYPE.UNCHANGED ? "modified" : node.type;
    const dot = hasChildDiff ? `<span class="dot dot-${dotType}"></span>` : "";
    const keyHtml = root
      ? ""
      : `<span class="key">${node.key}</span><span class="colon">:</span>`;
    const rootClass = root ? " root" : "";
    const nodeDiffClass = hasDiff && !hasChildDiff ? ` ${diffClass}` : "";

    if (!node.isArray && !node.isObject) {
      const [val, type] = format(value);
      return `<div class="node${rootClass}${nodeDiffClass}"><div class="line"><span class="tog"></span>${dot}${keyHtml}<span class="val-${type}">${val}</span></div></div>`;
    }

    const [open, close] = node.isArray ? ["[", "]"] : ["{", "}"];
    const isExpanded = this.#proxy[currentPath] !== false;
    const filteredChildren = this.#showOnlyChanged
      ? node.children?.filter((c) => c.hasDiff) || []
      : node.children || [];
    const childrenHtml =
      filteredChildren
        .map((c) => this.#node(c, side, currentPath, false))
        .join("") || "";
    const preview = `${filteredChildren.length}`;

    if (!isExpanded) {
      return `<div class="node${rootClass}${nodeDiffClass}"><div class="line" data-p="${currentPath}"><span class="tog">▶</span>${dot}${keyHtml}<span class="br">${open}</span><span class="preview">${preview}</span><span class="br">${close}</span></div></div>`;
    }

    return `<div class="node${rootClass}${nodeDiffClass}"><div class="line" data-p="${currentPath}"><span class="tog">▼</span>${dot}${keyHtml}<span class="br">${open}</span></div>${childrenHtml}<div class="line"><span class="tog"></span><span class="br">${close}</span></div></div>`;
  }

  #bind() {
    const [leftPanel, rightPanel] = this.shadowRoot.querySelectorAll(".panel");
    let syncing = false;

    const syncScroll = (source) => () => {
      if (syncing) return;
      syncing = true;
      const target = source === leftPanel ? rightPanel : leftPanel;
      target.scrollTop = source.scrollTop;
      target.scrollLeft = source.scrollLeft;
      syncing = false;
    };

    leftPanel?.addEventListener("scroll", syncScroll(leftPanel));
    rightPanel?.addEventListener("scroll", syncScroll(rightPanel));

    for (const el of this.shadowRoot.querySelectorAll("[data-p]")) {
      el.onclick = () => {
        this.#proxy[el.dataset.p] = this.#proxy[el.dataset.p] === false;
      };
    }

    this.shadowRoot
      .querySelector('[data-action="filter"]')
      ?.addEventListener("click", () => {
        this.#showOnlyChanged = !this.#showOnlyChanged;
        this.#render();
      });
    this.shadowRoot
      .querySelector('[data-action="collapse"]')
      ?.addEventListener("click", () => this.#collapseAll());
    this.shadowRoot
      .querySelector('[data-action="expand"]')
      ?.addEventListener("click", () => this.#expandAll());
  }
}

customElements.define("json-diff-viewer", JsonDiffViewer);
export { JsonDiffViewer };
