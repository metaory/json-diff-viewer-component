<div align="center">
    <img src="https://raw.githubusercontent.com/metaory/json-diff-viewer-component/master/public/logo.png" alt="logo" height="128" />
    <h2>json-diff-viewer</h2>
    <h5>
        Compare JSON side-by-side, visually
    </h5>
    <p>
        A zero-dependency web component for visualizing JSON differences
        <br>
        with synchronized scrolling, collapsible nodes, and syntax highlighting
    </p>
    <h5>
        <a href="https://metaory.github.io/json-diff-viewer-component/" target="_blank">metaory.github.io/json-diff-viewer-component</a>
    </h5>
    <img src="https://raw.githubusercontent.com/metaory/json-diff-viewer-component/master/public/screenshot.jpg" alt="demo" width="80%" />
    <img src="https://raw.githubusercontent.com/metaory/json-diff-viewer-component/master/public/screenshot-light.jpg" alt="demo-light" width="80%" />
</div>

## Features

- Nested JSON comparison
- Side-by-side synchronized scrolling
- Collapsible nodes (synced between panels)
- Diff indicators roll up to parent nodes
- Stats summary (added/removed/modified)
- Show only changed filter toggle
- Syntax highlighting
- Zero dependencies
- Shadow DOM encapsulation

## Install

```bash
npm i json-diff-viewer-component
```

## Usage

Every integration needs three things:

1. Import the package once to register the custom element.
2. Add `<json-diff-viewer>` to the page.
3. Provide both values using one of the data APIs below.

Import the package:

```js
import "json-diff-viewer-component";
```

```html
<json-diff-viewer></json-diff-viewer>
```

Choose one data API. Root values must be non-null.

### `setData(left, right)` (Recommended)

Use for dynamic data. Both values update in one render:

```js
const viewer = document.querySelector("json-diff-viewer");
viewer.setData(
  { name: "foo", enabled: true },
  { name: "bar", enabled: true },
);
```

### Properties (Alternative)

Use when assigning JavaScript values independently. Rendering starts once both sides are set:

```js
viewer.left = { name: "foo" };
viewer.right = { name: "bar" };

console.log(viewer.left, viewer.right);
```

### HTML Attributes (Alternative)

Use only for small, static, inline JSON. Each value is parsed with `JSON.parse()`, so invalid JSON throws:

```html
<json-diff-viewer
  left='{"name":"foo"}'
  right='{"name":"bar"}'
></json-diff-viewer>
```

Prefer `setData()` or properties for objects already available in JavaScript.

### Class Export

The registered class is exported only when a class reference is needed for testing or extension:

```js
import { JsonDiffViewer } from "json-diff-viewer-component";
```

### Built-in Controls

No setup is required. The component toolbar includes:

- **Show only changed**: filter toggle (default: **on**); hides unchanged nodes
- **Collapse all** / **Expand all**: bulk expand/collapse
- **Node toggles**: click any object/array line to expand/collapse (synced across both panels)

### Framework Usage

The component remains the same custom element and uses `setData()` for reactive values.

<details>
<summary>React and Vue examples</summary>

#### React

```jsx
import { useEffect, useRef } from "react";
import "json-diff-viewer-component";

function DiffViewer({ left, right }) {
  const viewerRef = useRef(null);

  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.setData(left, right);
    }
  }, [left, right]);

  return <json-diff-viewer ref={viewerRef} />;
}
```

#### Vue

```vue
<template>
  <json-diff-viewer ref="viewerRef" />
</template>

<script setup>
import { ref, watchEffect } from "vue";
import "json-diff-viewer-component";

const props = defineProps(["left", "right"]);
const viewerRef = ref(null);

watchEffect(() => {
  viewerRef.value?.setData(props.left, props.right);
});
</script>
```

</details>

## Diff Types

| Type | Default | Description |
| --- | --- | --- |
| Added | Green | Key exists only on the right |
| Removed | Red | Key exists only on the left |
| Modified | Yellow | Values differ, or a container has changed descendants |

## Styling

The component is fully usable without style configuration. Override CSS custom properties on `json-diff-viewer`. They inherit through the host into its shadow DOM. State foreground tokens also drive their derived backgrounds unless those backgrounds are overridden separately.

