import { diff, TYPE } from "./diff.js";
import styles from "./styles.js";

const STAT_TYPES = ["added", "removed", "modified"];

const format = (val) => {
  if (val === null) return ["null", "null"];
  if (val === undefined) return ["undefined", "null"];
  const type = typeof val;
  if (type === "string") return [val, "string"];
  if (type === "number" || type === "boolean") return [String(val), type];
  return [JSON.stringify(val), "string"];
};

const buildPath = (path, key) => path ? `${path}.${key}` : String(key);

const filterChildren = (children, showOnlyChanged) =>
  showOnlyChanged ? children.filter((c) => c.hasDiff) : children;

const isExpanded = (proxy, path) => proxy[path] !== false;

const buildKeyHtml = (key, root, hidden = false) =>
  root ? "" : `<span class="key"${hidden ? ' style="visibility: hidden;"' : ""}>${key}</span><span class="colon"${hidden ? ' style="visibility: hidden;"' : ""}>:</span>`;

const buildRootClass = (root) => root ? " root" : "";

const getBrackets = (isArray) => isArray ? ["[", "]"] : ["{", "}"];

const collectStats = (tree) => {
  const stats = Object.fromEntries(STAT_TYPES.map((t) => [t, 0]));
  const walk = (node, path = "") => {
    const currentPath = buildPath(path, node.key);
    if (node.type !== TYPE.UNCHANGED) stats[node.type]++;
    (node.children || []).forEach((child) => {
      walk(child, currentPath);
    });
  };
  walk(tree);
  return stats;
};

