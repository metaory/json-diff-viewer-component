export default `
:host {
  --added: #22c55e;
  --removed: #ef4444;
  --modified: #eab308;
  --type-changed: #f97316;
  --unchanged: #71717a;
  --bg: #18181b;
  --bg-panel: #27272a;
  --border: #3f3f46;
  --text: #fafafa;
  --text-dim: #a1a1aa;
  --key: #38bdf8;
  --string: #a78bfa;
  --number: #34d399;
  --boolean: #fb923c;
  --null: #f472b6;
  --bracket: #71717a;
  --radius: 12px;
  --font: 'JetBrains Mono', 'Fira Code', monospace;
  display: block;
  font-family: var(--font);
  font-size: 13px;
  background: var(--bg);
  color: var(--text);
  border-radius: var(--radius);
  overflow: hidden;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  min-height: 400px;
}

.panel {
  overflow: auto;
  padding: 1rem;
  background: var(--bg-panel);
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.panel:first-child { border-right: 2px solid var(--border); }

.panel-header {
  position: sticky;
  top: 0;
  background: var(--bg-panel);
  padding: 0.5rem 0 1rem;
  font-weight: 600;
  color: var(--text-dim);
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
  z-index: 10;
}

.node { padding-left: 1.25rem; }
.node-root { padding-left: 0; }

.line {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.line:hover { background: rgba(255,255,255,0.05); }

.toggle {
  width: 1rem;
  flex-shrink: 0;
  color: var(--bracket);
  user-select: none;
  cursor: pointer;
}

.toggle:hover { color: var(--text); }

.key { color: var(--key); }
.colon { color: var(--text-dim); margin-right: 0.25rem; }

.value-string { color: var(--string); }
.value-string::before, .value-string::after { content: '"'; }
.value-number { color: var(--number); }
.value-boolean { color: var(--boolean); }
.value-null { color: var(--null); font-style: italic; }

.bracket { color: var(--bracket); }

.diff-added { background: rgba(34, 197, 94, 0.15); }
.diff-removed { background: rgba(239, 68, 68, 0.15); }
.diff-modified { background: rgba(234, 179, 8, 0.15); }
.diff-type_changed { background: rgba(249, 115, 22, 0.15); }

.diff-added .key { color: var(--added); }
.diff-removed .key { color: var(--removed); }
.diff-modified .key { color: var(--modified); }
.diff-type_changed .key { color: var(--type-changed); }

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.indicator-added { background: var(--added); }
.indicator-removed { background: var(--removed); }
.indicator-modified { background: var(--modified); }
.indicator-type_changed { background: var(--type-changed); }

.collapsed-preview {
  color: var(--text-dim);
  font-style: italic;
}

.stats {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg);
  border-bottom: 2px solid var(--border);
  font-size: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-added .stat-dot { background: var(--added); }
.stat-removed .stat-dot { background: var(--removed); }
.stat-modified .stat-dot { background: var(--modified); }
.stat-type_changed .stat-dot { background: var(--type-changed); }
`
