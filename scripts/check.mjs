// ============================================================================
// 质量自检脚本：SEO 字段、唯一 H1、内链可达、禁止词扫描、合规要求、sitemap/robots
// 用法：node scripts/check.mjs  （先执行 node scripts/build.mjs）
// 命中任意失败项将以退出码 1 结束。
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../site.config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const errors = [];
const warns = [];
const logErr = (msg) => errors.push(msg);
const logWarn = (msg) => warns.push(msg);

if (!fs.existsSync(dist)) {
  console.error("未找到 dist/，请先执行：node scripts/build.mjs");
  process.exit(1);
}

// 收集 html 文件（相对 dist）
const htmlFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith(".html")) htmlFiles.push(path.relative(dist, full).split(path.sep).join("/"));
  }
})(dist);

const exists = (rel) => {
  const p = path.join(dist, rel);
  return fs.existsSync(p) && fs.statSync(p).isFile();
};

// URL（站点路径）→ dist 相对文件
function urlToFile(url) {
  const clean = url.split("?")[0].split("#")[0].replace(/^\/|\/$/g, "");
  if (!clean) return "index.html";
  if (clean.endsWith(".html")) return clean;
  return clean + "/index.html";
}

const titles = new Map();
const descs = new Map();

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(dist, file), "utf8");
  const tm = html.match(/<title>([\s\S]*?)<\/title>/);
  const dm = html.match(/<meta name="description" content="([^"]*)"/);
  const cm = html.match(/<link rel="canonical" href="([^"]+)"/);
  const rm = html.match(/<meta name="robots" content="([^"]*)"/);
  const h1s = [...html.matchAll(/<h1\b[\s\S]*?<\/h1>/g)];
  const title = tm ? tm[1].trim() : "";
  const desc = dm ? dm[1].trim() : "";

  if (!title) logErr(file + "：缺少 <title>");
  if (!desc) logErr(file + "：缺少 meta description");
  if (title.length > 70) logWarn(file + "：title 长度 " + title.length + " 建议 ≤70（" + title.slice(0, 30) + "…）");
  if (!desc) ; else if (desc.length > 160) logWarn(file + "：description 长度 " + desc.length + " 建议 ≤160");
  if (h1s.length !== 1) logErr(file + "：H1 数量 = " + h1s.length + "（要求恰好 1 个）");
  if (!cm) logErr(file + "：缺少 canonical");
  else if (cm[1].indexOf(site.domain) !== 0 && cm[1].indexOf("example.com") < 0 && cm[1] !== site.domain + file.replace(/\/index\.html$/, "/").replace("index.html", "/")) {
    logWarn(file + "：canonical 未以配置域开头：" + cm[1]);
  }
  if (title) {
    const key = title.replace(/\s+/g, " ");
    if (titles.has(key)) logErr("title 与其他页面重复：" + title);
    titles.set(key, file);
  }
  if (desc && descs.has(desc)) logErr("description 与其他页面重复：" + file);
  if (desc) descs.set(desc, file);

  // 禁止词（合规披露容器先行剥离；正文采用否定语境豁免，避免误伤必需免责句）
  const noContainers = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<(?:aside|div|p|span|section)\b[^>]*class="[^"]*(?:compliance|medical-banner|mock-note|faq-answer)[^"]*"[^>]*>[\s\S]*?<\/(?:aside|div|p|span|section)>/g, " ");
  const text = noContainers.replace(/<[^>]+>/g, " ");
  const NEG = /(不构成|并非|不是|不含|不得|禁止|勿|请勿|不代表|不提供|暂不|避免|无法核验|不建议|不作为|不等于|不可用)/;
  for (const phrase of site.compliance.forbidden) {
    let idx = text.indexOf(phrase);
    while (idx !== -1) {
      const before = text.slice(Math.max(0, idx - 20), idx);
      if (NEG.test(before)) { idx = text.indexOf(phrase, idx + 1); continue; }
      logErr(file + "：命中禁止词「" + phrase + "」——请改写（需求 §3.4/§16.4）");
      break;
    }
  }
  for (const phrase of site.compliance.review) {
    if (text.includes(phrase)) logWarn(file + "：命中需人工确认词「" + phrase + "」");
  }

    // 内部信息泄露特征扫描（需求 §16.1：源码/网页不得包含真实私钥、内部后台地址、内部路径）
  const leakPatterns = [
    { re: /-----BEGIN[\s\S]{0,120}PRIVATE KEY/i, label: "私钥内容特征" },
    { re: /(sk-live|sk-proj)-[A-Za-z0-9_-]{10,}/g, label: "疑似密钥串" },
    { re: /AKIA[0-9A-Z]{16}/g, label: "疑似云密钥" },
    { re: /\b(10|172\.(1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b/g, label: "内网 IP" }
  ];
  for (const lp of leakPatterns) {
    if (lp.re.test(text)) logErr(file + "：疑似内部敏感信息（" + lp.label + "）——需求 §16.1");
  }

  // 内链可达
  const linkRe = /<(?:a|link|script|img)\b[^>]*?(?:href|src)="([^"]+)"/g;
  let m;
  const seen = new Set();
  while ((m = linkRe.exec(html)) !== null) {
    let href = m[1];
    if (!href || href.startsWith("http") || href.startsWith("//") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:") || href.startsWith("data:") || href.startsWith("#")) continue;
    href = href.split("#")[0].split("?")[0];
    if (!href || seen.has(href)) continue;
    seen.add(href);
    // 相对链接基于当前 html 所在目录解析
    const baseDir = path.posix.dirname(file);
    const absRaw = path.posix.normalize(path.posix.join(baseDir === "." ? "" : baseDir, href)).replace(/^\//, "");
    const abs = absRaw.replace(/\/$/, ""); // 统一去掉尾部斜杠再校验
    const candidates = [];
    if (abs === "") candidates.push("index.html");
    else {
      candidates.push(abs);
      const isFile = /^[^/]+\.[A-Za-z0-9]+$/.test(abs.split("/").pop() || "");
      if (!isFile && !abs.endsWith(".html")) candidates.push(abs + "/index.html");
    }
    const okFile = candidates.some((c) => exists(c));
    if (!okFile) logErr(file + "：内链失效 → " + m[1] + "（解析为 " + abs + "）");

  }

  // 图片可访问性（img 必须带非空 alt；真实素材截图/海报同样要求）
  const imgTags = [...html.matchAll(/<img\b[^>]*>/g)];
  for (const im of imgTags) {
    const tag = im[0];
    if (!/alt=/.test(tag)) logErr(file + "：存在缺少 alt 属性的 <img>（可访问性要求）");
    else if (/alt=""/.test(tag)) logWarn(file + "：img alt 为空字符串");
  }
}


// 医疗合规（需求 §7.1 / 设计 §11.2）：医疗方案页与医院场景案例必须含固定边界文案
const medicalPages = htmlFiles.filter(
  (f) => f === "solutions/healthcare/index.html" || f === "cases/hospital-health-kepu-workflow/index.html"
);
const medKey = "不构成临床诊断、治疗建议或医疗广告";
for (const f of medicalPages) {
  const html = fs.readFileSync(path.join(dist, f), "utf8");
  if (!html.includes("健康科普") || !html.includes(medKey)) {
    logErr(f + "：医疗合规提示组件缺失或不完整");
  }
}
// 表单页完整性（需求 §9.2 / §10）
for (const f of ["trial/index.html", "demo/index.html", "partners/index.html"]) {
  const html = fs.readFileSync(path.join(dist, f), "utf8");
  if (!html.includes('data-lead-form') || !html.includes('name="privacy"') || !html.includes("隐私政策")) {
    logErr(f + "：表单要素不完整（data-lead-form/privacy/隐私政策链接）");
  }
  if (!html.includes('name="submission_id"')) logErr(f + "：缺少 submission_id（幂等要求，设计 §4.3）");
}

// sitemap / robots
const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]);
for (const url of locs) {
  const file = urlToFile(url.replace(site.domain, ""));
  if (!exists(file)) logErr("sitemap 指向不存在页面：" + url);
}
const expected = htmlFiles.length - (htmlFiles.includes("404.html") ? 1 : 0);
if (locs.length !== expected) logErr("sitemap 条目数 " + locs.length + " ≠ 已发布页面数 " + expected);
if (!fs.existsSync(path.join(dist, "robots.txt"))) logErr("缺少 robots.txt");
else {
  const robots = fs.readFileSync(path.join(dist, "robots.txt"), "utf8");
  if (!robots.includes("sitemap.xml")) logErr("robots.txt 未声明 sitemap");
}
if (!fs.existsSync(path.join(dist, "404.html"))) logErr("缺少 404.html");

