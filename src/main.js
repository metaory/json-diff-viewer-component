import "@fontsource/bungee";
import "./lib/viewer.js";
import "./style.css";

const viewer = document.querySelector("json-diff-viewer");

Promise.all([
  fetch("/data/a1.json").then((r) => r.json()),
  fetch("/data/a2.json").then((r) => r.json()),
]).then(([left, right]) => viewer.setData(left, right));
