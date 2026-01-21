import "@fontsource/bungee";
import "./lib/viewer.js";
import "./style.css";

const viewer = document.querySelector("json-diff-viewer");
const toggle = document.querySelector("#theme-toggle");

const themes = {
  dark: {
    add: "#22c55e", rem: "#ef4444", mod: "#eab308",
    bg: "#18181b", bg2: "#27272a", bdr: "#3f3f46",
    txt: "#fafafa", dim: "#a1a1aa",
    key: "#38bdf8", str: "#a78bfa", num: "#34d399", bool: "#fb923c", nul: "#f472b6", br: "#71717a"
  },
  light: {
    add: "#15803d", rem: "#b91c1c", mod: "#ca8a04",
    bg: "#ffffff", bg2: "#f9fafb", bdr: "#d1d5db",
    txt: "#030712", dim: "#4b5563",
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

Promise.all([
  fetch(`${import.meta.env.BASE_URL}data/a1.json`).then((r) => r.json()),
  fetch(`${import.meta.env.BASE_URL}data/a2.json`).then((r) => r.json()),
]).then(([left, right]) => viewer.setData(left, right));