### Design Tokens

Tokens inherit through the host. Override only the values your theme needs.

```css
json-diff-viewer {
  /* Diff colors */
  --add: #22c55e; /* Added items */
  --rem: #ef4444; /* Removed items */
  --mod: #eab308; /* Modified items */

  /* Backgrounds */
  --bg: #18181b; /* Main background */
  --bg2: #27272a; /* Panel background */

  /* Borders */
  --bdr: #3f3f46; /* Border color */

  /* Text */
  --txt: #fafafa; /* Primary text */
  --dim: #a1a1aa; /* Dimmed/secondary text */

  /* State backgrounds */
  --add-bg: color-mix(in srgb, var(--add) 15%, transparent);
  --rem-bg: color-mix(in srgb, var(--rem) 15%, transparent);
  --mod-bg: color-mix(in srgb, var(--mod) 15%, transparent);

  /* Controls and interaction */
  --hover: rgb(0 0 0 / 3%); /* Diff row hover */
  --control-bg: var(--bg2); /* Action button background */
  --control-hover: rgb(0 0 0 / 5%); /* Action button hover */
  --control-bdr: var(--bdr); /* Action button border */
  --slider: var(--bdr); /* Slider active track */
  --slider-thumb: var(--br); /* Slider thumb */

  /* Syntax highlighting */
  --key: #38bdf8; /* Object keys */
  --str: #a78bfa; /* String values */
  --num: #34d399; /* Number values */
  --bool: #fb923c; /* Boolean values */
  --nul: #f472b6; /* Null values */
  --br: #71717a; /* Brackets and braces */
}
```

Create your own theme by overriding these tokens. For example, a light theme:

```css
json-diff-viewer {
  --add: #15803d;
  --rem: #b91c1c;
  --mod: #ca8a04;
  --bg: #f4f4f4;
  --bg2: #f9fafb;
  --bdr: #d1d5db;
  --txt: #030712;
  --dim: #4b5563;
  --slider: #d1d5db;
  --key: #075985;
  --str: #6d28d9;
  --num: #047857;
  --bool: #b45309;
  --nul: #a21caf;
  --br: #6b7280;
}
```

### Shadow Parts

Use `::part()` for structural overrides that are not shared design tokens:

| Parts | Elements |
| --- | --- |
| `toolbar`, `legend`, `legend-item`, `legend-added`, `legend-removed`, `legend-modified` | Summary and state legend |
| `actions`, `filter`, `filter-track`, `action-button`, `collapse-button`, `expand-button` | Viewer controls |
| `content`, `panel`, `panel-left`, `panel-right` | Diff layout and panels |
| `node`, `node-added`, `node-removed`, `node-modified`, `line` | Diff nodes and rows |
| `toggle`, `marker`, `marker-added`, `marker-removed`, `marker-modified` | Node controls and state markers |
| `key`, `separator`, `value`, `value-string`, `value-number`, `value-boolean`, `value-null` | JSON content |
| `bracket`, `preview`, `empty` | Supporting content and empty state |

Elements can expose multiple parts, so generic and specific selectors compose:

```css
json-diff-viewer {
  --add: lime;
  --add-bg: color-mix(in srgb, lime 20%, transparent);
}

json-diff-viewer::part(toolbar) {
  border-block-end-width: 4px;
}

json-diff-viewer::part(node-added) {
  border-inline-start: 3px solid var(--add);
}

json-diff-viewer::part(collapse-button) {
  border-radius: 999px;
}
```

Parts are the supported structural API. Internal classes and other shadow elements remain private. `::part()` cannot select descendants, so target each listed part directly. Changing layout, padding, or typography on `node` and `line` can desynchronize corresponding rows between panels.

### Sizing

Set a height to get scrolling. Without one, the viewer grows to fit all content. Default border-radius is `12px`.

```css
json-diff-viewer {
  height: 600px;
  border-radius: 16px;
}
```

For full-height layouts, use flexbox:

```css
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

json-diff-viewer {
  flex: 1;
  min-height: 0;
}
```

## Dev

```bash
npm run dev      # start dev server
npm run build    # build for production
npm run preview  # preview the production build
```

## License

[MIT](LICENSE)