// 内容源禁止词（source of truth 同样扫描；否定语境/合规披露上下文豁免）
const contentDir = path.join(root, "content");
const NEG2 = /(不构成|并非|不是|不含|不得|禁止|勿|请勿|不代表|不提供|暂不|避免|无法核验|不建议|不作为|不等于|不可用)/;
for (const f of fs.readdirSync(contentDir).filter((x) => x.endsWith(".js"))) {
  const raw = fs.readFileSync(path.join(contentDir, f), "utf8");
  const text = raw.replace(/^\s*\/\/.*$/gm, " "); // 去注释（注释仅作文档引用）
  for (const phrase of site.compliance.forbidden) {
    let idx = text.indexOf(phrase);
    while (idx !== -1) {
      const before = text.slice(Math.max(0, idx - 20), idx);
      if (NEG2.test(before)) { idx = text.indexOf(phrase, idx + 1); continue; }
      logErr("content/" + f + "：命中禁止词「" + phrase + "」");
      break;
    }
  }
}

console.log("检查 " + htmlFiles.length + " 个 HTML 文件。");
console.log("错误 " + errors.length + " 项；告警 " + warns.length + " 项。");
for (const e of errors) console.error(" [错误] " + e);
for (const w of warns) console.warn(" [告警] " + w);
process.exit(errors.length ? 1 : 0);
