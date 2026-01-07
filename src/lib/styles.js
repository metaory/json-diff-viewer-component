export default `
:host {
  --add: #22c55e; --rem: #ef4444; --mod: #eab308; --typ: #f97316;
  --bg: #18181b; --bg2: #27272a; --bdr: #3f3f46;
  --txt: #fafafa; --dim: #a1a1aa;
  --key: #38bdf8; --str: #a78bfa; --num: #34d399; --bool: #fb923c; --nul: #f472b6; --br: #71717a;
  display: flex; flex-direction: column; font: 13px 'JetBrains Mono', 'Fira Code', monospace;
  background: var(--bg); color: var(--txt); border-radius: 12px; overflow: hidden;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
.container { display: grid; grid-template-columns: 1fr 1fr; flex: 1; min-height: 0; }
.panel { overflow: auto; padding: 1rem; background: var(--bg2); scrollbar-width: thin; scrollbar-color: var(--bdr) transparent; }
.panel:first-child { border-right: 2px solid var(--bdr); }
.header { padding: 0.25rem 0 0.5rem; font-weight: 600; color: var(--dim); border-bottom: 1px solid var(--bdr); margin-bottom: 0.5rem; font-size: 11px; }
.node { padding-left: 1.25rem; }
.node.root { padding-left: 0; }
.line { display: flex; align-items: flex-start; gap: 0.5rem; padding: 2px 4px; border-radius: 4px; cursor: pointer; transition: background .15s; }
.line:hover { background: rgba(255,255,255,.05); }
.tog { width: 1rem; flex-shrink: 0; color: var(--br); user-select: none; }
.tog:hover { color: var(--txt); }
.key { color: var(--key); }
.colon { color: var(--dim); margin-right: 0.25rem; }
.val-string { color: var(--str); }
.val-string::before, .val-string::after { content: '"'; }
.val-number { color: var(--num); }
.val-boolean { color: var(--bool); }
.val-null { color: var(--nul); font-style: italic; }
.br { color: var(--br); }
.diff-added { background: rgba(34,197,94,.15); }
.diff-removed { background: rgba(239,68,68,.15); }
.diff-modified { background: rgba(234,179,8,.15); }
.diff-type_changed { background: rgba(249,115,22,.15); }
.diff-added .key { color: var(--add); }
.diff-removed .key { color: var(--rem); }
.diff-modified .key { color: var(--mod); }
.diff-type_changed .key { color: var(--typ); }
.dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
.dot-added { background: var(--add); }
.dot-removed { background: var(--rem); }
.dot-modified { background: var(--mod); }
.dot-type_changed { background: var(--typ); }
.preview { color: var(--dim); font-style: italic; }
.preview::before { content: ' '; }
.preview::after { content: ' items'; }
.stats { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: .75rem 1rem; background: var(--bg); border-bottom: 2px solid var(--bdr); font-size: 12px; }
.stats-buttons { display: flex; gap: 0.5rem; }
.btn-collapse, .btn-expand { padding: 0.35rem 0.75rem; background: var(--bg2); border: 1px solid var(--bdr); border-radius: 6px; color: var(--txt); font-size: 11px; font-family: inherit; cursor: pointer; transition: background .15s, border-color .15s; }
.btn-collapse:hover, .btn-expand:hover { background: rgba(255,255,255,.05); border-color: var(--dim); }
.stat { display: grid; grid-template-columns: auto 1fr; align-items: baseline; gap: .35rem; }
.stat .dot { width: 8px; height: 8px; }
.stat-added .dot { background: var(--add); }
.stat-removed .dot { background: var(--rem); }
.stat-modified .dot { background: var(--mod); }
.stat-type_changed .dot { background: var(--typ); }
.empty { padding: 2rem; color: var(--dim); }
`
