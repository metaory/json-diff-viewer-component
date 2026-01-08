import "@fontsource/bungee";
import "./lib/viewer.js";
import "./style.css";

const viewer = document.querySelector("json-diff-viewer");
const toggle = document.querySelector("#theme-toggle");

const themes = {
  dark: {
    add: "#22c55e", rem: "#ef4444", mod: "#eab308", typ: "#f97316",
    bg: "#18181b", bg2: "#27272a", bdr: "#3f3f46",
    txt: "#fafafa", dim: "#a1a1aa",
    key: "#38bdf8", str: "#a78bfa", num: "#34d399", bool: "#fb923c", nul: "#f472b6", br: "#71717a"
  },
  light: {
    add: "#16a34a", rem: "#dc2626", mod: "#ca8a04", typ: "#ea580c",
    bg: "#fafafa", bg2: "#ffffff", bdr: "#e4e4e7",
    txt: "#18181b", dim: "#71717a",
    key: "#0284c7", str: "#7c3aed", num: "#059669", bool: "#d97706", nul: "#c026d3", br: "#71717a"
  }
}

const applyTheme = (theme) => {
  const tokens = themes[theme];
  for (const [key, value] of Object.entries(tokens)) {
    viewer.style.setProperty(`--${key}`, value);
  }
  toggle.textContent = theme === "dark" ? "Dark" : "Light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("json-diff-viewer-theme", theme);
};

const getTheme = () => localStorage.getItem("json-diff-viewer-theme") || "dark"
applyTheme(getTheme())

toggle.addEventListener("click", () => {
  const current = getTheme()
  const next = current === "dark" ? "light" : "dark"
  applyTheme(next)
})

Promise.all([
  fetch(`${import.meta.env.BASE_URL}data/a1.json`).then((r) => r.json()),
  fetch(`${import.meta.env.BASE_URL}data/a2.json`).then((r) => r.json()),
]).then(([left, right]) => viewer.setData(left, right));
