
import fs from "node:fs";
import path from "node:path";

const cacheDir = path.join(process.cwd(), ".test-cache");
const files = fs.readdirSync(cacheDir).filter(f => f.endsWith(".html"));

const forbidden = ["订阅自动续费","自动续费","年费订阅","在线订阅","年费套餐","提升疗效","疗效提升","治愈率","治愈","降低误诊","诊断建议","治疗建议","诊疗建议","医疗广告生成","0成本","零成本","永不宕机","100%一键发布","一键自动发布","全自动成片","效率提升90","成本降低80","效率提升95"];
const review = ["仅供参考","保证100","包治","官方认证疗效"];
const placeholders = ["待确认","example.com","00000000","【","】","占位"];

let issues = [];
let report = [];

for (const f of files) {
  const html = fs.readFileSync(path.join(cacheDir, f), "utf8");
  const page = f;
  
  // --- SEO structure ---
  const titleM = html.match(/<title>([^<]*)<\/title>/);
  const descM = html.match(/<meta name="description" content="([^"]*)"/);
  const canonM = html.match(/<link rel="canonical" href="([^"]*)"/);
  const h1s = (html.match(/<h1[^>]*>/g) || []).length;
  const viewport = html.includes('name="viewport"');
  const jsonLd = (html.match(/<script type="application\/ld\+json">/g) || []).length;
  const langOk = html.includes('<html lang="zh-CN"') || html.includes('<html lang="zh-cn"');
  const noScript = html.includes("<noscript>");
  
  if (!titleM || !titleM[1].trim()) issues.push(page + ": MISSING <title>");
  if (!descM) issues.push(page + ": MISSING meta description");
  if (!canonM) issues.push(page + ": MISSING canonical");
  if (h1s !== 1) issues.push(page + ": h1 count = " + h1s);
  if (!viewport) issues.push(page + ": missing viewport meta (mobile)");
  if (!langOk) issues.push(page + ": missing lang=zh-CN");
  report.push({ p: page, t: titleM ? titleM[1] : "-", h1: h1s, ld: jsonLd, canon: canonM ? canonM[1].replace("https://www.example.com","") : "-" });
  
  // --- compliance scan ---
  for (const w of forbidden) {
    if (html.includes(w)) issues.push(page + ": FORBIDDEN WORD "" + w + """);
  }
  for (const w of review) {
    if (html.includes(w)) issues.push(page + ": REVIEW WORD "" + w + "" (needs human check)");
  }
  // --- mojibake ---
  if (html.includes("\uFFFD") || html.includes("ï¿½")) issues.push(page + ": MOJIBAKE detected");
  
  // --- placeholder audit ---
  const ph = placeholders.filter(w => html.includes(w));
  if (ph.length) issues.push(page + ": PLACEHOLDERS present -> " + [...new Set(ph)].join(","));
}

console.log("=== Per-page SEO summary ===");
for (const r of report) {
  console.log("  " + r.p.padEnd(52) + " h1=" + r.h1 + " jsonLd=" + r.ld + " canon=" + r.canon);
}
console.log("");
console.log("=== ISSUES / NOTES (" + issues.length + ") ===");
issues.forEach(i => console.log("  [i] " + i));
