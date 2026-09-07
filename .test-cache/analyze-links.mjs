
import fs from "node:fs";
import path from "node:path";

const cacheDir = path.join(process.cwd(), ".test-cache");
const baseSite = "https://hongminzhao80-eng.github.io/ai-content-workbench-site/";

const pageMap = [
  ["index.html", ""], ["product.html", "product/"],
  ["solutions__healthcare.html", "solutions/healthcare/"],
  ["solutions__education.html", "solutions/education/"],
  ["solutions__government.html", "solutions/government/"],
  ["solutions__enterprise.html", "solutions/enterprise/"],
  ["cases.html", "cases/"],
  ["cases__hospital-health-kepu-workflow.html", "cases/hospital-health-kepu-workflow/"],
  ["cases__education-admission-season.html", "cases/education-admission-season/"],
  ["cases__government-community-service.html", "cases/government-community-service/"],
  ["cases__chain-stores-brand-consistency.html", "cases/chain-stores-brand-consistency/"],
  ["trial.html", "trial/"], ["demo.html", "demo/"], ["partners.html", "partners/"],
  ["insights.html", "insights/"],
  ["insights__wechat-layout-quickstart.html", "insights/wechat-layout-quickstart/"],
  ["insights__poster-to-leaflet-one-topic.html", "insights/poster-to-leaflet-one-topic/"],
  ["insights__hospital-health-science-flow.html", "insights/hospital-health-science-flow/"],
  ["insights__school-admission-content-checklist.html", "insights/school-admission-content-checklist/"],
  ["insights__topic-to-title-methods.html", "insights/topic-to-title-methods/"],
  ["insights__build-your-own-asset-library.html", "insights/build-your-own-asset-library/"],
  ["insights__website-content-center-usage-guide.html", "insights/website-content-center-usage-guide/"],
  ["about.html", "about/"], ["privacy.html", "privacy/"], ["terms.html", "terms/"],
  ["404.html", "404.html"]
];

const knownPaths = new Set(pageMap.map(([, p]) => baseSite + p));
const internalTargets = new Map();
const externalLinks = new Set();
const specialLinks = new Set();

for (const [file, pagePath] of pageMap) {
  const html = fs.readFileSync(path.join(cacheDir, file), "utf8");
  const pageUrl = baseSite + pagePath;
  const refs = [];
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) refs.push(m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of m[1].split(",")) {
      const u = part.trim().split(/\s+/)[0];
      if (u) refs.push(u);
    }
  }
  for (const raw of refs) {
    if (!raw || raw.startsWith("data:")) continue;
    if (raw.startsWith("#") || raw.startsWith("javascript:")) { specialLinks.add(raw); continue; }
    if (raw.startsWith("mailto:") || raw.startsWith("tel:")) { specialLinks.add(raw); continue; }
    let abs;
    try { abs = new URL(raw, pageUrl); } catch { continue; }
    const normalized = abs.origin + abs.pathname;
    if (abs.origin === "https://hongminzhao80-eng.github.io") {
      if (!internalTargets.has(normalized)) internalTargets.set(normalized, new Set());
      internalTargets.get(normalized).add(pageUrl.replace(baseSite, ""));
    } else {
      externalLinks.add(abs.origin + abs.pathname);
    }
  }
}

const unknown = [];
for (const url of internalTargets.keys()) {
  if (!knownPaths.has(url)) unknown.push(url);
}
console.log("=== Internal unique targets:", internalTargets.size, "===");
console.log("=== UNKNOWN (potential dead):", unknown.length, "===");
unknown.forEach(u => console.log("  " + u + "  <- from " + [...internalTargets.get(u)].join(", ")));
console.log("\n=== External links ===");
[...externalLinks].forEach(u => console.log("  " + u));
console.log("\n=== Special (anchor/mailto/tel) ===");
[...specialLinks].forEach(u => console.log("  " + u));
