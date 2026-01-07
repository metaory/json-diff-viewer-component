import { diff, TYPE } from './diff.js'
import styles from './styles.js'

const STAT_TYPES = ['added', 'removed', 'modified', 'type_changed']

const format = val => ({
  null: ['null', 'null'],
  undefined: ['undefined', 'null'],
  string: [val, 'string'],
  number: [String(val), 'number'],
  boolean: [String(val), 'boolean']
})[val === null ? 'null' : typeof val] || [JSON.stringify(val), 'string']

class JsonDiffViewer extends HTMLElement {
  #left = null
  #right = null
  #tree = null
  #exp = {}
  #proxy = new Proxy(this.#exp, { set: (t, k, v) => (t[k] = v, this.#render(), true) })
  #stats = {}

  static observedAttributes = ['left', 'right']
  constructor() { super(); this.attachShadow({ mode: 'open' }) }
  connectedCallback() { this.#render() }
  attributeChangedCallback(n, _, v) { n === 'left' ? this.#left = JSON.parse(v) : this.#right = JSON.parse(v); this.#compute() }
  set left(v) { this.#left = v; this.#compute() }
  set right(v) { this.#right = v; this.#compute() }
  get left() { return this.#left }
  get right() { return this.#right }
  setData(l, r) { this.#left = l; this.#right = r; this.#compute() }

  #compute() {
    if (!this.#left || !this.#right) return
    this.#tree = diff(this.#left, this.#right)
    this.#stats = Object.fromEntries(STAT_TYPES.map(t => [t, 0]))
    this.#walk(this.#tree, n => n.type !== TYPE.UNCHANGED && this.#stats[n.type]++)
    for (const k in this.#exp) delete this.#exp[k]
    this.#walk(this.#tree, (n, p) => (n.isArray || n.isObject) && !n.hasDiff && (this.#exp[p] = false))
    this.#render()
  }

  #walk(node, fn, path = '') {
    const p = path ? `${path}.${node.key}` : String(node.key)
    fn(node, p)
    for (const c of node.children || []) this.#walk(c, fn, p)
  }

  #collapseAll() {
    if (!this.#tree) return
    this.#walk(this.#tree, (n, p) => (n.isArray || n.isObject) && (this.#exp[p] = false))
    this.#render()
  }

  #expandAll() {
    for (const k in this.#exp) delete this.#exp[k]
    this.#render()
  }

  #render() {
    if (!this.#tree) return (this.shadowRoot.innerHTML = `<style>${styles}</style><div class="empty">Provide left and right JSON</div>`)
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="stats">
        ${STAT_TYPES.map(t => `<div class="stat stat-${t}"><span class="dot"></span>${this.#stats[t]} ${t.replace('_', ' ')}</div>`).join('')}
        <div class="stats-buttons">
          <button class="btn-collapse" data-action="collapse">Collapse All</button>
          <button class="btn-expand" data-action="expand">Expand All</button>
        </div>
      </div>
      <div class="container">
        ${['left', 'right'].map(s => `<div class="panel" data-side="${s}"><div class="header">${s === 'left' ? 'Original' : 'Modified'}</div>${this.#node(this.#tree, s, '')}</div>`).join('')}
      </div>`
    this.#bind()
  }

  #node(n, side, path, root = true) {
    const p = path ? `${path}.${n.key}` : String(n.key)
    const val = n[side]
    const cls = n.hasDiff && n.type !== TYPE.UNCHANGED ? `diff-${n.type}` : ''
    const dot = n.hasDiff && n.children?.some(c => c.hasDiff) ? `<span class="dot dot-${n.type === TYPE.UNCHANGED ? 'modified' : n.type}"></span>` : ''
    const key = root ? '' : `<span class="key">${n.key}</span><span class="colon">:</span>`

    if (!n.isArray && !n.isObject) {
      const [v, t] = format(val)
      return `<div class="node${root ? ' root' : ''}"><div class="line ${cls}"><span class="tog"></span>${dot}${key}<span class="val-${t}">${v}</span></div></div>`
    }

    const [open, close] = n.isArray ? ['[', ']'] : ['{', '}']
    const exp = this.#proxy[p] !== false

    if (!exp) return `<div class="node${root ? ' root' : ''}"><div class="line ${cls}" data-p="${p}"><span class="tog">▶</span>${dot}${key}<span class="br">${open}</span><span class="preview">${n.children?.length || 0}</span><span class="br">${close}</span></div></div>`

    return `<div class="node${root ? ' root' : ''}"><div class="line ${cls}" data-p="${p}"><span class="tog">▼</span>${dot}${key}<span class="br">${open}</span></div>${n.children?.map(c => this.#node(c, side, p, false)).join('') || ''}<div class="line"><span class="tog"></span><span class="br">${close}</span></div></div>`
  }

  #bind() {
    const [l, r] = this.shadowRoot.querySelectorAll('.panel')
    let sync = false
    const scroll = src => e => { if (sync) return; sync = true; const t = src === l ? r : l; t.scrollTop = src.scrollTop; t.scrollLeft = src.scrollLeft; sync = false }
    l?.addEventListener('scroll', scroll(l))
    r?.addEventListener('scroll', scroll(r))
    for (const el of this.shadowRoot.querySelectorAll('[data-p]')) el.onclick = () => (this.#proxy[el.dataset.p] = this.#proxy[el.dataset.p] === false)
    this.shadowRoot.querySelector('[data-action="collapse"]')?.addEventListener('click', () => this.#collapseAll())
    this.shadowRoot.querySelector('[data-action="expand"]')?.addEventListener('click', () => this.#expandAll())
  }
}

customElements.define('json-diff-viewer', JsonDiffViewer)
export { JsonDiffViewer }
