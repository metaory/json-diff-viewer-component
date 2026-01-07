# json-diff-viewer

**Compare JSON side-by-side, visually**

A zero-dependency web component for visualizing JSON differences with synchronized scrolling, collapsible nodes, and syntax highlighting. Perfect for debugging, API comparisons, and configuration diffs

## Features

- Deep nested JSON comparison
- Side-by-side synchronized scrolling
- Collapsible nodes (synced between panels)
- Diff indicators bubble up to parent nodes
- Stats summary (added/removed/modified/type-changed)
- Syntax highlighting
- Zero dependencies
- Shadow DOM encapsulation

## Install

```bash
npm i json-diff-viewer-component
```

## Usage

### ES Module

```js
import "json-diff-viewer-component";

const viewer = document.querySelector("json-diff-viewer");
viewer.setData(leftObj, rightObj);
```

### HTML Attributes

```html
<json-diff-viewer
  left='{"name":"foo"}'
  right='{"name":"bar"}'
></json-diff-viewer>
```

### Properties

```js
viewer.left = { name: "foo" };
viewer.right = { name: "bar" };
```

### Method

```js
viewer.setData(leftObj, rightObj);
```

## Diff Types

| Type         | Color  | Description                          |
| ------------ | ------ | ------------------------------------ |
| Added        | Green  | Key exists only in right             |
| Removed      | Red    | Key exists only in left              |
| Modified     | Yellow | Value changed                        |
| Type Changed | Orange | Type mismatch (e.g. number → string) |

## Styling

Override CSS custom properties:

```css
json-diff-viewer {
  /* Diff colors */
  --added: #22c55e;
  --removed: #ef4444;
  --modified: #eab308;
  --type-changed: #f97316;
  --unchanged: #71717a;

  /* Background */
  --bg: #18181b;
  --bg-panel: #27272a;
  --border: #3f3f46;

  /* Text */
  --text: #fafafa;
  --text-dim: #a1a1aa;

  /* Syntax */
  --key: #38bdf8;
  --string: #a78bfa;
  --number: #34d399;
  --boolean: #fb923c;
  --null: #f472b6;
  --bracket: #71717a;

  /* Layout */
  --radius: 12px;
  --font: "JetBrains Mono", monospace;
}
```

### Light Theme

```css
json-diff-viewer {
  --bg: #fafafa;
  --bg-panel: #ffffff;
  --border: #e4e4e7;
  --text: #18181b;
  --text-dim: #71717a;
  --key: #0284c7;
  --string: #7c3aed;
  --number: #059669;
}
```

### Sizing

```css
json-diff-viewer {
  height: 600px;
  border-radius: 16px;
}
```

## Dev

```bash
npm run dev      # start dev server
npm run build    # build for production
```

## License

[MIT](LICENSE)
