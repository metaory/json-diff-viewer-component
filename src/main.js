import "@fontsource/bungee";
import "./lib/viewer.js";
import "./style.css";

const viewer = document.querySelector("json-diff-viewer");
const toggle = document.querySelector("#theme-toggle");
const loadToggle = document.querySelector("#load-toggle");
const panel = document.querySelector("#input-panel");
const tabs = document.querySelectorAll(".tab");
const compareBtn = document.querySelector("#compare-btn");

const themes = {
  dark: {
    add: "#22c55e", rem: "#ef4444", mod: "#eab308",
    bg: "#18181b", bg2: "#27272a", bdr: "#3f3f46",
    txt: "#fafafa", dim: "#a1a1aa", slider: "#3f3f46",
    key: "#38bdf8", str: "#a78bfa", num: "#34d399", bool: "#fb923c", nul: "#f472b6", br: "#71717a"
  },
  light: {
    add: "#15803d", rem: "#b91c1c", mod: "#ca8a04",
    bg: "#ffffff", bg2: "#f9fafb", bdr: "#d1d5db",
    txt: "#030712", dim: "#4b5563", slider: "#d1d5db",
    key: "#075985", str: "#6d28d9", num: "#047857", bool: "#b45309", nul: "#a21caf", br: "#6b7280"
  }
}

const themeLabels = { dark: "Light", light: "Dark" };

const applyTheme = (theme) => {
  Object.entries(themes[theme]).forEach(([key, value]) => {
    viewer.style.setProperty(`--${key}`, value);
  });
  toggle.textContent = themeLabels[theme];
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("json-diff-viewer-theme", theme);
};

const getTheme = () => localStorage.getItem("json-diff-viewer-theme") || "dark";

const toggleTheme = (current) => current === "dark" ? "light" : "dark";

applyTheme(getTheme());

toggle.addEventListener("click", () => {
  applyTheme(toggleTheme(getTheme()));
});

const uncheckFilter = () => {
  const checkbox = viewer.shadowRoot?.querySelector('[data-action="filter"]');
  if (!checkbox?.checked) return;
  checkbox.checked = false;
  checkbox.dispatchEvent(new Event("change"));
};

Promise.all([
  fetch(`${import.meta.env.BASE_URL}data/a1.json`).then((r) => r.json()),
  fetch(`${import.meta.env.BASE_URL}data/a2.json`).then((r) => r.json()),
]).then(([left, right]) => {
  viewer.setData(left, right);
  uncheckFilter();
});

loadToggle.addEventListener("click", () => {
  panel.classList.toggle("collapsed");
  loadToggle.classList.toggle("active", !panel.classList.contains("collapsed"));
});

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    for (const t of tabs) t.classList.remove("active");
    tab.classList.add("active");
    panel.dataset.mode = tab.dataset.mode;
  });
}

for (const btn of panel.querySelectorAll(".file-btn")) {
  const input = panel.querySelector(`input[type="file"][data-side="${btn.dataset.side}"]`);
  btn.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    const name = input.files[0]?.name;
    btn.textContent = name || "Choose file...";
    btn.classList.toggle("has-file", !!name);
  });
}

const readFile = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(JSON.parse(e.target.result));
    reader.readAsText(file);
  });

const getInput = (side, mode) => {
  const types = { file: 'input[type="file"]', paste: "textarea", url: 'input[type="url"]' };
  return panel.querySelector(`${types[mode]}[data-side="${side}"]`);
};

const loaders = {
  file: () => {
    const left = getInput("left", "file").files[0];
    const right = getInput("right", "file").files[0];
    if (!left || !right) return;
    return Promise.all([readFile(left), readFile(right)]);
  },
  paste: () => {
    const left = getInput("left", "paste").value;
    const right = getInput("right", "paste").value;
    if (!left || !right) return;
    return Promise.resolve([JSON.parse(left), JSON.parse(right)]);
  },
  url: () => {
    const left = getInput("left", "url").value;
    const right = getInput("right", "url").value;
    if (!left || !right) return;
    return Promise.all([
      fetch(left).then((r) => r.json()),
      fetch(right).then((r) => r.json()),
    ]);
  },
};

compareBtn.addEventListener("click", async () => {
  const result = await loaders[panel.dataset.mode]?.();
  if (!result) return;
  viewer.setData(result[0], result[1]);
  panel.classList.add("collapsed");
  loadToggle.classList.remove("active");
});
