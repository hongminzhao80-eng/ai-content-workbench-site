/* ============================================================================
 * 便捷部署 admin-leads 云函数（自动注入真实管理口令，仓库内不留明文）
 * 用法：node scripts/deploy-admin.mjs [环境ID]
 * 前提：根目录存在 .admin-key（gitignored，含真实口令）；已 tcb login
 * ========================================================================== */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envId = process.argv[2] || "gzzhm518-d2g3ba6o6ecfb077f";
const cfgPath = path.join(root, "cloudbaserc.json");
const keyPath = path.join(root, ".admin-key");

if (!fs.existsSync(keyPath)) {
  console.error("未找到 .admin-key（请先创建并写入管理口令，勿提交到仓库）");
  process.exit(1);
}
const key = fs.readFileSync(keyPath, "utf8").trim();
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const fn = (cfg.functions || []).find((f) => f.name === "admin-leads");
if (!fn) { console.error("cloudbaserc.json 缺少 admin-leads 配置"); process.exit(1); }

// 注入真 key（内存态，不落盘）
fn.envVariables = fn.envVariables || {};
const hadKey = fn.envVariables.ADMIN_KEY;
fn.envVariables.ADMIN_KEY = key;

try {
  const r = spawnSync("tcb", ["fn", "deploy", "admin-leads", "-e", envId], {
    cwd: root,
    encoding: "utf8",
    timeout: 240000,
    stdio: "inherit",
    env: { ...process.env }
  });
  if (r.status !== 0) {
    console.error("部署失败，请确认已 tcb login 且环境正确：" + envId);
    process.exit(r.status || 1);
  }
  console.log("admin-leads 部署完成。");
} finally {
  // 还原占位（不写入真 key）
  fn.envVariables.ADMIN_KEY = hadKey || "REPLACE_BEFORE_DEPLOY";
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + "\n", "utf8");
  console.log("cloudbaserc.json 已还原（不含明文口令）。");
}
