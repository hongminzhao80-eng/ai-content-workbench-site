// ============================================================================
// 构建脚本：内容 + 模板 → dist/ 纯静态站点（零依赖；Node >= 18）
// 用法：node scripts/build.mjs
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { allPages } from "../lib/pages.mjs";
import { site } from "../site.config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const src = path.join(root, "src");
const LAST_MOD = "2026-09-30"; // 与内容时间线一致；上线后由运营更新

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const pages = allPages();
const written = [];
const placeholderWarn = { files: 0, markers: 0 };

for (const p of pages) {
  const file = path.join(dist, p.file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, p.html, "utf8");
  const markers = (p.html.match(/\[上线前替换/g) || []).length;
  if (markers > 0) { placeholderWarn.files++; placeholderWarn.markers += markers; }
  written.push({ url: p.url, file: p.file });
}

// 静态资源（目录递归复制；styles/js 从 src 复制，assets 整体复制）
const copyDir = (from, toDir) => {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(toDir, { recursive: true });
  for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, ent.name);
    const d = path.join(toDir, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
};
copyDir(path.join(src, "styles"), path.join(dist, "styles"));
copyDir(path.join(src, "js"), path.join(dist, "js"));
copyDir(path.join(src, "assets"), path.join(dist, "assets"));
// sitemap.xml（只收录已发布页面，404/预览类不收录）
const publicPages = pages.filter((p) => p.url !== "/404.html");
const loc = publicPages.map((p) => "  <url><loc>" + site.domain + p.url + "</loc><lastmod>" + LAST_MOD + "</lastmod></url>").join("\n");
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + loc + "\n</urlset>\n",
  "utf8"
);

// robots.txt（设计 §8.2：管理/预览/内部路径不入站；后端接入时启用对应 Disallow）
fs.writeFileSync(
  path.join(dist, "robots.txt"),
  "User-agent: *\nAllow: /\n\nSitemap: " + site.domain + "/sitemap.xml\n\n# 上线接入 CMS/管理端后，请追加：\n# Disallow: /admin\n# Disallow: /api/admin\n",
  "utf8"
);

console.log("构建完成：共生成 " + pages.length + " 个页面（含 404）→ dist/");
for (const w of written) console.log("  " + (w.url === "/404.html" ? "/404.html" : w.url) + "  →  " + w.file);
console.log("占位标记：[上线前替换] 出现于 " + placeholderWarn.files + " 个文件、共 " + placeholderWarn.markers + " 处（替换清单见 README）");
console.log("注意：正式域名 canonical/sitemap 当前使用占位域 " + site.domain + "（site.config.js → domain）");