const initializeExpanded = (tree, proxy) => {
  const walk = (node, path = "") => {
    const currentPath = buildPath(path, node.key);
    if ((node.isArray || node.isObject) && !node.hasDiff) proxy[currentPath] = false;
    (node.children || []).forEach((child) => {
      walk(child, currentPath);
    });
  };
  walk(tree);
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
  #showOnlyChanged = true;

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
    this.#stats = collectStats(this.#tree);
    Object.keys(this.#exp).forEach((k) => {
      delete this.#exp[k];
    });
    initializeExpanded(this.#tree, this.#exp);
    this.#render();
  }

  #collapseAll() {
    if (!this.#tree) return;
    this.#rendering = true;
    const walk = (node, path = "") => {
      const currentPath = buildPath(path, node.key);
      if (node.isArray || node.isObject) this.#proxy[currentPath] = false;
      (node.children || []).forEach((child) => {
        walk(child, currentPath);
      });
    };
    walk(this.#tree);
    this.#rendering = false;
    this.#render();
  }

  #expandAll() {
    this.#rendering = true;
    Object.keys(this.#exp).forEach((k) => {
      delete this.#exp[k];
    });
    this.#rendering = false;
    this.#render();
  }

  #render() {
    if (!this.#tree) {
      this.shadowRoot.innerHTML = `<style>${styles}</style><div class="empty">Provide left and right JSON</div>`;
      return;
    }
    const panel = this.shadowRoot.querySelector('.panel');
    const scroll = { top: panel?.scrollTop || 0, left: panel?.scrollLeft || 0 };
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="stats">
        <div class="stats-items">
          ${STAT_TYPES.map((t) => `<div class="stat stat-${t}"><span class="dot"></span>${this.#stats[t]} ${t.replace("_", " ")}</div>`).join("")}
        </div>
        <div class="stats-buttons">
          <label class="switch" aria-label="Show only changed" title="Show only changed">
            <input type="checkbox" class="checkbox" data-action="filter" ${this.#showOnlyChanged ? "checked" : ""}>
            <div class="slider"></div>
          </label>
          <button class="btn-collapse" data-action="collapse" title="Collapse all"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9 15H6q-.425 0-.712-.288T5 14t.288-.712T6 13h4q.425 0 .713.288T11 14v4q0 .425-.288.713T10 19t-.712-.288T9 18zm6-6h3q.425 0 .713.288T19 10t-.288.713T18 11h-4q-.425 0-.712-.288T13 10V6q0-.425.288-.712T14 5t.713.288T15 6z"/></svg></button>
          <button class="btn-expand" data-action="expand" title="Expand all"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M7 17h3q.425 0 .713.288T11 18t-.288.713T10 19H6q-.425 0-.712-.288T5 18v-4q0-.425.288-.712T6 13t.713.288T7 14zM17 7h-3q-.425 0-.712-.288T13 6t.288-.712T14 5h4q.425 0 .713.288T19 6v4q0 .425-.288.713T18 11t-.712-.288T17 10z"/></svg></button>
        </div>
      </div>
      <div class="container">
        ${["left", "right"]
          .map((side) => {
            return `<div class="panel" data-side="${side}">${this.#renderNode(this.#tree, side, "")}</div>`;
          })
          .join("")}
      </div>`;
    this.#bind();
    this.shadowRoot.querySelectorAll('.panel').forEach(p => {
      p.scrollTop = scroll.top;
      p.scrollLeft = scroll.left;
    });
  }

  #renderNode(node, side, path, root = true, placeholderParam = false) {
    const currentPath = buildPath(path, node.key);
    const value = node[side];
    const rootClass = buildRootClass(root);
    const placeholder = value === undefined && node.children?.length ? true : placeholderParam;
    const hidden = placeholder ? ' style="visibility: hidden;"' : "";
    const keyHtml = buildKeyHtml(node.key, root, placeholder);

    if (value === undefined && !node.children?.length) {
      const otherValue = side === 'left' ? node.right : node.left;
      const [val, type] = format(otherValue);
      const hiddenKey = buildKeyHtml(node.key, root, true);
      return `<div class="node${rootClass}"><div class="line placeholder">${hiddenKey}<span class="val-${type}" style="visibility: hidden;">${val}</span></div></div>`;
    }

    if (value !== undefined && !node.isArray && !node.isObject) {
      const [val, type] = format(value);
      if (placeholder) {
        return `<div class="node${rootClass}"><div class="line placeholder">${keyHtml}<span class="val-${type}"${hidden}>${val}</span></div></div>`;
      }
      const hasDiff = node.hasDiff && node.type !== TYPE.UNCHANGED;
      const diffClass = hasDiff ? `diff-${node.type}` : "";
      const nodeDiffClass = hasDiff ? ` ${diffClass}` : "";
      return `<div class="node${rootClass}${nodeDiffClass}"><div class="line"><span class="tog"></span>${keyHtml}<span class="val-${type}">${val}</span></div></div>`;
    }

    const [open, close] = getBrackets(node.isArray);
    const expanded = isExpanded(this.#proxy, currentPath);
    const children = node.children || [];
    const filtered = filterChildren(children, this.#showOnlyChanged);
    const childrenHtml = expanded
      ? filtered.map((c) => this.#renderNode(c, side, currentPath, false, placeholder)).join("")
      : "";
    const preview = `${filtered.length}`;

    if (placeholder) {
      if (!expanded) {
        return `<div class="node${rootClass}"><div class="line placeholder">${keyHtml}<span class="br"${hidden}>${open}</span><span class="preview"${hidden}>${preview}</span><span class="br"${hidden}>${close}</span></div></div>`;
      }
      return `<div class="node${rootClass}"><div class="line placeholder">${keyHtml}<span class="br"${hidden}>${open}</span></div>${childrenHtml}<div class="line placeholder"><span class="br"${hidden}>${close}</span></div></div>`;
    }

    const hasDiff = node.hasDiff && node.type !== TYPE.UNCHANGED;
    const diffClass = hasDiff ? `diff-${node.type}` : "";
    const hasChildDiff = node.hasDiff && children.some((c) => c.hasDiff);
    const dotType = node.type === TYPE.UNCHANGED ? "modified" : node.type;
    const dot = hasChildDiff ? `<span class="dot dot-${dotType}"></span>` : "";
    const nodeDiffClass = hasDiff && !hasChildDiff ? ` ${diffClass}` : "";
    const toggle = expanded ? "▼" : "▶";
    const dataPath = ` data-p="${currentPath}"`;

    if (!expanded) {
      return `<div class="node${rootClass}${nodeDiffClass}"><div class="line"${dataPath}><span class="tog">${toggle}</span>${dot}${keyHtml}<span class="br">${open}</span><span class="preview">${preview}</span><span class="br">${close}</span></div></div>`;
    }

    return `<div class="node${rootClass}${nodeDiffClass}"><div class="line"${dataPath}><span class="tog">${toggle}</span>${dot}${keyHtml}<span class="br">${open}</span></div>${childrenHtml}<div class="line"><span class="tog"></span><span class="br">${close}</span></div></div>`;
  }

  #bind() {
    const [leftPanel, rightPanel] = this.shadowRoot.querySelectorAll(".panel");
    const syncing = { value: false };

    const syncScroll = (source) => () => {
      if (syncing.value) return;
      syncing.value = true;
      const target = source === leftPanel ? rightPanel : leftPanel;
      target.scrollTop = source.scrollTop;
      target.scrollLeft = source.scrollLeft;
      syncing.value = false;
    };

    leftPanel?.addEventListener("scroll", syncScroll(leftPanel));
    rightPanel?.addEventListener("scroll", syncScroll(rightPanel));

    Array.from(this.shadowRoot.querySelectorAll("[data-p]")).forEach((el) => {
      el.onclick = () => {
        this.#proxy[el.dataset.p] = this.#proxy[el.dataset.p] === false;
      };
    });

    const filterCheckbox = this.shadowRoot.querySelector(`[data-action="filter"]`);
    if (filterCheckbox) {
      filterCheckbox.addEventListener("change", (e) => {
        this.#showOnlyChanged = e.target.checked;
        this.#render();
      });
    }

    const actions = {
      collapse: () => this.#collapseAll(),
      expand: () => this.#expandAll(),
    };

    Object.entries(actions).forEach(([action, handler]) => {
      this.shadowRoot.querySelector(`[data-action="${action}"]`)?.addEventListener("click", handler);
    });
  }
}

customElements.define("json-diff-viewer", JsonDiffViewer);
export { JsonDiffViewer };
