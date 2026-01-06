import { diff, TYPES } from './diff.js'
import styles from './styles.js'

const formatValue = val => {
  if (val === null) return ['null', 'null']
  if (val === undefined) return ['undefined', 'null']
  const type = typeof val
  if (type === 'string') return [val, 'string']
  if (type === 'number') return [String(val), 'number']
  if (type === 'boolean') return [String(val), 'boolean']
  return [JSON.stringify(val), 'string']
}

class JsonDiffViewer extends HTMLElement {
  #left = null
  #right = null
  #diffTree = null
  #expanded = new Proxy({}, {
    set: (t, k, v) => { t[k] = v; this.#render(); return true }
  })
  #stats = { added: 0, removed: 0, modified: 0, type_changed: 0 }

  static get observedAttributes() { return ['left', 'right'] }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() { this.#render() }

  attributeChangedCallback(name, _, val) {
    if (name === 'left') this.#left = JSON.parse(val)
    if (name === 'right') this.#right = JSON.parse(val)
    this.#compute()
  }

  set left(v) { this.#left = v; this.#compute() }
  set right(v) { this.#right = v; this.#compute() }
  get left() { return this.#left }
  get right() { return this.#right }

  setData(left, right) {
    this.#left = left
    this.#right = right
    this.#compute()
  }

  #compute() {
    if (!this.#left || !this.#right) return
    this.#diffTree = diff(this.#left, this.#right)
    this.#stats = { added: 0, removed: 0, modified: 0, type_changed: 0 }
    this.#countStats(this.#diffTree)
    this.#render()
  }

  #countStats(node) {
    if (node.type !== TYPES.UNCHANGED && this.#stats[node.type] !== undefined) this.#stats[node.type]++
    node.children?.forEach(c => this.#countStats(c))
  }

  #render() {
    if (!this.#diffTree) {
      this.shadowRoot.innerHTML = `<style>${styles}</style><div style="padding:2rem;color:var(--text-dim)">Provide left and right JSON to compare</div>`
      return
    }

    const statsHtml = `
      <div class="stats">
        <div class="stat stat-added"><span class="stat-dot"></span>${this.#stats.added} added</div>
        <div class="stat stat-removed"><span class="stat-dot"></span>${this.#stats.removed} removed</div>
        <div class="stat stat-modified"><span class="stat-dot"></span>${this.#stats.modified} modified</div>
        <div class="stat stat-type_changed"><span class="stat-dot"></span>${this.#stats.type_changed} type changed</div>
      </div>
    `

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      ${statsHtml}
      <div class="container">
        <div class="panel" data-side="left">
          <div class="panel-header">Left (Original)</div>
          ${this.#renderTree(this.#diffTree, 'left', '')}
        </div>
        <div class="panel" data-side="right">
          <div class="panel-header">Right (Modified)</div>
          ${this.#renderTree(this.#diffTree, 'right', '')}
        </div>
      </div>
    `

    this.#bindEvents()
  }

  #renderTree(node, side, path, isRoot = true) {
    const nodePath = path ? `${path}.${node.key}` : String(node.key)
    const isExpanded = this.#expanded[nodePath] !== false
    const hasChildren = node.children?.length > 0
    const isContainer = node.isArray || node.isObject

    const val = side === 'left' ? node.left : node.right
    const diffClass = node.hasDiff && node.type !== TYPES.UNCHANGED ? `diff-${node.type}` : ''
    const indicatorClass = node.hasDiff && node.children?.some(c => c.hasDiff) ? `indicator indicator-${node.type === TYPES.UNCHANGED ? 'modified' : node.type}` : ''

    if (!isContainer) {
      const [formatted, valueType] = formatValue(val)
      return `
        <div class="node ${isRoot ? 'node-root' : ''}">
          <div class="line ${diffClass}">
            <span class="toggle"></span>
            ${indicatorClass ? `<span class="${indicatorClass}"></span>` : ''}
            ${!isRoot ? `<span class="key">${node.key}</span><span class="colon">:</span>` : ''}
            <span class="value-${valueType}">${formatted}</span>
          </div>
        </div>
      `
    }

    const bracket = node.isArray ? ['[', ']'] : ['{', '}']
    const childCount = node.children?.length || 0

    if (!isExpanded) {
      return `
        <div class="node ${isRoot ? 'node-root' : ''}">
          <div class="line ${diffClass}" data-path="${nodePath}">
            <span class="toggle">▶</span>
            ${indicatorClass ? `<span class="${indicatorClass}"></span>` : ''}
            ${!isRoot ? `<span class="key">${node.key}</span><span class="colon">:</span>` : ''}
            <span class="bracket">${bracket[0]}</span>
            <span class="collapsed-preview">${childCount} items</span>
            <span class="bracket">${bracket[1]}</span>
          </div>
        </div>
      `
    }

    const childrenHtml = node.children?.map(c => this.#renderTree(c, side, nodePath, false)).join('') || ''

    return `
      <div class="node ${isRoot ? 'node-root' : ''}">
        <div class="line ${diffClass}" data-path="${nodePath}">
          <span class="toggle">▼</span>
          ${indicatorClass ? `<span class="${indicatorClass}"></span>` : ''}
          ${!isRoot ? `<span class="key">${node.key}</span><span class="colon">:</span>` : ''}
          <span class="bracket">${bracket[0]}</span>
        </div>
        ${childrenHtml}
        <div class="line">
          <span class="toggle"></span>
          <span class="bracket">${bracket[1]}</span>
        </div>
      </div>
    `
  }

  #bindEvents() {
    const panels = this.shadowRoot.querySelectorAll('.panel')
    const [leftPanel, rightPanel] = panels

    let syncing = false
    const syncScroll = source => e => {
      if (syncing) return
      syncing = true
      const target = source === leftPanel ? rightPanel : leftPanel
      target.scrollTop = e.target.scrollTop
      target.scrollLeft = e.target.scrollLeft
      syncing = false
    }

    leftPanel?.addEventListener('scroll', syncScroll(leftPanel))
    rightPanel?.addEventListener('scroll', syncScroll(rightPanel))

    this.shadowRoot.querySelectorAll('.line[data-path]').forEach(el => {
      el.addEventListener('click', () => {
        const path = el.dataset.path
        this.#expanded[path] = this.#expanded[path] === false
      })
    })
  }
}

customElements.define('json-diff-viewer', JsonDiffViewer)

export { JsonDiffViewer }
